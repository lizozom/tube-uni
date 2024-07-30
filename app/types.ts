export interface TubeStation {
  name: string
  tla: string
}

export interface PodcastResponse {
  audioFile: string
  script: string
  errorCode?: string
}

export interface PodcastRecord {
  title: string
  duration: number
  createDate: string
  url: string
}
export interface ScriptResponse {
  content: string
  chunks: string[]
}

export interface TopicsResponse {
  storyarc: string
  topics: ScriptTopic[]
}

export interface ScriptTopic {
  topic: string
  description: string
  words?: number
  content?: string
}
