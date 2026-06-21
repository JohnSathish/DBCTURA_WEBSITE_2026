import { PrismaClient } from '@/lib/prisma-generated/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure database URL uses correct path
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set')
  }
  
  // If it's a relative file path, make it absolute relative to prisma directory
  if (dbUrl.startsWith('file:./')) {
    const dbPath = dbUrl.replace('file:', '').replace(/^\.\//, '')
    // Database is relative to prisma schema directory
    const schemaDir = path.join(process.cwd(), 'prisma')
    const absolutePath = path.resolve(schemaDir, dbPath)
    // Normalize path separators for SQLite on Windows
    const normalizedPath = absolutePath.replace(/\\/g, '/')
    return `file:${normalizedPath}`
  }
  
  return dbUrl
}

export const prisma =
  globalForPrisma.prisma && hasExpectedModels(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : new PrismaClient({
        datasources: {
          db: {
            url: getDatabaseUrl(),
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Recreate client after schema changes during hot reload (dev only). */
function hasExpectedModels(client: PrismaClient): boolean {
  const c = client as PrismaClient & { syllabus?: unknown; questionPaper?: unknown }
  return typeof c.syllabus?.findMany === 'function' && typeof c.questionPaper?.findMany === 'function'
}

