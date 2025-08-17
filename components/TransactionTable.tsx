'use client';

import { QuarterlyTransactions } from '@/types';

interface TransactionTableProps {
  quarterlyTransactions: QuarterlyTransactions[];
}

export default function TransactionTable({ quarterlyTransactions }: TransactionTableProps) {
  // Sort quarterly transactions by date in descending order (most recent first)
  const sortedTransactions = [...quarterlyTransactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-8">
      {sortedTransactions.map((quarter) => (
        <div key={quarter.quarter} className="space-y-4">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{quarter.quarter}</h3>
              <p className="text-gray-600">Transaction Date: {quarter.date}</p>
            </div>
          </div>
          
          {/* Transaction table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden shadow-lg">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Shares
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {quarter.transactions.map((transaction, index) => {
                  const isBuy = transaction.action === 'buy';
                  return (
                    <tr key={index} className={`
                      ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'} 
                      hover:bg-blue-50/50 transition-colors duration-200
                    `}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`
                          inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                          ${isBuy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}>
                          <div className={`
                            flex items-center justify-center w-4 h-4 rounded-full mr-2
                            ${isBuy ? 'bg-green-500' : 'bg-red-500'}
                          `}>
                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {isBuy ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 12H6" />
                              )}
                            </svg>
                          </div>
                          {isBuy ? 'Buy' : 'Sell'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {transaction.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {transaction.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        {transaction.shares.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
