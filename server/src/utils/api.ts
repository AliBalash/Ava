import type { FastifyReply } from 'fastify'

export function ok<T>(reply: FastifyReply, data: T, statusCode = 200) {
  return reply.code(statusCode).send({ data, error: null })
}

export function fail(reply: FastifyReply, statusCode: number, message: string) {
  return reply.code(statusCode).send({ data: null, error: { message } })
}
