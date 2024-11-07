import * as core from '@actions/core'
import * as github from '@actions/github'

import { sleep } from '../utils'

export const getCustomProperties = async <T>({
  authToken,
  repos
}: {
  authToken: string
  repos: Repo[]
}): Promise<T> => {
  const octokit = github.getOctokit(authToken)

  const updatedRepos: Repo[] = []

  for (const repo of repos) {
    core.info(`Fetching custom properties for repo: ${repo.name}`)

    // Octokit has built-in rate throttling, so we don't need to worry about that here
    const customProperties = await octokit.request(
      'GET /repos/{owner}/{repo}/properties/values',
      {
        owner: repo.owner.login,
        repo: repo.name,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    // There are no custom properties in the GraphQL API for the time being
    // But since it might be added in the future, the code is mimicking what the output
    // could look like if it were implemented in the GraphQL API
    const customPropertiesNode: RepoCustomProperties = {
      totalCount: customProperties.data.length,
      edges: customProperties.data.map(
        (property: {
          property_name: string
          value: string | string[] | null
        }) => {
          return {
            node: {
              name: property.property_name,
              values: Array.isArray(property.value)
                ? property.value.filter((v): v is string => v !== null)
                : property.value !== null
                  ? [property.value]
                  : []
            }
          }
        }
      )
    }
    console.log(JSON.stringify(customPropertiesNode))
    updatedRepos.push({
      ...repo,
      customProperties: customPropertiesNode
    })

    await sleep(1000)
  }
  return updatedRepos as T
}
