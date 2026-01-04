'use client'

import { useState } from 'react'
import { z } from 'zod'
import { LockIcon, ProcessorIcon, ZapIcon } from '@/app/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const AgentLogMetadataSchema = z.looseObject({
  text: z.string().optional(),
  toolCalls: z.array(z.unknown()).optional(),
  toolResults: z.array(z.unknown()).optional(),
  amount: z.string().optional(),
  currentEthRatio: z.string().optional(),
  result: z.unknown().optional(),
})

type LogItemProps = {
  log: {
    id: string
    action: string
    agentName: string
    status: string
    createdAt: Date
    transactionHash?: string | null
    metadata?: string | Record<string, unknown> | null
  }
}

function getLogType(action: string): 'Execution' | 'Safety' | 'Bridging' {
  if (
    action.toLowerCase().includes('rebalance') ||
    action.toLowerCase().includes('swap')
  ) {
    return 'Execution'
  }
  if (
    action.toLowerCase().includes('risk') ||
    action.toLowerCase().includes('compliance')
  ) {
    return 'Safety'
  }
  return 'Bridging'
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    success: 'Success',
    executed: 'Success',
    error: 'Failed',
    analysed: 'Analysed',
    pending: 'Pending',
    verified: 'Verified',
  }
  return statusMap[status.toLowerCase()] || status
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export function LogItem({ log }: LogItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const logType = getLogType(log.action)
  const formattedStatus = formatStatus(log.status)
  const timeAgo = log.createdAt
    ? formatTimeAgo(new Date(log.createdAt))
    : 'Unknown time'

  const metadata = (() => {
    if (!log.metadata) return null

    try {
      let parsed: unknown
      if (typeof log.metadata === 'string') {
        parsed = JSON.parse(log.metadata)
      } else {
        parsed = log.metadata
      }

      const result = AgentLogMetadataSchema.safeParse(parsed)
      return result.success ? result.data : null
    } catch {
      return null
    }
  })()

  const hasLLMData = Boolean(
    metadata &&
      (metadata.text ||
        (Array.isArray(metadata.toolCalls) && metadata.toolCalls.length > 0) ||
        (Array.isArray(metadata.toolResults) &&
          metadata.toolResults.length > 0))
  )

  return (
    <Card className='border-border/40 hover:bg-muted/30 transition-colors overflow-hidden'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-start gap-4 flex-1 min-w-0'>
            <div className='p-2 rounded bg-muted shrink-0'>
              {logType === 'Execution' ? (
                <ProcessorIcon className='size-4' />
              ) : logType === 'Safety' ? (
                <LockIcon className='size-4' />
              ) : (
                <ZapIcon className='size-4' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-bold uppercase wrap-break-word'>
                {log.action}
              </p>
              <div className='flex items-center gap-2 text-[10px] text-muted-foreground font-mono flex-wrap mt-1'>
                <span className='text-primary'>{log.agentName}</span>
                <span>•</span>
                <span>{timeAgo}</span>
                {log.transactionHash && (
                  <>
                    <span>•</span>
                    <span className='truncate max-w-[100px]'>
                      {log.transactionHash.slice(0, 10)}...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <Badge
              variant='outline'
              className={
                formattedStatus === 'Success'
                  ? 'text-success border-success/30'
                  : formattedStatus === 'Pending'
                  ? 'text-warning border-warning/30'
                  : formattedStatus === 'Failed'
                  ? 'text-destructive border-destructive/30'
                  : 'text-primary border-primary/30'
              }
            >
              {formattedStatus}
            </Badge>
            {hasLLMData && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsExpanded(!isExpanded)}
                className='text-[10px] font-mono uppercase h-6 px-2'
              >
                {isExpanded ? 'Hide' : 'Details'}
              </Button>
            )}
          </div>
        </div>

        {isExpanded && hasLLMData && metadata && (
          <div className='mt-4 pt-4 border-t border-border/20 space-y-4'>
            {metadata.text && (
              <div>
                <p className='text-[10px] font-bold uppercase text-muted-foreground mb-2'>
                  LLM Response
                </p>
                <div className='p-3 rounded bg-muted/50 border border-border/20'>
                  <p className='text-xs text-foreground whitespace-pre-wrap wrap-break-word'>
                    {metadata.text}
                  </p>
                </div>
              </div>
            )}

            {metadata.toolCalls && metadata.toolCalls.length > 0 && (
              <div>
                <p className='text-[10px] font-bold uppercase text-muted-foreground mb-2'>
                  Tool Calls ({metadata.toolCalls.length})
                </p>
                <div className='p-3 rounded bg-muted/50 border border-border/20 max-h-60 overflow-y-auto'>
                  <pre className='text-[10px] font-mono text-foreground whitespace-pre-wrap wrap-break-word'>
                    {JSON.stringify(metadata.toolCalls, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {metadata.toolResults && metadata.toolResults.length > 0 && (
              <div>
                <p className='text-[10px] font-bold uppercase text-muted-foreground mb-2'>
                  Tool Results ({metadata.toolResults.length})
                </p>
                <div className='p-3 rounded bg-muted/50 border border-border/20 max-h-60 overflow-y-auto'>
                  <pre className='text-[10px] font-mono text-foreground whitespace-pre-wrap wrap-break-word'>
                    {JSON.stringify(metadata.toolResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
