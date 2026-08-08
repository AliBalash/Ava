import { apiRequest } from './client'
import type { ArchiveRequestItem, TranscribeResultItem } from './types'

export type ApiLanguageCode = 'fa' | 'en'

export function fetchRequests(): Promise<ArchiveRequestItem[]> {
  return apiRequest<ArchiveRequestItem[]>('/api/transcriptions')
}

export function fetchRequestDetail(id: string): Promise<ArchiveRequestItem> {
  return apiRequest<ArchiveRequestItem>(`/api/transcriptions/${id}`)
}

export function searchRequests(query: string): Promise<ArchiveRequestItem[]> {
  return apiRequest<ArchiveRequestItem[]>(`/api/transcriptions?search=${encodeURIComponent(query)}`)
}

export function transcribeFromMediaUrl(
  mediaUrl: string,
  language: ApiLanguageCode = 'fa'
): Promise<TranscribeResultItem[]> {
  return apiRequest<TranscribeResultItem[]>('/api/transcriptions', {
    method: 'POST',
    body: JSON.stringify({
      sourceUrl: mediaUrl,
      language,
    }),
  })
}

export function transcribeFromMediaFile(
  mediaFile: File,
  language: ApiLanguageCode = 'fa'
): Promise<TranscribeResultItem[]> {
  const formData = new FormData()
  formData.append('media', mediaFile)
  formData.append('language', language)

  return apiRequest<TranscribeResultItem[]>('/api/transcriptions', {
    method: 'POST',
    body: formData,
  })
}

export function deleteRequest(id: string): Promise<unknown> {
  return apiRequest<unknown>(`/api/transcriptions/${id}`, {
    method: 'DELETE',
  })
}
