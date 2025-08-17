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
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-200/50 rounded-xl shadow-2xl">
        <p className="font-bold text-gray-800 text-lg">{label}</p>
        <p className="text-lg font-bold text-blue-600">
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
          <defs>
            <linearGradient id="colorAUM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
          <XAxis 
            dataKey="quarter" 
            stroke="#6B7280"
            fontSize={12}
            fontWeight="600"
          />
          <YAxis 
            tickFormatter={formatValue}
            stroke="#6B7280"
            fontSize={12}
            fontWeight="600"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="aum" 
            stroke="#10B981" 
            strokeWidth={4}
            dot={{ fill: '#10B981', strokeWidth: 3, r: 8, fillOpacity: 1 }}
            activeDot={{ r: 10, stroke: '#10B981', strokeWidth: 3, fill: '#ffffff' }}
            fill="url(#colorAUM)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
