/**
 * 从持仓快照自动计算交易明细的工具函数
 */

import fs from 'fs';
import path from 'path';

export interface HoldingSnapshot {
  symbol: string;
  company: string;
  shares: number;
  price: number;
}

export interface QuarterSnapshot {
  quarter: string;
  date: string;
  holdings: HoldingSnapshot[];
}

export interface Transaction {
  action: 'buy' | 'sell';
  symbol: string;
  company: string;
  shares: number;
}

export interface QuarterlyTransactions {
  quarter: string;
  date: string;
  transactions: Transaction[];
}

/**
 * 从两个季度快照计算交易明细
 */
export function calculateTransactions(
  previousQuarter: QuarterSnapshot | null,
  currentQuarter: QuarterSnapshot
): Transaction[] {
  const transactions: Transaction[] = [];

  // 如果没有前一季度数据，认为当前季度的所有持仓都是买入
  if (!previousQuarter) {
    currentQuarter.holdings.forEach(holding => {
      transactions.push({
        action: 'buy',
        symbol: holding.symbol,
        company: holding.company,
        shares: holding.shares
      });
    });
    return transactions;
  }

  // 创建前一季度持仓的映射表
  const previousHoldings = new Map<string, HoldingSnapshot>();
  previousQuarter.holdings.forEach(holding => {
    previousHoldings.set(holding.symbol, holding);
  });

  // 创建当前季度持仓的映射表
  const currentHoldings = new Map<string, HoldingSnapshot>();
  currentQuarter.holdings.forEach(holding => {
    currentHoldings.set(holding.symbol, holding);
  });

  // 获取所有涉及的股票代码
  const allSymbols = new Set([
    ...previousHoldings.keys(),
    ...currentHoldings.keys()
  ]);

  // 分析每个股票的变化
  allSymbols.forEach(symbol => {
    const prevHolding = previousHoldings.get(symbol);
    const currHolding = currentHoldings.get(symbol);

    const prevShares = prevHolding?.shares || 0;
    const currShares = currHolding?.shares || 0;
    const sharesDiff = currShares - prevShares;

    // 如果有变化，记录交易
    if (sharesDiff !== 0) {
      const company = currHolding?.company || prevHolding?.company || '';
      
      transactions.push({
        action: sharesDiff > 0 ? 'buy' : 'sell',
        symbol: symbol,
        company: company,
        shares: Math.abs(sharesDiff)
      });
    }
  });

  return transactions;
}

/**
 * 从所有季度快照生成完整的交易历史
 */
export function generateTransactionHistory(quarters: QuarterSnapshot[]): QuarterlyTransactions[] {
  const transactionHistory: QuarterlyTransactions[] = [];

  for (let i = 0; i < quarters.length; i++) {
    const currentQuarter = quarters[i];
    const previousQuarter = i > 0 ? quarters[i - 1] : null;

    const transactions = calculateTransactions(previousQuarter, currentQuarter);

    transactionHistory.push({
      quarter: currentQuarter.quarter,
      date: currentQuarter.date,
      transactions: transactions
    });
  }

  return transactionHistory;
}

/**
 * 验证计算结果
 */
export function validateTransactionCalculation(): void {
  const inputPath = path.join(process.cwd(), 'data', 'input-holdings.json');
  const outputPath = path.join(process.cwd(), 'data', 'calculated-transactions.json');

  // 读取输入数据
  const inputData: QuarterSnapshot[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  // 计算交易历史
  const calculatedTransactions = generateTransactionHistory(inputData);

  // 写入计算结果
  fs.writeFileSync(outputPath, JSON.stringify(calculatedTransactions, null, 2), 'utf8');

  // 显示结果
  console.log('📊 自动计算的交易明细:');
  calculatedTransactions.forEach(quarter => {
    console.log(`\n${quarter.quarter} (${quarter.date}):`);
    if (quarter.transactions.length === 0) {
      console.log('  📝 无交易活动');
    } else {
      quarter.transactions.forEach(tx => {
        const action = tx.action === 'buy' ? '📈 买入' : '📉 卖出';
        console.log(`  ${action} ${tx.symbol}: ${tx.shares} 股`);
      });
    }
  });
}

// 使用示例：
/*
const Q1: QuarterSnapshot = {
  quarter: "Q1 2025",
  date: "2025-03-31",
  holdings: [
    { symbol: "VOO", company: "Vanguard S&P 500 ETF", shares: 110, price: 512.33 },
    { symbol: "RBLX", company: "Roblox Corporation", shares: 1130, price: 58.92 }
  ]
};

const Q2: QuarterSnapshot = {
  quarter: "Q2 2025", 
  date: "2025-06-30",
  holdings: [
    { symbol: "VOO", company: "Vanguard S&P 500 ETF", shares: 161, price: 568.03 },
    { symbol: "RBLX", company: "Roblox Corporation", shares: 744, price: 105.2 },
    { symbol: "UNH", company: "UnitedHealth Group Inc.", shares: 40, price: 311.97 }
  ]
};

const transactions = calculateTransactions(Q1, Q2);
// 结果:
// [
//   { action: 'buy', symbol: 'VOO', company: 'Vanguard S&P 500 ETF', shares: 51 },
//   { action: 'sell', symbol: 'RBLX', company: 'Roblox Corporation', shares: 386 },
//   { action: 'buy', symbol: 'UNH', company: 'UnitedHealth Group Inc.', shares: 40 }
// ]
*/
