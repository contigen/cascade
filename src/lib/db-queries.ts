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

export async function getOrCreateAgent(data: {
  name: string
  description: string
  cost: string
  can: string[]
  cannot: string[]
}) {
  return withTryCatch(async () => {
    return prisma.agent.upsert({
      where: { name: data.name },
      update: {},
      create: {
        name: data.name,
        description: data.description,
        cost: data.cost,
        can: data.can,
        cannot: data.cannot,
      },
    })
  })
}

export async function getAllAgents() {
  return withTryCatch(async () => {
    return prisma.agent.findMany({
      orderBy: { createdAt: 'asc' },
    })
  })
}

export async function getUserSubscriptions(userId: string) {
  return withTryCatch(async () => {
    return prisma.subscription.findMany({
      where: { userId },
      include: {
        agent: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  })
}

export async function createSubscription(data: {
  userId: string
  agentId: string
  sessionAddress: string
  permissionContext: string
  delegationManager: string
  chainId: string
}) {
  return withTryCatch(async () => {
    return prisma.subscription.create({
      data,
      include: {
        agent: true,
      },
    })
  })
}

export async function getSubscription(userId: string, agentId: string) {
  return withTryCatch(async () => {
    return prisma.subscription.findFirst({
      where: {
        userId,
        agentId,
      },
      include: {
        agent: true,
      },
    })
  })
}

export async function getSubscriptionById(id: string) {
  return withTryCatch(async () => {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        agent: true,
        user: true,
      },
    })
  })
}

export async function updateSubscriptionStatus(id: string, status: string) {
  return withTryCatch(async () => {
    return prisma.subscription.update({
      where: { id },
      data: { status },
      include: {
        agent: true,
      },
    })
  })
}

export async function createAgentLog(data: {
  subscriptionId: string
  agentName: string
  action: string
  status: string
  transactionHash?: string
  gasUsed?: string
  error?: string
  metadata?: Record<string, unknown>
}) {
  return withTryCatch(async () => {
    return prisma.agentLog.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    })
  })
}

export async function getAgentLogsByUser(userId: string) {
  return withTryCatch(async () => {
    return prisma.agentLog.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      include: {
        subscription: {
          include: {
            agent: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })
  })
}

export async function getAgentLogsBySubscription(subscriptionId: string) {
  return withTryCatch(async () => {
    return prisma.agentLog.findMany({
      where: {
        subscriptionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })
  })
}
