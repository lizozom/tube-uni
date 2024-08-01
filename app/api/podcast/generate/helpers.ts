export const WORDS_PER_MINUTE = 160

const getTotalWords = (durationSec: number): number => {
  return durationSec / 60 * WORDS_PER_MINUTE
}

// Intro \ outro should be at most 1 minute and less than 10% of the total duration
// If the podcast is 5 minutes, the intro would be 0.5 minutes
// If the podcast is 10 minutes, the intro would be 1 minute
// If the podcast is 30 minutes, the intro would still be 1 minutes
export const getIntroLengthInWords = (durationSec: number): number => {
  const desiredWords = getTotalWords(durationSec)
  return Math.min(WORDS_PER_MINUTE, desiredWords * 0.1)
}

export const getContentChunkLengthInWords = (durationSec: number, topics: any[]): number => {
  const contentDuration = getTotalContentLengthInWords(durationSec)
  return Math.floor(contentDuration / (topics.length - 2))
}

export const getTotalContentLengthInWords = (durationSec: number): number => {
  const totalWords = getTotalWords(durationSec)
  const introOutroDurationWords = getIntroLengthInWords(durationSec)
  return totalWords - 2 * introOutroDurationWords
}
