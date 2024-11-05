/**
 * Unit tests for src/filterRepos.ts
 */

import { filterRepos } from '../src/utils/filterRepos'
import { expect } from '@jest/globals'

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

const repos: Repo[] = [
  {
    id: 'a',
    name: 'repo1',
    isArchived: true,
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        }
      ]
    }
  },
  {
    id: 'b',
    name: 'repo2',
    isArchived: false,
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        },
        {
          node: {
            topic: { name: 'topic2' }
          }
        }
      ]
    }
  },
  {
    id: 'c',
    name: 'repo3',
    isArchived: false,
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        },
        {
          node: {
            topic: { name: 'topic2' }
          }
        }
      ]
    }
  },
  {
    id: 'd',
    name: 'repo4',
    isArchived: false,
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        },
        {
          node: {
            topic: { name: 'topic3' }
          }
        }
      ]
    }
  },
  {
    id: 'e',
    name: 'repo5',
    isArchived: false,
    repositoryTopics: {
      totalCount: 0,
      edges: []
    }
  },
  {
    id: 'f',
    name: 'repo6',
    isArchived: true,
    repositoryTopics: {
      totalCount: 0,
      edges: []
    }
  }
]

describe('filterRepos.ts', () => {
  it('Do not perform any filtering', () => {
    let filteredRepos: Repo[] = filterRepos({
      repos: repos,
      filterTopics: [],
      filterOperand: 'AND',
      filterIgnoreArchived: false
    })
    expect(filteredRepos.length).toEqual(repos.length)

    filteredRepos = filterRepos({
      repos: repos,
      filterTopics: [],
      filterOperand: 'OR',
      filterIgnoreArchived: false
    })
    expect(filteredRepos.length).toEqual(repos.length)
  })

  it('Only return repos without topics and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY'],
      filterOperand: 'OR',
      filterIgnoreArchived: true
    })
    expect(filteredRepos.length).toEqual(1)
  })

  it('Only return repos without topics, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY'],
      filterOperand: 'OR',
      filterIgnoreArchived: false
    })
    expect(filteredRepos.length).toEqual(2)
  })

  it('Filter out archived repos', () => {
    const filteredRepos: Repo[] = filterRepos({
      repos: repos,
      filterTopics: [],
      filterOperand: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.filter(r => r.isArchived === true).length).toEqual(0)
    expect(
      filteredRepos.filter(r => r.isArchived === false).length
    ).toBeGreaterThan(0)
  })

  it('All repos containing topic1 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1'],
      filterOperand: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(3)
  })

  it('All repos containing topic1, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1'],
      filterOperand: 'AND',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(4)
  })

  it('All repos containing topic1 or topic3 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperand: 'OR',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(3)
  })

  it('All repos containing topic1 or topic3, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperand: 'OR',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(4)
  })

  it('All repos containing topic1 and topic2 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic2'],
      filterOperand: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(2)
  })

  it('All repos containing topic1 and topic2, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic2'],
      filterOperand: 'AND',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(2)
  })

  it('All repos containing topic1 and topic3 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperand: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(1)
  })

  it('All repos containing topic1 and topic3, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperand: 'AND',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(1)
  })

  it('All repos containing topic3 OR no topic and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY', 'topic3'],
      filterOperand: 'OR',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(2)
  })

  it('All repos containing topic3 OR no topic , archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY', 'topic3'],
      filterOperand: 'OR',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(3)
  })
})
