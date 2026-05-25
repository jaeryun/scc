'use client';

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const MOCK_DATA = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 200 },
  { name: 'D', value: 278 },
  { name: 'E', value: 189 }
];

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface PanelChartProps {
  options: Record<string, unknown>;
  isEditing: boolean;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

export function PanelChart({ options, isEditing, onOptionsChange }: PanelChartProps) {
  const chartType = (options.chartType as string) ?? 'bar';

  function renderChart() {
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={MOCK_DATA}>
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Area
                type='monotone'
                dataKey='value'
                stroke='#8884d8'
                fill='#8884d8'
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={MOCK_DATA}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius='80%'
                label
              >
                {MOCK_DATA.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={MOCK_DATA}>
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='value' fill='#8884d8' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  }

  return (
    <div className='h-full flex flex-col p-2'>
      {isEditing && (
        <div className='flex items-center gap-2 mb-2'>
          <Label className='text-xs'>차트 유형</Label>
          <Select
            value={chartType}
            onValueChange={(value) => onOptionsChange({ ...options, chartType: value })}
          >
            <SelectTrigger className='h-7 text-xs w-24'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='bar'>막대</SelectItem>
              <SelectItem value='area'>영역</SelectItem>
              <SelectItem value='pie'>파이</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className='flex-1 min-h-0'>{renderChart()}</div>
    </div>
  );
}
