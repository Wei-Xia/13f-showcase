# 🚀 AWS 部署指南

## 📋 部署架构

您的 13F 披露网站将使用以下 AWS 服务：

- **S3**: 静态网站托管
- **CloudFront**: CDN 分发和缓存
- **Route 53**: 域名解析（可选）
- **Certificate Manager**: SSL 证书（可选）

## 🔧 AWS 设置步骤

### 1. 创建 S3 存储桶

```bash
# 替换 your-bucket-name 为您的存储桶名称
aws s3 mb s3://your-13f-showcase-bucket --region us-east-1
```

或在 AWS 控制台中：
1. 进入 S3 服务
2. 创建存储桶
3. 启用静态网站托管
4. 设置索引文档为 `index.html`

### 2. 配置 S3 存储桶策略

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-13f-showcase-bucket/*"
    }
  ]
}
```

### 3. 创建 CloudFront 分发

1. 进入 CloudFront 服务
2. 创建分发
3. 源域名：选择您的 S3 存储桶
4. 默认根对象：`index.html`
5. 错误页面：配置 404 重定向到 `index.html`

### 4. 设置 GitHub Secrets

在您的 GitHub 仓库中，进入 Settings → Secrets and variables → Actions，添加以下密钥：

| Secret 名称 | 描述 | 示例值 |
|-------------|------|--------|
| `AWS_ACCESS_KEY_ID` | AWS 访问密钥 ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS 秘密访问密钥 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `S3_BUCKET_NAME` | S3 存储桶名称 | `your-13f-showcase-bucket` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront 分发 ID | `E1PA6795UKMFR9` |
| `DOMAIN_NAME` | 您的域名（可选） | `13f.yourdomain.com` |

### 5. 创建 IAM 用户和策略

为 GitHub Actions 创建专用的 IAM 用户：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-13f-showcase-bucket",
        "arn:aws:s3:::your-13f-showcase-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🚀 部署流程

### 自动部署
每次推送到 `main` 分支时，GitHub Actions 会自动：

1. ✅ 检出代码
2. ⚙️ 安装 Node.js 和依赖
3. 📊 生成最新的持仓数据
4. 🏗️ 构建 Next.js 应用
5. 📤 上传到 S3
6. 🔄 清除 CloudFront 缓存

### 手动部署
您也可以在 GitHub Actions 页面手动触发部署。

## 📁 部署文件结构

```
out/                    # Next.js 静态导出目录
├── index.html         # 主页
├── _next/             # Next.js 资源文件
│   ├── static/        # 静态资源
│   └── ...
├── 404.html          # 404 页面
└── ...               # 其他页面和资源
```

## 🔍 故障排除

### 常见问题

1. **部署失败**
   - 检查 AWS 密钥是否正确设置
   - 确认 S3 存储桶权限配置正确

2. **页面显示 404**
   - 确认 CloudFront 错误页面配置
   - 检查 S3 静态网站托管设置

3. **数据未更新**
   - 确认 `npm run generate-holdings` 步骤成功
   - 检查 CloudFront 缓存是否已清除

### 调试命令

```bash
# 本地测试构建
npm run build

# 检查生成的文件
ls -la out/

# 测试本地服务器
npx serve out
```

## 💡 优化建议

1. **性能优化**
   - 启用 CloudFront 压缩
   - 设置适当的缓存策略
   - 配置 S3 生命周期规则

2. **安全优化**
   - 启用 HTTPS（通过 CloudFront）
   - 配置安全头部
   - 限制 S3 直接访问

3. **监控**
   - 设置 CloudWatch 警报
   - 配置访问日志
   - 监控部署状态

## 🌐 自定义域名（可选）

1. 在 Route 53 中创建托管区域
2. 在 Certificate Manager 中申请 SSL 证书
3. 在 CloudFront 分发中配置自定义域名
4. 更新域名的 DNS 记录

部署完成后，您的 13F 披露网站将在全球 CDN 上高速运行！🎉
