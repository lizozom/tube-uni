export const prompt = (topic: string, maxChapters: number) => `
    Write a topic outline for a podcast about ${topic}.
    First topic is intro, last topic is outro.
    Add ${maxChapters} more topics in between.
    Return the response as a YAML list. 
    Each item should have a topic and a description.
    IMPORTANT! Return ONLY a YAML object. 
    Don't add quotes or comments around it.
  `