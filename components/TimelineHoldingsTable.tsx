'use client';

import { Holding } from '@/types';

interface TimelineHoldingsTableProps {
  holdings: Holding[];
}

const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatShares = (shares: number) => {
  return new Intl.NumberFormat('en-US').format(shares);
};

export default function TimelineHoldingsTable({ holdings }: TimelineHoldingsTableProps) {
  // 按市值从大到小排序
  const sortedHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden shadow-lg">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              Shares
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              Market Value
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              Percentage
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/50">
          {sortedHoldings.map((holding, index) => (
            <tr key={holding.symbol} className={`
              ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'} 
              hover:bg-blue-50/50 transition-colors duration-200
            `}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                {holding.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {holding.company}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                {formatShares(holding.shares)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-bold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                  {formatPrice(holding.price)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                {formatValue(holding.marketValue)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                  {Math.round(holding.percentage)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <tr>
            <td colSpan={4} className="px-6 py-4 text-sm font-bold text-gray-900">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                Total Portfolio Value
              </div>
            </td>
            <td className="px-6 py-4 text-sm font-bold text-blue-600 text-right text-lg">
              {formatValue(totalValue)}
            </td>
            <td className="px-6 py-4 text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                100%
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
