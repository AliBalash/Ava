export type TranscriptionSegment = {
  start: string
  end: string
  text: string
}

export type ArchiveRequestItem = {
  id: number
  filename: string
  media_url: string
  url?: string
  duration: string
  processed: string
  segments: TranscriptionSegment[]
}

export type TranscribeResultItem = {
  download_url?: string
  duration?: string
  segments?: TranscriptionSegment[]
  message?: string
}
