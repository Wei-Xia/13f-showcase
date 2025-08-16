'use client';

import { QuarterlyTransactions, Transaction } from '@/types';

interface TransactionHistoryProps {
  quarterlyTransactions: QuarterlyTransactions[];
}

const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
};

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  const isBuy = transaction.action === 'buy';
  
  return (
    <div className={`
      p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md
      ${isBuy 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
        : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400'
      }
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full mr-3
              ${isBuy ? 'bg-green-500' : 'bg-red-500'}
            `}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isBuy ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                )}
              </svg>
            </div>
            <div>
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
                ${isBuy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              `}>
                {isBuy ? '买入' : '卖出'}
              </span>
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="font-bold text-gray-900 text-lg">{transaction.symbol}</h4>
            <p className="text-gray-600 text-sm">{transaction.company}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-gray-500 text-xs">股数</p>
              <p className="font-semibold text-gray-900">{transaction.shares.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">价格</p>
              <p className="font-semibold text-gray-900">{formatPrice(transaction.price)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-500 text-xs">总价值</p>
            <p className={`font-bold text-lg ${isBuy ? 'text-green-600' : 'text-red-600'}`}>
              {formatValue(transaction.totalValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TransactionHistory({ quarterlyTransactions }: TransactionHistoryProps) {
  return (
    <div className="space-y-8">
      {quarterlyTransactions.map((quarter) => (
        <div key={quarter.quarter} className="space-y-4">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{quarter.quarter}</h3>
              <p className="text-gray-600">调仓日期: {quarter.date}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quarter.transactions.map((transaction, index) => (
              <TransactionCard key={index} transaction={transaction} />
            ))}
          </div>
          
          {/* 季度统计 */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-green-600 font-bold text-lg">
                  买入: {quarter.transactions.filter(t => t.action === 'buy').length} 笔
                </p>
                <p className="text-gray-600 text-sm">
                  {formatValue(quarter.transactions
                    .filter(t => t.action === 'buy')
                    .reduce((sum, t) => sum + t.totalValue, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-red-600 font-bold text-lg">
                  卖出: {quarter.transactions.filter(t => t.action === 'sell').length} 笔
                </p>
                <p className="text-gray-600 text-sm">
                  {formatValue(quarter.transactions
                    .filter(t => t.action === 'sell')
                    .reduce((sum, t) => sum + t.totalValue, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
