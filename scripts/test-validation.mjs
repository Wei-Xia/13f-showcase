#!/usr/bin/env node

/**
 * 测试数据验证功能的脚本
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEST_FILE = path.join(DATA_DIR, 'test-invalid-data.json');

// 从主脚本复制验证函数
function validateHoldings(quarterData, previousQuarterData = null) {
  const errors = [];
  const warnings = [];
  
  if (!quarterData.quarter || !quarterData.date || !quarterData.holdings) {
    errors.push(`❌ ${quarterData.quarter || 'Unknown'}: 缺少必要字段 (quarter, date, holdings)`);
  }
  
  quarterData.holdings.forEach((holding, index) => {
    if (!holding.symbol || !holding.company || !holding.shares || !holding.price) {
      errors.push(`❌ ${quarterData.quarter}: 持仓 ${index + 1} 缺少必要字段`);
    }
    
    if (holding.price <= 0 || holding.price > 10000) {
      warnings.push(`⚠️  ${quarterData.quarter}: ${holding.symbol} 价格异常 $${holding.price}`);
    }
    
    if (holding.shares <= 0 || holding.shares > 1000000) {
      warnings.push(`⚠️  ${quarterData.quarter}: ${holding.symbol} 股数异常 ${holding.shares}`);
    }
  });
  
  return { errors, warnings };
}

function testValidation() {
  console.log('🧪 测试数据验证功能...\n');
  
  try {
    const testData = JSON.parse(fs.readFileSync(TEST_FILE, 'utf8'));
    
    testData.forEach((quarterData, index) => {
      console.log(`📅 验证 ${quarterData.quarter}:`);
      const { errors, warnings } = validateHoldings(quarterData);
      
      if (errors.length > 0) {
        errors.forEach(error => console.log(`  ${error}`));
      }
      
      if (warnings.length > 0) {
        warnings.forEach(warning => console.log(`  ${warning}`));
      }
      
      if (errors.length === 0 && warnings.length === 0) {
        console.log('  ✅ 无问题发现');
      }
    });
    
    console.log('\n✅ 验证测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    // 清理测试文件
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
      console.log('🗑️ 已清理测试文件');
    }
  }
}

testValidation();
