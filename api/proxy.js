// Vercel API代理函数，解决CORS问题
const axios = require('axios');

// 获取API配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://api.sunoapi.com/api';
const SUNO_API_KEY = process.env.REACT_APP_SUNO_API_KEY || 'cd4c08a93be11e2d434a03705f11068f';

// 设置CORS响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// 处理OPTIONS请求（预检请求）
const handleOptions = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
};

module.exports = async (req, res) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  // 从URL获取API路径
  const apiPath = req.query.path || '';
  if (!apiPath) {
    return res.status(400).json({ error: '缺少API路径参数' });
  }

  // 构建API URL
  const apiUrl = `${SUNO_API_URL}/${apiPath}`;
  console.log(`代理请求到: ${apiUrl}`);

  try {
    // 设置请求配置
    const requestConfig = {
      method: req.method,
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    };

    // 如果是POST请求，附加请求体
    if (req.method === 'POST' && req.body) {
      requestConfig.data = req.body;
      console.log('请求数据:', JSON.stringify(req.body));
    }

    // 如果是GET请求，附加查询参数（除了path参数）
    if (req.method === 'GET' && req.query) {
      const { path, ...queryParams } = req.query;
      if (Object.keys(queryParams).length > 0) {
        requestConfig.params = queryParams;
      }
    }

    // 发送请求到目标API
    const response = await axios(requestConfig);
    
    // 返回API响应
    return res.status(response.status || 200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .json(response.data);
  } catch (error) {
    console.error('API请求失败:', error.message);
    
    // 返回错误响应
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || { message: error.message };
    
    return res.status(statusCode)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .json({
        error: errorData,
        message: '音乐API请求失败'
      });
  }
}; 