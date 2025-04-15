// 音乐API代理服务器
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 启用所有CORS请求
app.use(cors());
app.use(express.json());

// KIE AI API 配置
const KIE_API_URL = process.env.KIE_API_URL || 'https://kieai.erweima.ai/api/v1';
const KIE_API_KEY = process.env.KIE_API_KEY || '153f32022fb5a002b7ac26c94294fe73';

// 生成音乐
app.post('/api/kie/generate', async (req, res) => {
  try {
    const response = await axios.post(`${KIE_API_URL}/generate`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('生成音乐失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 检查状态
app.get('/api/kie/status', async (req, res) => {
  try {
    const { taskId } = req.query;
    const response = await axios.get(`${KIE_API_URL}/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('检查状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取历史记录
app.get('/api/kie/history', async (req, res) => {
  try {
    const response = await axios.get(`${KIE_API_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'build')));

// 处理所有其他路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '代理服务器运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`音乐API地址: ${KIE_API_URL}`);
  console.log('API密钥前几位:', KIE_API_KEY.substring(0, 4) + '...');
}); 