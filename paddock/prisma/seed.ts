import * as bcrypt from 'bcrypt'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import { PrismaClient } from '../src/generated/prisma/client.js'

config()

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Configure your database connection before running the seed. See .env.example for an example.')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
})

async function main() {
  const users = [
    {
      email: 'admin@paddock.md',
      password: 'Admin123',
      firstName: 'Administrator',
      lastName: 'Administrator',
      role: 'ADMIN' as const,
    },
    {
      email: 'moderator@paddock.md',
      password: 'Moderator123',
      firstName: 'Moderator',
      lastName: 'Moderator',
      role: 'MODERATOR' as const,
    },
    {
      email: 'user@paddock.md',
      password: 'User123',
      firstName: 'User',
      lastName: 'User',
      role: 'USER' as const,
    },
  ]

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)

    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        password: hashedPassword,
        role: user.role as any,
      },
      create: {
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any,
      },
    })

    console.log(`Seeded user: ${createdUser.email} (${createdUser.role})`)
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
