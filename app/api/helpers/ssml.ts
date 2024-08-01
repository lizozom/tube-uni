export const joinChunksWithSSML = (chunks: string[]): string => {
  return `<speak>${chunks.join('<break time="500ms" />')}</speak>`
}

export const removeSSMLTags = (str: string) => {
  return str.replace(/<[^>]*>/g, '')
}
