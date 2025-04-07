# AI Music Creator

A modern web application for creating unique music compositions using artificial intelligence.

## Features

- Create AI-generated music compositions
- Customize music style, mood, and duration
- Save and manage your compositions
- Play, download, and share your music
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-music-creator
```

2. Delete node_modules and package-lock.json:
```bash
rm -rf node_modules package-lock.json
```

3. Clear npm cache:
```bash
npm cache clean --force
```

4. Reinstall dependencies:
```bash
npm install
```

5. Install create-react-app:
```bash
npm install -g create-react-app
```

6. Create a new project:
```bash
npx create-react-app ai-music-creator-new
```

7. Copy the source code from the old project to the new one:
```bash
# 将我们之前创建的源代码复制到新项目中
```

8. Start the development server:
```bash
# Windows PowerShell
$env:PORT=3001
npm start

# 或者直接
set PORT=3001 && npm start
```

The application will open in your default browser at `

# 初始化 git 仓库
git init

# 添加所有文件到暂存区
git add .

# 提交更改
git commit -m "Initial commit"

# 添加远程仓库（请将 YOUR_USERNAME 替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/ai-music-creator.git

# 推送代码到 GitHub
git push -u origin main

# 配置 Git 用户名和邮箱
git config --global user.name "JANETCHEN1217"
git config --global user.email "你的邮箱地址"