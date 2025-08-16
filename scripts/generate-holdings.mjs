#!/usr/bin/env node

/**
 * 自动生成 holdings.json 的脚本
 * 从简化的 input-holdings.json 生成包含所有计算字段的完整数据
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const INPUT_FILE = path.join(DATA_DIR, 'input-holdings.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'holdings.json');

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
    console.log('🔄 开始生成 holdings.json...');
    
    // 1. 读取输入数据
    console.log('📖 读取输入数据...');
    const inputData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`✅ 成功读取 ${inputData.length} 个季度的数据`);
    
    // 2. 计算所有字段
    console.log('🧮 计算市场价值、AUM 和百分比...');
    const calculatedData = calculateAllQuartersHoldings(inputData);
    
    // 3. 验证计算结果
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
    
    // 4. 写入输出文件
    console.log('💾 写入 holdings.json...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(calculatedData, null, 2), 'utf8');
    console.log('✅ 成功生成 holdings.json');
    
    // 5. 显示摘要信息
    console.log('\n📊 生成摘要:');
    calculatedData.forEach(quarter => {
      console.log(`\n${quarter.quarter} (${quarter.date}):`);
      console.log(`  💰 AUM: $${quarter.aum.toLocaleString()}`);
      console.log(`  📈 持仓数量: ${quarter.holdings.length}`);
      console.log(`  🏆 最大持仓: ${quarter.holdings[0]?.symbol} (${quarter.holdings[0]?.percentage}%)`);
    });
    
  } catch (error) {
    console.error('❌ 生成过程中出现错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
generateHoldings();

export { generateHoldings };
