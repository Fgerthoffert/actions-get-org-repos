import * as core from '@actions/core'

import * as path from 'path'
import * as fs from 'fs'
import os from 'os'

import { getOrgByName, getOrgRepos, getRepos, getRateLimit } from './graphql'
import { fetchNodesByQuery, fetchNodesByIds } from './queries'
import {
  timeSinceStart,
  formatDate,
  ghClient,
  graphqlQuery,
  filterRepos,
  uploadArtifact,
  processRateLimit
} from './utils'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const startTime = new Date()
    core.info(`Started job at: ${formatDate(startTime)}`)

    const gClient = ghClient(core.getInput('token'))

    // Perform a query to check the rate limit for the current user
    const rateLimitResponse: RateLimitResponse =
      await graphqlQuery<RateLimitResponse>({
        client: gClient,
        query: getRateLimit,
        variables: null
      })
    await processRateLimit(rateLimitResponse.rateLimit)

    // Find the GitHub org by name
    // This also useful to verify that the org actually exists
    const orgResponse: OrgResponse = await core.group(
      `${timeSinceStart(startTime)} 🗒️ Verifying org: ${core.getInput('org')}`,
      async () => {
        const orgResponse: OrgResponse = await graphqlQuery<OrgResponse>({
          client: gClient,
          query: getOrgByName,
          variables: { orgName: core.getInput('org') },
          rateLimit: rateLimitResponse.rateLimit
        })
        if (orgResponse.organization === null) {
          throw new Error(
            `Organization not found: ${core.getInput('org')}, check your token and the provided org name`
          )
        } else {
          core.info(
            `Organization found: ${orgResponse.organization.login}, with ID: ${orgResponse.organization.id}`
          )
        }
        return orgResponse
      }
    )

    // Fetch all repositories from the GitHub org
    // Only fetching a limited set of data to avoid hitting the rate limit from the start
    const sourceRepos: Repo[] = await core.group(
      `${timeSinceStart(startTime)} 📠 Initial fetch of all repositories`,
      async () => {
        core.info(
          `Fetching Repos from GitHub org: ${core.getInput('org')} withn ID: ${orgResponse.organization.id} using query increment: ${core.getInput('max_query_nodes')}`
        )
        const fetchReposData: Repo[] = await fetchNodesByQuery<Repo[]>({
          ghClient: gClient,
          graphQLQuery: getOrgRepos,
          queryParams: { orgId: orgResponse.organization.id },
          maxNodes: parseInt(core.getInput('max_query_nodes'), 10),
          rateLimit: orgResponse.rateLimit
        })
        return fetchReposData
      }
    )

    // Filter the repositories based on the input parameters
    core.info(
      `GitHub Org: ${orgResponse.organization.login} contains a total of ${sourceRepos.length} repositories`
    )
    const filteredRepos = filterRepos({
      repos: sourceRepos,
      filterTopics:
        core.getInput('filter_topics').length > 0
          ? core.getInput('filter_topics').split(',')
          : [],
      filterOperator: core.getInput('filter_operator'),
      filterIgnoreArchived: core.getInput('filter_ignore_archived') === 'true'
    })

    core.info(
      `After filtering, additional data will be fetched about ${filteredRepos.length} repositories`
    )

    const fetchedRepos: Repo[] = await core.group(
      `${timeSinceStart(startTime)} 📠 Fetching data from all ${filteredRepos.length} repositories`,
      async () => {
        const fetchReposData: Repo[] = await fetchNodesByIds<Repo[]>({
          ghClient: gClient,
          githubIds: filteredRepos.map(r => r.id),
          graphQLQuery: getRepos,
          maxNodes: parseInt(core.getInput('max_query_nodes'), 10),
          rateLimit: orgResponse.rateLimit
        })
        return fetchReposData
      }
    )

    const tmpFilename = core.getInput('artifact_filename')
    const tmpPath = os.tmpdir()
    const tmpFilepath = path.join(tmpPath, tmpFilename)

    for (const repoObj of fetchedRepos) {
      fs.writeFileSync(
        tmpFilepath,
        JSON.stringify({
          ...repoObj,
          fetchedAt: new Date().toISOString()
        }) + '\n',
        { flag: 'a' }
      )
    }
    core.info(`List of repositories saved to: ${tmpFilepath}`)

    await core.group(
      `${timeSinceStart(startTime)} 🗄️ Uploading artifacts to GitHub infrastructure`,
      async () => {
        await uploadArtifact({
          artifactName: core.getInput('artifact_name'),
          artifactPath: tmpPath,
          artifactFilename: tmpFilename,
          retentionDays: parseInt(core.getInput('artifact_retention_days'), 10)
        })

        core.setOutput('artifact_filepath', tmpFilepath)
      }
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
