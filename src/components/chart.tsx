'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type TimePeriod = 'week' | 'month' | 'year'

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

const CASCADE_CHART_DATA = {
  week: [
    { date: 'MON', spending: 12, limit: 50 },
    { date: 'TUE', spending: 45, limit: 50 },
    { date: 'WED', spending: 34, limit: 50 },
    { date: 'THU', spending: 15, limit: 50 },
    { date: 'FRI', spending: 28, limit: 50 },
    { date: 'SAT', spending: 8, limit: 50 },
    { date: 'SUN', spending: 10, limit: 50 },
  ],
  month: [
    { date: 'JAN', spending: 800, limit: 1500 },
    { date: 'FEB', spending: 1200, limit: 1500 },
    { date: 'MAR', spending: 950, limit: 1500 },
    { date: 'APR', spending: 1400, limit: 1500 },
    { date: 'MAY', spending: 1100, limit: 1500 },
    { date: 'JUN', spending: 700, limit: 1500 },
    { date: 'JUL', spending: 1050, limit: 1500 },
    { date: 'AUG', spending: 900, limit: 1500 },
    { date: 'SEP', spending: 1300, limit: 1500 },
    { date: 'OCT', spending: 1150, limit: 1500 },
    { date: 'NOV', spending: 1250, limit: 1500 },
    { date: 'DEC', spending: 1450, limit: 1500 },
  ],
  year: [
    { date: '2021', spending: 8500, limit: 18000 },
    { date: '2022', spending: 12000, limit: 18000 },
    { date: '2023', spending: 15500, limit: 18000 },
    { date: '2024', spending: 14000, limit: 18000 },
    { date: '2025', spending: 16500, limit: 18000 },
  ],
}

export function DashboardChart() {
  const [activeTab, setActiveTab] = React.useState<TimePeriod>('week')

  const handleTabChange = (value: string) => {
    if (value === 'week' || value === 'month' || value === 'year') {
      setActiveTab(value as TimePeriod)
    }
  }

  const formatYAxisValue = (value: number) => {
    if (value === 0) return ''
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const renderChart = (data: ChartDataPoint[]) => {
    return (
      <div className='bg-accent/20 rounded-lg p-3 border border-border'>
        <ChartContainer className='md:aspect-[3/1] w-full' config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
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
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className='max-md:gap-4'
    >
      <div className='flex items-center justify-between mb-4 max-md:contents'>
        <TabsList className='bg-transparent border border-border p-1'>
          <TabsTrigger
            value='week'
            className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-mono px-4 py-1.5'
          >
            WEEK
          </TabsTrigger>
          <TabsTrigger
            value='month'
            className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-mono px-4 py-1.5'
          >
            MONTH
          </TabsTrigger>
          <TabsTrigger
            value='year'
            className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-mono px-4 py-1.5'
          >
            YEAR
          </TabsTrigger>
        </TabsList>
        <div className='flex items-center gap-6 max-md:order-1'>
          <ChartLegend label='SPENDING' color='var(--primary)' />
          <ChartLegend label='LIMIT' color='var(--muted-foreground)' dashed />
        </div>
      </div>
      <TabsContent value='week' className='mt-0'>
        {renderChart(CASCADE_CHART_DATA.week)}
      </TabsContent>
      <TabsContent value='month' className='mt-0'>
        {renderChart(CASCADE_CHART_DATA.month)}
      </TabsContent>
      <TabsContent value='year' className='mt-0'>
        {renderChart(CASCADE_CHART_DATA.year)}
      </TabsContent>
    </Tabs>
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
