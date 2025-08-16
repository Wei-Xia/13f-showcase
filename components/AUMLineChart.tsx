'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AUM } from '@/types';

interface AUMLineChartProps {
  aumData: AUM[];
}

const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-blue-600">
          AUM: {formatValue(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function AUMLineChart({ aumData }: AUMLineChartProps) {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={aumData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="quarter" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={formatValue}
            stroke="#666"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="aum" 
            stroke="#0088FE" 
            strokeWidth={3}
            dot={{ fill: '#0088FE', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#0088FE', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
