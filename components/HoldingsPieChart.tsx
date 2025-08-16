'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '@/types';

interface HoldingsPieChartProps {
  holdings: Holding[];
}

const COLORS = [
  '#0088FE',
  '#00C49F', 
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
  '#8DD1E1',
  '#D084D0'
];

const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.company}</p>
        <p className="text-sm text-gray-600">Symbol: {data.symbol}</p>
        <p className="text-sm text-gray-600">Value: {formatValue(data.marketValue)}</p>
        <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
        <p className="text-sm text-gray-600">Shares: {data.shares.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function HoldingsPieChart({ holdings }: HoldingsPieChartProps) {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={holdings}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ symbol, percentage }) => `${symbol} ${percentage}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="marketValue"
          >
            {holdings.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value, entry: any) => entry?.payload?.symbol || value}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
