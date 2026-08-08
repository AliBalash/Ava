import type { Prisma, Transcription } from '@prisma/client'
import { prisma } from '../db/prisma.js'

const demoUserEmail = 'demo@ava.local'

export type Segment = { start: string; end: string; text: string }

export function toApiTranscription(item: Transcription) {
  const segments = Array.isArray(item.segments) ? item.segments as unknown as Segment[] : []
  return {
    id: item.id,
    filename: item.fileName,
    media_url: item.sourceUrl ?? '',
    url: item.sourceUrl ?? undefined,
    duration: item.duration ?? '',
    processed: item.createdAt.toISOString(),
    segments,
    status: item.status,
    language: item.language,
  }
}

async function demoUser() {
  return prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: { email: demoUserEmail, name: 'Demo User' },
  })
}

export async function listTranscriptions(search?: string) {
  const where: Prisma.TranscriptionWhereInput = search
    ? { OR: [{ fileName: { contains: search, mode: 'insensitive' } }, { sourceUrl: { contains: search, mode: 'insensitive' } }] }
    : {}
  const records = await prisma.transcription.findMany({ where, orderBy: { createdAt: 'desc' } })
  return records.map(toApiTranscription)
}

export async function getTranscription(id: string) {
  const record = await prisma.transcription.findUnique({ where: { id } })
  return record ? toApiTranscription(record) : null
}

export async function createTranscription(input: { fileName: string; sourceUrl?: string; language: string }) {
  const user = await demoUser()
  const record = await prisma.transcription.create({
    data: {
      userId: user.id,
      fileName: input.fileName,
      originalFileName: input.fileName,
      sourceUrl: input.sourceUrl,
      language: input.language,
      status: 'completed',
      duration: '0:00:00',
      text: '',
      segments: [],
    },
  })
  return toApiTranscription(record)
}

export async function deleteTranscription(id: string) {
  try {
    await prisma.transcription.delete({ where: { id } })
    return true
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2025') return false
    throw error
  }
}
