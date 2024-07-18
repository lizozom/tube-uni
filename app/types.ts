export interface TubeStation {
    name: string;
    tla: string;
}

export interface PodcastResponse {
    audioFile: string;
    script: string;
    errorCode?: string;
}

export interface PodcastRecord {
    title: string;
    duration: string;
    createDate: string;
    url: string;
  }
  