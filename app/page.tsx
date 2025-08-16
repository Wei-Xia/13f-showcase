import HoldingsPieChart from '@/components/HoldingsPieChart';
import AUMLineChart from '@/components/AUMLineChart';
import HoldingsTable from '@/components/HoldingsTable';
import { Holding, AUM } from '@/types';
import holdingsData from '@/data/holdings.json';
import aumData from '@/data/aum.json';

export default function Home() {
  const holdings: Holding[] = holdingsData;
  const aum: AUM[] = aumData;
  const latestAUM = aum[aum.length - 1];
  const latestQuarter = latestAUM.quarter;
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              13F Portfolio Disclosure
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Quarterly Holdings Report - {latestQuarter}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Assets Under Management: {formatValue(latestAUM.aum)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AUM Growth Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Assets Under Management Growth
            </h2>
            <p className="text-gray-600 mb-6">
              Historical AUM performance over the past quarters
            </p>
            <AUMLineChart aumData={aum} />
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Holdings Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Portfolio Allocation
              </h2>
              <p className="text-gray-600 mb-6">
                Current holdings distribution by market value
              </p>
              <HoldingsPieChart holdings={holdings} />
            </div>

            {/* Portfolio Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Portfolio Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Total Portfolio Value</span>
                  <span className="font-semibold text-lg">{formatValue(totalValue)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Number of Holdings</span>
                  <span className="font-semibold">{holdings.length}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Largest Position</span>
                  <span className="font-semibold">{holdings[0]?.symbol} ({holdings[0]?.percentage}%)</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Report Date</span>
                  <span className="font-semibold">{latestAUM.date}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Holdings Table */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Detailed Holdings
            </h2>
            <p className="text-gray-600 mb-6">
              Complete list of all portfolio positions as of {latestAUM.date}
            </p>
            <HoldingsTable holdings={holdings} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>
              This information is based on holdings as of {latestAUM.date} and is subject to change.
            </p>
            <p className="mt-1">
              Data source: Form 13F filing with the Securities and Exchange Commission.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
