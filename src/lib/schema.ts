import { z } from 'zod'

export const executeAgentSchema = z.object({
  agentName: z.string(),
  description: z.string(),
  cost: z.string(),
  can: z.array(z.string()),
  cannot: z.array(z.string()),
})
