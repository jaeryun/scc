'use client';

import { BarGraph } from '@/components/charts/bar-graph';
import { AreaGraph } from '@/components/charts/area-graph';
import { PieGraph } from '@/components/charts/pie-graph';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const lineChartData = [
  { month: '1월', avg: 42, max: 78 },
  { month: '2월', avg: 38, max: 65 },
  { month: '3월', avg: 55, max: 92 },
  { month: '4월', avg: 47, max: 81 },
  { month: '5월', avg: 62, max: 95 },
  { month: '6월', avg: 51, max: 88 }
];

const lineChartConfig = {
  avg: {
    label: '평균 CPU %',
    color: 'var(--chart-1)'
  },
  max: {
    label: '최대 CPU %',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

const donutData = [
  { name: '강남', value: 45, color: 'var(--chart-1)' },
  { name: '판교', value: 30, color: 'var(--chart-2)' },
  { name: '용산', value: 15, color: 'var(--chart-3)' },
  { name: '분당', value: 10, color: 'var(--chart-4)' }
];

const donutConfig = {
  강남: { label: '강남', color: 'var(--chart-1)' },
  판교: { label: '판교', color: 'var(--chart-2)' },
  용산: { label: '용산', color: 'var(--chart-3)' },
  분당: { label: '분당', color: 'var(--chart-4)' }
} satisfies ChartConfig;

const totalAllocation = donutData.reduce((sum, item) => sum + item.value, 0);

export function ChartDemos() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <BarGraph />

      <AreaGraph />

      <PieGraph />

      <Card>
        <CardHeader>
          <CardTitle>
            라인 차트 (Line)
            <Badge variant='outline'>
              <Icons.trendingUp />
              Line
            </Badge>
          </CardTitle>
          <CardDescription>서버 CPU 사용량 추이 (6개월)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig}>
            <LineChart
              accessibilityLayer
              data={lineChartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey='avg'
                type='monotone'
                stroke='var(--color-avg)'
                strokeWidth={2}
                dot={{ fill: 'var(--color-avg)', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey='max'
                type='monotone'
                stroke='var(--color-max)'
                strokeWidth={2}
                strokeDasharray='4 4'
                dot={{ fill: 'var(--color-max)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            도넛 차트 (Donut)
            <Badge variant='outline'>
              <Icons.graph />
              Donut
            </Badge>
          </CardTitle>
          <CardDescription>데이터센터별 리소스 할당 비율</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <ChartContainer
            config={donutConfig}
            className='mx-auto aspect-square max-h-[300px] min-h-[250px]'
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={donutData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                cornerRadius={8}
                strokeWidth={2}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <text
                x='50%'
                y='50%'
                textAnchor='middle'
                dominantBaseline='middle'
                className='fill-foreground text-lg font-bold'
              >
                {totalAllocation}%
              </text>
              <text
                x='50%'
                y='58%'
                textAnchor='middle'
                dominantBaseline='middle'
                className='fill-muted-foreground text-xs'
              >
                총 할당량
              </text>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
