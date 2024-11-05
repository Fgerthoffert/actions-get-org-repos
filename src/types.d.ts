interface RateLimit {
  limit: number
  cost: number
  remaining: number
  resetAt: string | null
}

interface RateLimitResponse {
  rateLimit: RateLimit
}

interface GhNode {
  totalCount: number
  edges: {
    cursor: string
    node: Repo
  }[]
}

interface GitHubNode {
  id: string
}

interface BaseQueryResponse {
  rateLimit: RateLimit
  viewer?: {
    ghNode: GhNode
  }
  node?: {
    ghNode: GhNode
  }
  nodes?: GitHubNode[]
}

interface Org {
  name: string
  login: string
  id: string
}

interface OrgResponse {
  organization: Org
  rateLimit: RateLimit
}

interface Repo {
  id: string
  name: string
  isArchived: boolean
  repositoryTopics: {
    totalCount: number
    edges: {
      node: {
        topic: {
          name: string
        }
      }
    }[]
  }
}

interface GraphQLApiResponse {
  data: {
    rateLimit: RateLimit
  }
}
