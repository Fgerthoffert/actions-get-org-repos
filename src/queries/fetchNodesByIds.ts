import * as core from '@actions/core'
import { DocumentNode } from 'apollo-link/lib/types'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'

import { sleep, chunkArray } from '../utils'
import { graphqlQuery } from './'

/**
 * Fetches nodes from GitHub by their IDs using GraphQL queries.
 *
 * This assumes all records to fetched are known by their id, which it then fetchs in chunks of maxNodes.
 *
 * @template T - The type of the returned nodes.
 * @param {Object} params - The parameters for the function.
 * @param {ApolloClient<NormalizedCacheObject>} params.ghClient - The Apollo client instance for making GraphQL requests.
 * @param {string[]} params.githubIds - An array of GitHub node IDs to fetch.
 * @param {DocumentNode} params.graphQLQuery - The GraphQL query document to execute.
 * @param {number} params.maxNodes - The maximum number of nodes to fetch in a single request.
 * @param {RateLimit} [params.rateLimit={ limit: 5000, cost: 1, remaining: 5000, resetAt: null }] - The rate limit information for the API calls.
 * @returns {Promise<T>} A promise that resolves to the fetched nodes.
 * @throws Will throw an error if the API call fails after the maximum number of retries.
 */
export const fetchNodesByIds = async <T>({
  ghClient,
  githubIds,
  graphQLQuery,
  maxNodes,
  rateLimit = {
    limit: 5000,
    cost: 1,
    remaining: 5000,
    resetAt: null
  }
}: {
  ghClient: ApolloClient<NormalizedCacheObject>
  githubIds: string[]
  graphQLQuery: DocumentNode
  maxNodes: number
  rateLimit: RateLimit
}): Promise<T> => {
  // After 3 consecutive API calls failures, stop the process with an error
  const maxRetries = 3

  const idsChunks = chunkArray(githubIds, maxNodes)

  let fetchedNodes: GitHubNode[] = []

  for (const idsChunk of idsChunks) {
    let retries = 0
    let updatedData: GitHubNode[] = []
    while (updatedData.length === 0 && retries < maxRetries) {
      core.info(
        `Loading ${idsChunk.length} repos from GitHub ${fetchedNodes.length + idsChunk.length} / ${githubIds.length} ${retries > 0 ? ' - API error, retry: ' + retries + '/' + maxRetries : ''}`
      )
      const t0 = performance.now()

      await graphqlQuery<BaseQueryResponse>({
        client: ghClient,
        query: graphQLQuery,
        variables: { nodesArray: idsChunk },
        rateLimit: rateLimit
      }).then((response: BaseQueryResponse) => {
        const t1 = performance.now()
        const callDuration = t1 - t0
        rateLimit = response.rateLimit
        if (
          response !== undefined &&
          response.nodes !== undefined &&
          response.nodes.length > 0
        ) {
          const apiPerf = Math.round(
            response.nodes.length / (callDuration / 1000)
          )
          core.info('Fetched data at: ' + apiPerf + ' nodes/s')
          updatedData = response.nodes
        }
      })

      retries++
    }
    fetchedNodes = [...fetchedNodes, ...updatedData]
    //Wait for 1 second between all repos fetch
    await sleep(1000)
  }

  return fetchedNodes as T
}
