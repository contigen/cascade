import type React from 'react'
import { Badge } from '@/components/ui/badge'
import { Bullet } from '@/components/ui/bullet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatProps = {
  label: string
  value: string
  description?: string
  tag?: string
  icon: React.ElementType
}

export function Stat({ label, value, description, icon, tag }: StatProps) {
  const Icon = icon

  return (
    <Card>
      <CardHeader className='flex items-center justify-between'>
        <CardTitle className='flex items-center gap-2.5'>
          <Bullet />
          {label}
        </CardTitle>
        <Icon className='size-4 text-muted-foreground' />
      </CardHeader>

      <CardContent className='bg-accent flex-1 pt-2 md:pt-6'>
        <div className='flex items-center'>
          <span className='text-4xl md:text-5xl font-display'>{value}</span>
          {tag && (
            <Badge variant='default' className='uppercase ml-3'>
              {tag}
            </Badge>
          )}
        </div>

        {description && (
          <div className='justify-between'>
            <p className='text-xs md:text-sm font-medium text-muted-foreground tracking-wide'>
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
