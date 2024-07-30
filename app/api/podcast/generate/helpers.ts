export const WORDS_PER_MINUTE = 160

const getTotalWords = (durationSec: number): number => {
  return durationSec / 60 * WORDS_PER_MINUTE
}

// Outro should be at most 1 minute and less than 10% of the total duration
// If the podcast is 5 minutes, the Outro would be 0.5 minutes
// If the podcast is 10 minutes, the Outro would be 1 minute
// If the podcast is 30 minutes, the Outro would still be 1 minutes
export const getOutroLengthInWords = (durationSec: number): number => {
  const desiredWords = getTotalWords(durationSec)
  return Math.min(WORDS_PER_MINUTE, desiredWords * 0.1)
}

export const getIntroLengthInWords = (durationSec: number): number => {
  const desiredWords = getTotalWords(durationSec)
  return Math.min(40, desiredWords * 0.1)
}

export const getContentChunkLengthInWords = (durationSec: number, topics: any[]): number => {
  const contentDuration = getTotalContentLengthInWords(durationSec)
  return Math.floor(contentDuration / (topics.length - 2))
}

export const getTotalContentLengthInWords = (durationSec: number): number => {
  const totalWords = getTotalWords(durationSec)
  return totalWords - getOutroLengthInWords(durationSec) - getIntroLengthInWords(durationSec)
}
