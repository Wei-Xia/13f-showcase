# 📊 自动计算持仓数据指南

## 🎯 新的工作流程

现在您只需要手动输入最基本的数据，所有复杂的计算都会自动完成！

### 1. 📝 手动输入（简化版）

编辑 `data/input-holdings.json` 文件，只需要输入：

```json
{
  "quarter": "Q3 2025",
  "date": "2025-09-30", 
  "holdings": [
    {
      "symbol": "AAPL",
      "company": "Apple Inc.",
      "shares": 100,
      "price": 180.50
    }
  ]
}
```

**只需要这4个字段：**
- `symbol`: 股票代码
- `company`: 公司名称
- `shares`: 持股数量
- `price`: 季度末收盘价

### 2. 🤖 自动生成完整数据

运行一个命令，自动计算所有字段：

```bash
npm run generate-holdings
```

**自动计算的字段：**
- ✅ `marketValue` = shares × price
- ✅ `aum` = 所有 marketValue 的总和
- ✅ `percentage` = (marketValue / aum) × 100

### 3. 📊 生成的完整数据

自动生成 `data/holdings.json`：

```json
{
  "quarter": "Q3 2025",
  "date": "2025-09-30",
  "aum": 18050,
  "holdings": [
    {
      "symbol": "AAPL",
      "company": "Apple Inc.",
      "shares": 100,
      "price": 180.50,
      "marketValue": 18050,
      "percentage": 100.00
    }
  ]
}
```

## 🔄 季度更新流程

### 步骤 1: 添加新季度数据
在 `data/input-holdings.json` 的数组末尾添加新的季度对象：

```json
[
  // ... 现有季度数据 ...
  {
    "quarter": "Q3 2025",
    "date": "2025-09-30",
    "holdings": [
      {
        "symbol": "VOO",
        "company": "Vanguard S&P 500 ETF", 
        "shares": 200,
        "price": 525.00
      },
      {
        "symbol": "AAPL",
        "company": "Apple Inc.",
        "shares": 50,
        "price": 180.50
      }
    ]
  }
]
```

### 步骤 2: 运行自动计算
```bash
npm run generate-holdings
```

### 步骤 3: 查看结果
脚本会显示：
- ✅ 验证结果
- 💰 每个季度的AUM
- 📈 持仓数量
- 🏆 最大持仓

## ✅ 自动验证

脚本会自动验证：
- 百分比总和是否接近100%
- AUM是否等于所有市场价值的总和
- 数据格式是否正确

## 🛠️ 可用命令

```bash
# 开发服务器
npm run dev

# 生成持仓数据
npm run generate-holdings

# 构建项目
npm run build
```

## 📁 文件结构

```
data/
├── input-holdings.json    # 您手动编辑的简化数据
├── holdings.json         # 自动生成的完整数据（网站使用）
└── transactions.json     # 交易记录（隐私合规）

scripts/
└── generate-holdings.mjs # 自动计算脚本

utils/
└── calculateHoldings.ts  # 计算工具函数
```

## 🎉 优势

1. **简化输入**：只需要输入最基本的4个字段
2. **自动计算**：复杂的数学计算全部自动完成
3. **数据验证**：自动检查数据一致性
4. **错误预防**：减少手动计算错误
5. **快速更新**：一条命令完成所有计算

现在每个季度结束后，您只需要：
1. 获取持股数量和收盘价格
2. 更新 `input-holdings.json`
3. 运行 `npm run generate-holdings`
4. 完成！🎉
