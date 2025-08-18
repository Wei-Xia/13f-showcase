'use client';

import { Suspense } from 'react';
import HoldingsPieChart from '@/components/HoldingsPieChart';
import AUMLineChart from '@/components/AUMLineChart';
import QuarterlyTimeline from '@/components/QuarterlyTimeline';
import usePortfolioData from '@/hooks/usePortfolioData';
import { Holding, AUM } from '@/types';

function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-8 max-w-md shadow-xl">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-red-800 font-semibold text-lg">数据加载失败</h3>
        </div>
        <p className="text-red-700 mb-6">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🔄 重新加载
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            🌐 刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioContent() {
  const { holdings: quarterlyHoldings, transactions, loading, error, refreshData } = usePortfolioData();

  if (loading) return null;
  if (error) return <ErrorMessage error={error} onRetry={refreshData} />;
  if (!quarterlyHoldings || !transactions) return null;

  // Extract AUM data from quarterly holdings
  const aum: AUM[] = quarterlyHoldings.map(qh => ({
    quarter: qh.quarter,
    date: qh.date,
    aum: qh.aum
  }));

  const latestHoldings = quarterlyHoldings[quarterlyHoldings.length - 1];
  const holdings: Holding[] = latestHoldings.holdings;
  const latestAUM = aum[aum.length - 1];
  const latestQuarter = latestAUM.quarter;
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              13F Portfolio Disclosure
            </h1>
            <p className="text-xl text-gray-600">
              Quarterly Holdings Report - {latestQuarter}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AUM Growth Section */}
        <section className="mb-16">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Assets Under Management Growth
                </h2>
                <p className="text-gray-600 mt-1">
                  Historical AUM performance over the past quarters
                </p>
              </div>
            </div>
            <AUMLineChart aumData={aum} />
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Holdings Pie Chart */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Portfolio Allocation
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Current holdings distribution by market value
                  </p>
                </div>
              </div>
              <HoldingsPieChart holdings={holdings} />
            </div>

            {/* Portfolio Stats */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Portfolio Summary
                  </h2>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Portfolio Value</span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{formatValue(totalValue)}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Number of Holdings</span>
                    <span className="font-bold text-xl text-green-600">{holdings.length}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Largest Position</span>
                    <span className="font-bold text-xl text-purple-600">{holdings[0]?.symbol} ({holdings[0]?.percentage}%)</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Report Date</span>
                    <span className="font-bold text-xl text-orange-600">{latestAUM.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quarterly Holdings and Trading Timeline */}
        <section className="mb-16">
          <div className="mb-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Quarterly Portfolio History
              </h2>
              <p className="text-xl text-gray-600">
                Complete timeline of holdings and trading activity by quarter
              </p>
            </div>
          </div>
          <QuarterlyTimeline quarterlyHoldings={quarterlyHoldings} quarterlyTransactions={transactions} />
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <PortfolioContent />
    </Suspense>
  );
}
