import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import Fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './config/env.js'
import { transcriptionRoutes } from './routes/transcriptions.js'
import { fail, ok } from './utils/api.js'

export function buildApp() {
  const app = Fastify({ logger: true })
  app.register(cors, { origin: env.CORS_ORIGIN })
  app.register(multipart, { limits: { fileSize: 100 * 1024 * 1024, files: 1 } })
  app.get('/api/health', async (_request, reply) => ok(reply, { status: 'ok' }))
  app.register(transcriptionRoutes, { prefix: '/api/transcriptions' })
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) return fail(reply, 400, 'Invalid request.')
    app.log.error(error)
    return fail(reply, 500, 'Internal server error.')
  })
  return app
}
