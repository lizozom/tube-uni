export const prompt = (topic: string) => `
    Give me a list of AT MOST 3 relevant wikipedia page for the topic "${topic}". 
    Return the response as a YAML.

    - "Topic A"
    - "Topic B"
    - "Topic C"
`