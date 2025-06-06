import gql from 'graphql-tag'

/**
 * GraphQL query to fetch detailed information about repositories.
 *
 * @param {Array<ID>} nodesArray - An array of repository IDs to fetch information for.
 *
 * @returns {Object} The detailed information about the specified repositories.
 */
export const getRepos = gql`
  query ($nodesArray: [ID!]!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    nodes(ids: $nodesArray) {
      ... on Repository {
        branchProtectionRules(first: 5) {
          totalCount
          edges {
            node {
              id
              databaseId
              isAdminEnforced
              pattern
              requiredApprovingReviewCount
              requiredStatusCheckContexts
              requiresApprovingReviews
              requiresCodeOwnerReviews
              requiresCommitSignatures
              requiresStatusChecks
              requiresStrictStatusChecks
              restrictsPushes
              restrictsReviewDismissals
            }
          }
        }
        codeOfConduct {
          id
          key
          name
          body
          url
        }
        createdAt
        databaseId
        defaultBranchRef {
          id
          name
          prefix
        }
        description
        diskUsage
        forkCount
        hasIssuesEnabled
        hasWikiEnabled
        id
        isArchived
        isDisabled
        isFork
        isLocked
        isMirror
        isPrivate
        isTemplate
        issues(first: 1, orderBy: { field: UPDATED_AT, direction: DESC }) {
          totalCount
          edges {
            node {
              id
              updatedAt
            }
          }
        }
        labels(first: 1) {
          totalCount
        }
        languages(first: 10) {
          totalCount
          edges {
            node {
              color
              id
              name
            }
          }
        }
        licenseInfo {
          key
          name
          nickname
          spdxId
          url
        }
        milestones(first: 1) {
          totalCount
        }
        name
        nameWithOwner
        owner {
          id
          login
          url
        }
        primaryLanguage {
          id
          color
          name
        }
        pullRequests(
          first: 1
          orderBy: { field: UPDATED_AT, direction: DESC }
        ) {
          totalCount
          edges {
            node {
              id
              updatedAt
            }
          }
        }
        pushedAt
        rebaseMergeAllowed
        refs(
          first: 1
          refPrefix: "refs/heads/"
          orderBy: { field: TAG_COMMIT_DATE, direction: DESC }
        ) {
          totalCount
          edges {
            node {
              name
              target {
                ... on Commit {
                  id
                  pushedDate
                  author {
                    date
                    email
                    user {
                      name
                      login
                      id
                    }
                  }
                }
              }
            }
          }
        }
        tags: refs(
          refPrefix: "refs/tags/"
          first: 30
          orderBy: { field: TAG_COMMIT_DATE, direction: DESC }
        ) {
          nodes {
            name
            target {
              ... on Commit {
                committedDate
              }
              ... on Tag {
                tagger {
                  date
                  email
                  name
                }
              }
            }
          }
        }
        recentCommitsMaster: ref(qualifiedName: "master") {
          name
          target {
            ... on Commit {
              id
              history(first: 5) {
                totalCount
                edges {
                  node {
                    pushedDate
                    messageHeadline
                    author {
                      date
                      email
                      user {
                        name
                        login
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }
        releases(first: 1) {
          totalCount
        }
        repositoryTopics(first: 10) {
          totalCount
          edges {
            node {
              id
              topic {
                id
                name
              }
              url
            }
          }
        }
        squashMergeAllowed
        stargazers(first: 1) {
          totalCount
        }
        templateRepository {
          id
          nameWithOwner
        }
        url
        updatedAt
        vulnerabilityAlerts(first: 1) {
          totalCount
        }
        watchers(first: 1) {
          totalCount
        }
      }
    }
  }
`

export default getRepos
