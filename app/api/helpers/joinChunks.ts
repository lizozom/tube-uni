export const joinChunksWithSSML = (chunks: string[]): string => {
    return `<speak>${chunks.join('<break time="500ms" />')}</speak>`;
}