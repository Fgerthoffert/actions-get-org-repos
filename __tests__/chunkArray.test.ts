/**
 * Unit tests for src/utils/chunkArray.ts
 */

import { chunkArray } from '../src/utils'
import { expect } from '@jest/globals'

describe('chunkArray', () => {
  it('should return an empty array when input array is empty', () => {
    const result = chunkArray([], 3)
    expect(result).toEqual([])
  })

  it('should return the same array when chunk size is greater than array length', () => {
    const result = chunkArray(['a', 'b'], 5)
    expect(result).toEqual([['a', 'b']])
  })

  it('should return chunks of the specified size', () => {
    const result = chunkArray(['a', 'b', 'c', 'd'], 2)
    expect(result).toEqual([
      ['a', 'b'],
      ['c', 'd']
    ])
  })

  it('should handle arrays not exactly divisible by chunk size', () => {
    const result = chunkArray(['a', 'b', 'c', 'd', 'e'], 2)
    expect(result).toEqual([['a', 'b'], ['c', 'd'], ['e']])
  })

  it('should return each element as a chunk when chunk size is 1', () => {
    const result = chunkArray(['a', 'b', 'c'], 1)
    expect(result).toEqual([['a'], ['b'], ['c']])
  })
})
