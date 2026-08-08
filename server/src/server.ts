import { buildApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './db/prisma.js'

const app = buildApp()
const close = async () => { await app.close(); await prisma.$disconnect() }
process.on('SIGINT', close)
process.on('SIGTERM', close)
await app.listen({ port: env.PORT, host: '0.0.0.0' })
