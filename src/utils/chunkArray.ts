// https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
/**
 * Splits an array into chunks of a specified size.
 *
 * @param srcArray - The array to be split into chunks.
 * @param chunkSize - The size of each chunk.
 * @returns An array of arrays, where each sub-array is a chunk of the original array.
 */
export const chunkArray = (
  srcArray: string[],
  chunkSize: number
): string[][] => {
  let idx = 0
  const tmpArray = []
  for (idx = 0; idx < srcArray.length; idx += chunkSize) {
    tmpArray.push(srcArray.slice(idx, idx + chunkSize))
  }
  return tmpArray
}
export default chunkArray
