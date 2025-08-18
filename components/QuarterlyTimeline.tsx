'use client';

import { QuarterlyHoldings, QuarterlyTransactions, Transaction } from '@/types';
import TimelineHoldingsTable from './TimelineHoldingsTable';
import { useState } from 'react';

interface QuarterlyTimelineProps {
  quarterlyHoldings: QuarterlyHoldings[];
  quarterlyTransactions: QuarterlyTransactions[];
}

const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function QuarterlyTimeline({ quarterlyHoldings, quarterlyTransactions }: QuarterlyTimelineProps) {
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set([quarterlyHoldings[quarterlyHoldings.length - 1]?.quarter]));

  // Sort quarters by date in descending order (most recent first)
  const sortedHoldings = [...quarterlyHoldings].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const toggleQuarter = (quarter: string) => {
    const newExpanded = new Set(expandedQuarters);
    if (newExpanded.has(quarter)) {
      newExpanded.delete(quarter);
    } else {
      newExpanded.add(quarter);
    }
    setExpandedQuarters(newExpanded);
  };

  const getTransactionsForQuarter = (quarter: string) => {
    return quarterlyTransactions.find(qt => qt.quarter === quarter);
  };

  const sortTransactions = (transactions: Transaction[]) => {
    return [...transactions].sort((a, b) => {
      const actionOrder = { buy: 1, sell: 0 };
      const actionDiff = actionOrder[b.action as keyof typeof actionOrder] - actionOrder[a.action as keyof typeof actionOrder];
      
      if (actionDiff !== 0) {
        return actionDiff;
      }
      
      return b.shares - a.shares;
    });
  };

  return (
    <div className="space-y-6">
      {sortedHoldings.map((quarterData, index) => {
        const isLatest = index === 0;
        const isExpanded = expandedQuarters.has(quarterData.quarter);
        const quarterTransactions = getTransactionsForQuarter(quarterData.quarter);

        return (
          <div key={quarterData.quarter} className="relative">
            {/* Timeline line */}
            {index < sortedHoldings.length - 1 && (
              <div className="absolute left-6 top-24 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-transparent"></div>
            )}

            {/* Quarter Card */}
            <div className={`
              bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 
              hover:shadow-2xl transition-all duration-300 relative
              ${isLatest ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''}
            `}>
              {/* Quarter Header */}
              <div 
                className="flex items-center justify-between p-8 cursor-pointer"
                onClick={() => toggleQuarter(quarterData.quarter)}
              >
                <div className="flex items-center">
                  {/* Timeline dot */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-xl mr-6
                    ${isLatest 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }
                  `}>
                    {isLatest ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {quarterData.quarter}
                      </h3>
                      {isLatest && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      Report Date: {quarterData.date}
                    </p>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total AUM</p>
                    <p className="text-2xl font-bold text-indigo-600">{formatValue(quarterData.aum)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Holdings Count</p>
                    <p className="text-2xl font-bold text-purple-600">{quarterData.holdings.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-orange-600">{quarterTransactions?.transactions.length || 0}</p>
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className={`
                    transform transition-transform duration-200 text-gray-400
                    ${isExpanded ? 'rotate-180' : ''}
                  `}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-8 pb-8 space-y-8">
                  {/* Holdings Section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Portfolio Holdings</h4>
                    </div>
                    <TimelineHoldingsTable holdings={quarterData.holdings} />
                  </div>

                  {/* Transactions Section */}
                  {quarterTransactions && quarterTransactions.transactions.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Trading Activity</h4>
                      </div>
                      
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
                            {sortTransactions(quarterTransactions.transactions).map((transaction, transIndex) => {
                              const isBuy = transaction.action === 'buy';
                              return (
                                <tr key={transIndex} className={`
                                  ${transIndex % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'} 
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
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
