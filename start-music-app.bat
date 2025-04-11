@echo off
echo 启动音乐生成API代理服务器...
start cmd /k "node server.js"

echo 等待代理服务器启动...
timeout /t 5

echo 启动前端应用...
start cmd /k "cd . && npm start"

echo 应用程序已启动!
echo 本地代理服务器: http://localhost:5000
echo 前端应用: http://localhost:3000 