// 音乐API代理服务器
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 启用所有CORS请求
app.use(cors());
app.use(express.json());

// 获取环境变量中的API密钥
const SUNO_API_KEY = process.env.REACT_APP_SUNO_API_KEY || 'cd4c08a93be11e2d434a03705f11068f';
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://api.sunoapi.com/api';

// 创建代理路由
app.post('/proxy/generate', async (req, res) => {
  try {
    console.log('收到音乐生成请求:', req.body);
    
    const response = await axios.post(`${SUNO_API_URL}/generate`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    });
    
    console.log('API响应成功:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('生成音乐时出错:', error.message);
    
    if (error.response) {
      console.error('API错误详情:', error.response.data);
      res.status(error.response.status).json({
        error: error.response.data,
        message: '音乐生成API调用失败'
      });
    } else {
      res.status(500).json({
        error: error.message,
        message: '服务器内部错误'
      });
    }
  }
});

app.post('/proxy/custom-generate', async (req, res) => {
  try {
    console.log('收到自定义音乐生成请求:', req.body);
    
    const response = await axios.post(`${SUNO_API_URL}/custom-generate`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    });
    
    console.log('API响应成功:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('生成自定义音乐时出错:', error.message);
    
    if (error.response) {
      console.error('API错误详情:', error.response.data);
      res.status(error.response.status).json({
        error: error.response.data,
        message: '音乐生成API调用失败'
      });
    } else {
      res.status(500).json({
        error: error.message,
        message: '服务器内部错误'
      });
    }
  }
});

app.get('/proxy/status', async (req, res) => {
  try {
    const trackId = req.query.id;
    console.log(`检查音乐状态, trackId: ${trackId}`);
    
    const response = await axios.get(`${SUNO_API_URL}/status?id=${trackId}`, {
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    });
    
    console.log('状态检查响应:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('检查状态时出错:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data,
        message: '状态检查失败'
      });
    } else {
      res.status(500).json({
        error: error.message,
        message: '服务器内部错误'
      });
    }
  }
});

app.get('/proxy/quota', async (req, res) => {
  try {
    console.log('检查配额');
    
    const response = await axios.get(`${SUNO_API_URL}/quota`, {
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    });
    
    console.log('配额检查响应:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('检查配额时出错:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data,
        message: '配额检查失败'
      });
    } else {
      res.status(500).json({
        error: error.message,
        message: '服务器内部错误'
      });
    }
  }
});

app.get('/proxy/tags', async (req, res) => {
  try {
    console.log('获取标签');
    
    const response = await axios.get(`${SUNO_API_URL}/tags`, {
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    });
    
    console.log('标签响应:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('获取标签时出错:', error.message);
    
    // 返回默认标签，如果API调用失败
    const defaultTags = {
      genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
      moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
      voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
      tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
    };
    
    res.json(defaultTags);
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '代理服务器运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`音乐API地址: ${SUNO_API_URL}`);
  console.log('API密钥前几位:', SUNO_API_KEY.substring(0, 4) + '...');
}); 