/**
 * Unit tests for src/utils/getId.ts
 */

import { getId } from '../src/utils'

describe('getId', () => {
  it('should remove special characters and convert to lowercase', () => {
    const input = 'Hello, World! 123'
    const expectedOutput = 'helloworld123'
    const result = getId(input)
    expect(result).toBe(expectedOutput)
  })
})
