#!/bin/bash

# 本地部署测试脚本
# 模拟 AWS 部署流程

echo "🔄 开始本地部署测试..."

# 1. 生成最新的持仓数据
echo "📊 生成持仓数据..."
npm run generate-holdings
if [ $? -ne 0 ]; then
    echo "❌ 生成持仓数据失败"
    exit 1
fi

# 2. 构建应用
echo "🏗️ 构建 Next.js 应用..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 3. 检查输出文件
echo "📁 检查输出文件..."
if [ ! -d "out" ]; then
    echo "❌ 输出目录不存在"
    exit 1
fi

if [ ! -f "out/index.html" ]; then
    echo "❌ 主页文件不存在"
    exit 1
fi

# 4. 显示文件大小统计
echo "📊 文件大小统计:"
echo "总文件数: $(find out -type f | wc -l)"
echo "总大小: $(du -sh out | cut -f1)"

# 5. 启动本地预览服务器
echo "🌐 启动本地预览服务器..."
echo "📍 URL: http://localhost:3000"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

# 检查是否安装了 serve
if ! command -v serve &> /dev/null; then
    echo "⚠️  未安装 serve，正在安装..."
    npm install -g serve
fi

serve out -p 3000
