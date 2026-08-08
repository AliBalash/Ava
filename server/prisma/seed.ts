import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
await prisma.user.upsert({
  where: { email: 'demo@ava.local' },
  update: {},
  create: { email: 'demo@ava.local', name: 'Demo User' },
})
await prisma.$disconnect()
