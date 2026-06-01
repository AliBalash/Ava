import type { ArchiveRequestItem, TranscriptionSegment } from '../api/types'

export function formatProcessedDate(input: string): string {
  if (!input.includes('T')) {
    return input
  }

  const date = new Date(input)

  if (Number.isNaN(date.getTime())) {
    return input
  }

  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function fileExtension(name: string): string {
  const dotIndex = name.lastIndexOf('.')

  if (dotIndex === -1) {
    return '-'
  }

  return name.slice(dotIndex)
}

export function buildSimpleTranscript(segments: TranscriptionSegment[]): string {
  const combined = segments
    .map((segment) => segment.text.trim())
    .filter((text) => text.length > 0)
    .join(' ')

  return combined.length > 0 ? combined : 'متن قابل نمایشی از گفتار دریافت نشد.'
}

export function archiveDuration(item: ArchiveRequestItem): string {
  if (!item.duration || item.duration.trim().length === 0) {
    return '-'
  }

  return item.duration
}
