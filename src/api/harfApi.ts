import { apiRequest } from './client'
import type { ArchiveRequestItem, TranscribeResultItem } from './types'

export type ApiLanguageCode = 'fa' | 'en'

export function fetchRequests(): Promise<ArchiveRequestItem[]> {
  return apiRequest<ArchiveRequestItem[]>('/requests/')
}

export function fetchRequestDetail(id: number): Promise<ArchiveRequestItem> {
  return apiRequest<ArchiveRequestItem>(`/requests/${id}/`)
}

export function searchRequests(query: string): Promise<ArchiveRequestItem[]> {
  return apiRequest<ArchiveRequestItem[]>('/search/', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}

export function transcribeFromMediaUrl(
  mediaUrl: string,
  language: ApiLanguageCode = 'fa'
): Promise<TranscribeResultItem[]> {
  return apiRequest<TranscribeResultItem[]>('/transcribe_files/', {
    method: 'POST',
    body: JSON.stringify({
      media_urls: [mediaUrl],
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

  return apiRequest<TranscribeResultItem[]>('/transcribe_files/', {
    method: 'POST',
    body: formData,
  })
}

export function deleteRequest(id: number): Promise<unknown> {
  return apiRequest<unknown>(`/requests/${id}/`, {
    method: 'DELETE',
  })
}
