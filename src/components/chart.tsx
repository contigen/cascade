'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

type ChartDataPoint = {
  date: string
  spending: number
  limit: number
}

const chartConfig = {
  spending: {
    label: 'Spending',
    color: 'var(--primary)',
  },
  limit: {
    label: 'Daily Limit',
    color: 'var(--muted-foreground)',
  },
} satisfies ChartConfig

type ChartData = {
  week: ChartDataPoint[]
}

type DashboardChartProps = {
  data?: ChartData
}

export function DashboardChart({ data }: DashboardChartProps) {

  const formatYAxisValue = (value: number) => {
    if (value === 0) return ''
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const hasEnoughData = (chartData: ChartDataPoint[], minPoints: number) => {
    return chartData.length >= minPoints && chartData.some(d => d.spending > 0)
  }

  const renderChart = (chartData: ChartDataPoint[], minPoints: number) => {
    const hasData = hasEnoughData(chartData, minPoints)

    if (!hasData) {
      return (
        <div className='bg-muted/20 rounded-lg p-8 border border-border/50 opacity-50'>
          <div className='text-center text-muted-foreground'>
            <p className='text-sm font-medium mb-1'>Insufficient Data</p>
            <p className='text-xs'>
              {chartData.length === 0
                ? 'No activity data available yet'
                : 'Not enough data points to display chart'}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className='bg-accent/20 rounded-lg p-3 border border-border'>
        <ChartContainer className='md:aspect-[3/1] w-full' config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id='fillSpending' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary)'
                  stopOpacity={0.4}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary)'
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={true}
              vertical={false}
              strokeDasharray='4 4'
              stroke='var(--border)'
              opacity={0.5}
            />
            <XAxis
              dataKey='date'
              tickLine={false}
              tickMargin={12}
              strokeWidth={1.5}
              className='uppercase text-[10px] font-mono fill-muted-foreground'
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickCount={5}
              className='text-[10px] font-mono fill-muted-foreground'
              tickFormatter={formatYAxisValue}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator='line'
                  className='min-w-[150px] font-mono'
                />
              }
            />
            <Area
              dataKey='limit'
              type='step'
              fill='transparent'
              stroke='var(--muted-foreground)'
              strokeWidth={1}
              strokeDasharray='4 4'
              dot={false}
            />
            <Area
              dataKey='spending'
              type='monotone'
              fill='url(#fillSpending)'
              stroke='var(--primary)'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    )
  }

  return (
    <div>
      <div className='flex items-center justify-end mb-4'>
        <div className='flex items-center gap-6'>
          <ChartLegend label='SPENDING' color='var(--primary)' />
          <ChartLegend label='LIMIT' color='var(--muted-foreground)' dashed />
        </div>
      </div>
      {renderChart(data?.week || [], 2)}
    </div>
  )
}

export const ChartLegend = ({
  label,
  color,
  dashed = false,
}: {
  label: string
  color: string
  dashed?: boolean
}) => {
  return (
    <div className='flex items-center gap-2'>
      <div
        className={cn(
          'size-2 rounded-full',
          dashed && 'rounded-none w-3 h-0.5 border-t border-dashed'
        )}
        style={{
          backgroundColor: dashed ? 'transparent' : color,
          borderColor: dashed ? color : 'transparent',
        }}
      />
      <span className='text-[10px] font-mono font-medium text-muted-foreground uppercase'>
        {label}
      </span>
    </div>
  )
}
