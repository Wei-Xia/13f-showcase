#!/usr/bin/env node

/**
 * 自动生成 holdings.json 和 transactions.json 的脚本
 * 从简化的 input-holdings.json 生成包含所有计算字段的完整数据
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const INPUT_FILE = path.join(DATA_DIR, 'input-holdings.json');
const HOLDINGS_OUTPUT_FILE = path.join(DATA_DIR, 'holdings.json');
const TRANSACTIONS_OUTPUT_FILE = path.join(DATA_DIR, 'transactions.json');

// 计算持仓数据的函数
function calculateQuarterHoldings(inputData) {
  // 1. 计算每个持仓的市场价值
  const holdingsWithMarketValue = inputData.holdings.map(holding => ({
    ...holding,
    marketValue: Math.round(holding.shares * holding.price)
  }));

  // 2. 计算总 AUM
  const totalAum = holdingsWithMarketValue.reduce((sum, holding) => sum + holding.marketValue, 0);

  // 3. 计算每个持仓的百分比
  const holdingsWithPercentage = holdingsWithMarketValue.map(holding => ({
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

function calculateAllQuartersHoldings(inputQuarters) {
  return inputQuarters.map(quarter => calculateQuarterHoldings(quarter));
}

// 从持仓快照生成交易记录
function generateTransactionHistory(quarters) {
  const transactionHistory = [];

  for (let i = 0; i < quarters.length; i++) {
    const currentQuarter = quarters[i];
    const previousQuarter = i > 0 ? quarters[i - 1] : null;
    const transactions = [];

    if (!previousQuarter) {
      // 第一个季度作为基线，不生成交易记录
      transactionHistory.push({
        quarter: currentQuarter.quarter,
        date: currentQuarter.date,
        transactions: []
      });
      continue;
    }

    // 创建持仓映射
    const prevHoldings = new Map();
    previousQuarter.holdings.forEach(holding => {
      prevHoldings.set(holding.symbol, holding);
    });

    const currHoldings = new Map();
    currentQuarter.holdings.forEach(holding => {
      currHoldings.set(holding.symbol, holding);
    });

    // 获取所有股票代码
    const allSymbols = new Set([
      ...prevHoldings.keys(),
      ...currHoldings.keys()
    ]);

    // 计算每个股票的变化
    allSymbols.forEach(symbol => {
      const prevShares = prevHoldings.get(symbol)?.shares || 0;
      const currShares = currHoldings.get(symbol)?.shares || 0;
      const sharesDiff = currShares - prevShares;

      if (sharesDiff !== 0) {
        const company = currHoldings.get(symbol)?.company || prevHoldings.get(symbol)?.company || '';
        
        transactions.push({
          action: sharesDiff > 0 ? 'buy' : 'sell',
          symbol: symbol,
          company: company,
          shares: Math.abs(sharesDiff)
        });
      }
    });

    transactionHistory.push({
      quarter: currentQuarter.quarter,
      date: currentQuarter.date,
      transactions: transactions
    });
  }

  return transactionHistory;
}

function validateCalculations(quarterData) {
  const errors = [];
  
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

async function generateHoldings() {
  try {
    console.log('🔄 开始生成数据文件...');
    
    // 1. 读取输入数据
    console.log('📖 读取输入数据...');
    const inputData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`✅ 成功读取 ${inputData.length} 个季度的数据`);
    
    // 2. 计算持仓数据
    console.log('🧮 计算市场价值、AUM 和百分比...');
    const calculatedData = calculateAllQuartersHoldings(inputData);
    
    // 3. 自动生成交易记录
    console.log('📊 自动计算交易明细...');
    const transactionHistory = generateTransactionHistory(inputData);
    
    // 4. 验证计算结果
    console.log('✅ 验证计算结果...');
    let allValid = true;
    for (const quarter of calculatedData) {
      const validation = validateCalculations(quarter);
      if (!validation.isValid) {
        console.error(`❌ ${quarter.quarter} 验证失败:`);
        validation.errors.forEach(error => console.error(`   - ${error}`));
        allValid = false;
      } else {
        console.log(`✅ ${quarter.quarter} 验证通过 (AUM: $${quarter.aum.toLocaleString()})`);
      }
    }
    
    if (!allValid) {
      console.error('❌ 验证失败，请检查输入数据');
      process.exit(1);
    }
    
    // 5. 写入输出文件
    console.log('💾 写入 holdings.json...');
    fs.writeFileSync(HOLDINGS_OUTPUT_FILE, JSON.stringify(calculatedData, null, 2), 'utf8');
    console.log('✅ holdings.json 生成完成');
    
    console.log('💾 写入 transactions.json...');
    fs.writeFileSync(TRANSACTIONS_OUTPUT_FILE, JSON.stringify(transactionHistory, null, 2), 'utf8');
    console.log('✅ transactions.json 生成完成');
    
    // 6. 显示摘要信息
    console.log('\n📊 生成摘要:');
    calculatedData.forEach(quarter => {
      console.log(`\n${quarter.quarter} (${quarter.date}):`);
      console.log(`  💰 AUM: $${quarter.aum.toLocaleString()}`);
      console.log(`  📈 持仓数量: ${quarter.holdings.length}`);
      console.log(`  🏆 最大持仓: ${quarter.holdings[0]?.symbol} (${quarter.holdings[0]?.percentage}%)`);
      
      // 显示交易明细
      const quarterTx = transactionHistory.find(tx => tx.quarter === quarter.quarter);
      if (quarterTx && quarterTx.transactions.length > 0) {
        console.log(`  📊 交易明细:`);
        quarterTx.transactions.forEach(tx => {
          const action = tx.action === 'buy' ? '买入' : '卖出';
          console.log(`     ${action} ${tx.symbol}: ${tx.shares} 股`);
        });
      }
    });
    
    console.log('\n🎉 所有数据文件生成完成！');
    
  } catch (error) {
    console.error('❌ 生成过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行生成
generateHoldings();
