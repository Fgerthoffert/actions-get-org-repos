import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { ApolloLink, concat } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'

/**
 * Creates an Apollo Client instance configured to interact with the GitHub GraphQL API.
 *
 * @param githubToken - The GitHub token used for authorization.
 * @returns An instance of ApolloClient configured with the provided GitHub token.
 */
export const ghClient = (
  githubToken: string
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = new HttpLink({
    uri: 'https://api.github.com/graphql',
    fetch: fetch as any // eslint-disable-line
  })
  const cache = new InMemoryCache({
    addTypename: false
  })
  // eslint-disable-next-line
  const authMiddleware = new ApolloLink((operation: any, forward: any) => {
    // add the authorization to the headers
    // eslint-disable-next-line
    operation.setContext({
      headers: {
        authorization: githubToken ? `Bearer ${githubToken}` : ''
      }
    })
    // eslint-disable-next-line
    return forward(operation).map(
      (response: {
        errors: object[] | undefined
        data: { errors: object[] }
      }) => {
        if (response.errors !== undefined && response.errors.length > 0) {
          response.data.errors = response.errors
        }
        return response
      }
    )
  })

  return new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache
  })
}