'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '@/types';

interface HoldingsPieChartProps {
  holdings: Holding[];
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1'  // Indigo
];

const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-200/50 rounded-xl shadow-2xl">
        <p className="font-bold text-gray-800 text-lg">{data.company}</p>
        <p className="text-sm text-blue-600 font-semibold">Symbol: {data.symbol}</p>
        <p className="text-sm text-green-600 font-semibold">Value: {formatValue(data.marketValue)}</p>
        <p className="text-sm text-purple-600 font-semibold">Percentage: {data.percentage}%</p>
        <p className="text-sm text-orange-600 font-semibold">Shares: {data.shares.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function HoldingsPieChart({ holdings }: HoldingsPieChartProps) {
  // Separate holdings into major (>=1%) and minor (<1%)
  const majorHoldings = holdings.filter(holding => holding.percentage >= 1);
  const minorHoldings = holdings.filter(holding => holding.percentage < 1);
  
  // Create "Others" category if there are minor holdings
  const chartData = [...majorHoldings];
  if (minorHoldings.length > 0) {
    const othersTotal = minorHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
    const othersPercentage = minorHoldings.reduce((sum, holding) => sum + holding.percentage, 0);
    
    chartData.push({
      symbol: 'Others',
      company: `Others (${minorHoldings.length} holdings)`,
      shares: minorHoldings.reduce((sum, holding) => sum + holding.shares, 0),
      marketValue: othersTotal,
      percentage: parseFloat(othersPercentage.toFixed(2))
    });
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ symbol, percentage }) => `${symbol} ${percentage}%`}
            outerRadius={130}
            innerRadius={40}
            fill="#8884d8"
            dataKey="marketValue"
            stroke="#ffffff"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value, entry: any) => (
              <span className="text-sm font-semibold text-gray-700">
                {entry?.payload?.symbol || value}
              </span>
            )}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
