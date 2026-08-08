import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createTranscription, deleteTranscription, getTranscription, listTranscriptions } from '../services/transcriptions.js'
import { fail, ok } from '../utils/api.js'

const paramsSchema = z.object({ id: z.string().uuid() })
const createSchema = z.object({ sourceUrl: z.string().url(), language: z.enum(['fa', 'en']) })

export async function transcriptionRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const query = z.object({ search: z.string().trim().max(200).optional() }).safeParse(request.query)
    if (!query.success) return fail(reply, 400, 'Invalid search query.')
    return ok(reply, await listTranscriptions(query.data.search))
  })

  app.get('/:id', async (request, reply) => {
    const params = paramsSchema.safeParse(request.params)
    if (!params.success) return fail(reply, 400, 'Invalid transcription id.')
    const transcription = await getTranscription(params.data.id)
    return transcription ? ok(reply, transcription) : fail(reply, 404, 'Transcription not found.')
  })

  app.post('/', async (request, reply) => {
    if (request.isMultipart()) {
      const file = await request.file()
      if (!file) return fail(reply, 400, 'A media file is required.')
      const languageField = file.fields.language
      const languageValue = Array.isArray(languageField)
        ? languageField[0]?.value
        : languageField && 'value' in languageField
          ? languageField.value
          : undefined
      const language = z.enum(['fa', 'en']).catch('fa').parse(languageValue)
      await file.toBuffer() // Consume the stream; media storage/ASR is intentionally outside this API's scope.
      const transcription = await createTranscription({ fileName: file.filename, language })
      return ok(reply, [transcription], 201)
    }

    const parsed = createSchema.safeParse(request.body)
    if (!parsed.success) return fail(reply, 400, 'A valid sourceUrl and language are required.')
    const name = new URL(parsed.data.sourceUrl).pathname.split('/').pop() || 'linked-media'
    const transcription = await createTranscription({ fileName: name, ...parsed.data })
    return ok(reply, [transcription], 201)
  })

  app.delete('/:id', async (request, reply) => {
    const params = paramsSchema.safeParse(request.params)
    if (!params.success) return fail(reply, 400, 'Invalid transcription id.')
    return (await deleteTranscription(params.data.id)) ? reply.code(204).send() : fail(reply, 404, 'Transcription not found.')
  })
}
