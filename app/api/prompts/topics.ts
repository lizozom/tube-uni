export const prompt = (topic: string, maxChapters: number) => `
    Write a topic outline for a podcast about ${topic}.
    First topic is intro, last topic is outro.
    Add ${maxChapters} more topics in between.
    Each item should have a topic and a description.
    The topic and description should NOT CONTAIN COLONS:

    Please generate a YAML object with the following structure and ensure that no colons are used in any of the values:

    - topic: Intro
      description: ...
    - topic: Topic 1
      description: ...

  `