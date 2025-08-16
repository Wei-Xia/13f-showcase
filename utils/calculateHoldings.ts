/**
 * 计算持仓数据的工具函数
 * 自动生成 marketValue, aum, percentage 字段
 */

export interface InputHolding {
  symbol: string;
  company: string;
  shares: number;
  price: number;
}

export interface InputQuarterData {
  quarter: string;
  date: string;
  holdings: InputHolding[];
}

export interface CalculatedHolding extends InputHolding {
  marketValue: number;
  percentage: number;
}

export interface CalculatedQuarterData {
  quarter: string;
  date: string;
  aum: number;
  holdings: CalculatedHolding[];
}

/**
 * 计算单个季度的持仓数据
 */
export function calculateQuarterHoldings(inputData: InputQuarterData): CalculatedQuarterData {
  // 1. 计算每个持仓的市场价值
  const holdingsWithMarketValue = inputData.holdings.map(holding => ({
    ...holding,
    marketValue: Math.round(holding.shares * holding.price)
  }));

  // 2. 计算总 AUM
  const totalAum = holdingsWithMarketValue.reduce((sum, holding) => sum + holding.marketValue, 0);

  // 3. 计算每个持仓的百分比
  const holdingsWithPercentage: CalculatedHolding[] = holdingsWithMarketValue.map(holding => ({
    ...holding,
    percentage: Number(((holding.marketValue / totalAum) * 100).toFixed(2))
  }));

  return {
    quarter: inputData.quarter,
    date: inputData.date,
    aum: totalAum,
    holdings: holdingsWithPercentage
  };
}

/**
 * 处理多个季度的数据
 */
export function calculateAllQuartersHoldings(inputQuarters: InputQuarterData[]): CalculatedQuarterData[] {
  return inputQuarters.map(quarter => calculateQuarterHoldings(quarter));
}

/**
 * 验证计算结果
 */
export function validateCalculations(quarterData: CalculatedQuarterData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 检查百分比总和是否接近100%
  const totalPercentage = quarterData.holdings.reduce((sum, holding) => sum + holding.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    errors.push(`总百分比为 ${totalPercentage.toFixed(2)}%，应该接近 100%`);
  }
  
  // 检查 AUM 是否等于所有市场价值的总和
  const calculatedAum = quarterData.holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  if (calculatedAum !== quarterData.aum) {
    errors.push(`AUM 不匹配：计算值 ${calculatedAum}，实际值 ${quarterData.aum}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 使用示例：
/*
const inputData: InputQuarterData = {
  quarter: "Q3 2025",
  date: "2025-09-30",
  holdings: [
    {
      symbol: "AAPL",
      company: "Apple Inc.",
      shares: 100,
      price: 180.50
    },
    {
      symbol: "MSFT", 
      company: "Microsoft Corporation",
      shares: 50,
      price: 420.00
    }
  ]
};

const calculated = calculateQuarterHoldings(inputData);
console.log(calculated);
// 输出:
// {
//   quarter: "Q3 2025",
//   date: "2025-09-30", 
//   aum: 39050,
//   holdings: [
//     {
//       symbol: "AAPL",
//       company: "Apple Inc.",
//       shares: 100,
//       price: 180.50,
//       marketValue: 18050,
//       percentage: 46.23
//     },
//     {
//       symbol: "MSFT",
//       company: "Microsoft Corporation", 
//       shares: 50,
//       price: 420.00,
//       marketValue: 21000,
//       percentage: 53.77
//     }
//   ]
// }
*/
