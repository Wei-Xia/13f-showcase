'use client';

import { Holding } from '@/types';

interface HoldingsTableProps {
  holdings: Holding[];
}

const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatShares = (shares: number) => {
  return new Intl.NumberFormat('en-US').format(shares);
};

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shares
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Market Value
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Percentage
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {holdings.map((holding, index) => (
            <tr key={holding.symbol} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {holding.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {holding.company}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatShares(holding.shares)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatValue(holding.marketValue)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {holding.percentage}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100">
          <tr>
            <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900">
              Total Portfolio Value
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
              {formatValue(totalValue)}
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
              100%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
