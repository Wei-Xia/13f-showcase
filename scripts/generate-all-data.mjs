#!/usr/bin/env node

/**
 * 自动生成 holdings.json 和 transactions.json 的脚本
 * 从简化的 input-holdings.json 生成包含所有计算字段的完整数据
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public', 'data');
const INPUT_FILE = path.join(DATA_DIR, 'input-holdings.json');
const HOLDINGS_OUTPUT_FILE = path.join(DATA_DIR, 'holdings.json');
const TRANSACTIONS_OUTPUT_FILE = path.join(DATA_DIR, 'transactions.json');
const PUBLIC_HOLDINGS_FILE = path.join(PUBLIC_DATA_DIR, 'holdings.json');
const PUBLIC_TRANSACTIONS_FILE = path.join(PUBLIC_DATA_DIR, 'transactions.json');

// 数据验证函数
function validateHoldings(quarterData, previousQuarterData = null) {
  const errors = [];
  const warnings = [];
  
  // 验证基本数据结构
  if (!quarterData.quarter || !quarterData.date || !quarterData.holdings) {
    errors.push(`❌ ${quarterData.quarter || 'Unknown'}: 缺少必要字段 (quarter, date, holdings)`);
  }
  
  quarterData.holdings.forEach((holding, index) => {
    // 验证持仓数据完整性
    if (!holding.symbol || !holding.company || !holding.shares || !holding.price) {
      errors.push(`❌ ${quarterData.quarter}: 持仓 ${index + 1} 缺少必要字段`);
    }
    
    // 验证价格合理性
    if (holding.price <= 0 || holding.price > 10000) {
      warnings.push(`⚠️  ${quarterData.quarter}: ${holding.symbol} 价格异常 $${holding.price}`);
    }
    
    // 验证股数合理性
    if (holding.shares <= 0 || holding.shares > 1000000) {
      warnings.push(`⚠️  ${quarterData.quarter}: ${holding.symbol} 股数异常 ${holding.shares}`);
    }
  });
  
  // 计算 AUM 并验证增长率
  if (previousQuarterData) {
    const currentAum = quarterData.holdings.reduce((sum, h) => sum + (h.shares * h.price), 0);
    const previousAum = previousQuarterData.holdings.reduce((sum, h) => sum + (h.shares * h.price), 0);
    const growthRate = (currentAum - previousAum) / previousAum;
    
    if (Math.abs(growthRate) > 0.5) {
      warnings.push(`⚠️  ${quarterData.quarter}: AUM 变化 ${(growthRate * 100).toFixed(1)}% 较大，请确认数据正确性`);
    }
  }
  
  // 验证持仓集中度
  const totalValue = quarterData.holdings.reduce((sum, h) => sum + (h.shares * h.price), 0);
  const topHolding = quarterData.holdings.reduce((max, h) => {
    const value = h.shares * h.price;
    return value > max.value ? { symbol: h.symbol, value, percentage: (value / totalValue) * 100 } : max;
  }, { value: 0, percentage: 0 });
  
  if (topHolding.percentage > 50) {
    warnings.push(`⚠️  ${quarterData.quarter}: ${topHolding.symbol} 持仓占比 ${topHolding.percentage.toFixed(1)}% 过高，存在集中度风险`);
  }
  
  return { errors, warnings };
}

// 验证所有数据的函数
function validateAllData(inputData) {
  console.log('\n🔍 开始数据验证...\n');
  let totalErrors = 0;
  let totalWarnings = 0;
  
  inputData.forEach((quarterData, index) => {
    const previousQuarter = index > 0 ? inputData[index - 1] : null;
    const { errors, warnings } = validateHoldings(quarterData, previousQuarter);
    
    if (errors.length > 0) {
      console.log(`📅 ${quarterData.quarter}:`);
      errors.forEach(error => console.log(`  ${error}`));
      totalErrors += errors.length;
    }
    
    if (warnings.length > 0) {
      if (errors.length === 0) console.log(`📅 ${quarterData.quarter}:`);
      warnings.forEach(warning => console.log(`  ${warning}`));
      totalWarnings += warnings.length;
    }
  });
  
  console.log(`\n📊 验证结果: ${totalErrors} 个错误, ${totalWarnings} 个警告\n`);
  
  if (totalErrors > 0) {
    console.log('❌ 发现数据错误，请修复后重试');
    process.exit(1);
  }
  
  if (totalWarnings > 0) {
    console.log('⚠️  发现数据警告，建议检查');
  } else {
    console.log('✅ 所有数据验证通过');
  }
  
  return true;
}

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
    
    // 2. 数据验证
    validateAllData(inputData);
    
    // 3. 计算持仓数据
    console.log('🧮 计算市场价值、AUM 和百分比...');
    const calculatedData = calculateAllQuartersHoldings(inputData);
    
    // 4. 自动生成交易记录
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
    
    // 6. 复制文件到 public 文件夹 (用于客户端访问)
    console.log('📂 确保 public/data 目录存在...');
    if (!fs.existsSync(PUBLIC_DATA_DIR)) {
      fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
    }
    
    console.log('📤 复制文件到 public 文件夹...');
    fs.copyFileSync(HOLDINGS_OUTPUT_FILE, PUBLIC_HOLDINGS_FILE);
    fs.copyFileSync(TRANSACTIONS_OUTPUT_FILE, PUBLIC_TRANSACTIONS_FILE);
    console.log('✅ 文件已复制到 public/data/');
    
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
