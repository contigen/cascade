import 'server-only'
import { prisma } from './prisma'
import { withTryCatch } from './utils'

export async function createorGetUser(address: string) {
  return withTryCatch(async () => {
    return prisma.user.upsert({
      where: { walletAddress: address },
      update: {},
      create: { walletAddress: address },
    })
  })
}
