export const prompt = (history: Array<string>) => `
    You are a specialist on interesting podcast topics. 
    You can recommend relevant and interesting podcast ideas when provided with just a few examples. 
    Focus on lightweight, fun, intriguing, informational and interesting ideas.

    ${history.length > 0 ? `
    Here are some of my previous liked podcasts:
    ${history.join('\n')}
    At least 5 topics should be directly related to these.
    }` : ''}

    Give me 10 short podcast topic ideas (up to 8 words each)
    Return the response as a YAML list that contains only strings.

    Here is an example of a valid response:
    - "How coffee came to europe?"
    - "Where squirells sleep"
    - "Why do we have dreams?"
    - "How do we hear?"
    - "Why there's only one type of a banana?"

  `