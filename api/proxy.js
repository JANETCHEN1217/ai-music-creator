// Vercel API代理函数，解决CORS问题
const axios = require('axios');

// 获取API配置 - 使用正确的API URL格式
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// 设置CORS响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Token, X-UserId'
};

// 处理OPTIONS请求（预检请求）
const handleOptions = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Token, X-UserId');
  res.status(200).end();
};

module.exports = async (req, res) => {
  console.log('收到API代理请求:', req.method, req.url);
  
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  try {
    // 从URL获取API路径
    const rawPath = req.query.path || '';
    
    // 确保有API路径
    if (!rawPath && !req.url.includes('/api/proxy/')) {
      console.error('缺少API路径参数');
      return res.status(400).json({ error: '缺少API路径参数' });
    }
    
    // 提取API路径 - 处理两种可能的URL格式:
    // 1. /api/proxy?path=xxx 
    // 2. /api/proxy/xxx
    let apiPath = '';
    if (rawPath) {
      apiPath = rawPath;
    } else if (req.url.includes('/api/proxy/')) {
      apiPath = req.url.split('/api/proxy/')[1].split('?')[0];
    }
    
    // 确保apiPath没有多余的proxy部分
    apiPath = apiPath.replace(/^proxy\//, '');
    
    // 构建完整API URL - 根据apipost文档
    let apiUrl;
    if (apiPath === 'generate') {
      apiUrl = `${SUNO_API_URL}/open/suno/music/generate`;
    } else if (apiPath === 'status') {
      apiUrl = `${SUNO_API_URL}/open/suno/music/status`;
      // 将旧的id参数转换为taskId参数
      if (req.query.id && !req.query.taskId) {
        req.query.taskId = req.query.id;
        delete req.query.id;
      }
    } else {
      apiUrl = `${SUNO_API_URL}/${apiPath}`;
    }
    
    console.log(`代理请求到: ${apiUrl}`);

    // 设置请求配置 - 使用正确的认证头
    const requestConfig = {
      method: req.method,
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Token': SUNO_API_TOKEN || req.headers['x-token'] || '',
        'X-UserId': SUNO_API_USERID || req.headers['x-userid'] || '',
        'Accept': 'application/json',
        'Origin': req.headers.origin || 'https://ai-music-creator.vercel.app'
      }
    };

    // 如果是POST请求，附加请求体
    if (req.method === 'POST' && req.body) {
      // 构建符合文档的请求正文
      if (apiPath === 'generate') {
        // 确保使用正确的参数格式
        const newBody = {
          myVersion: req.body.myVersion || "chirp-v4",
          inputType: req.body.inputType || "10",
          makeInstrumental: req.body.makeInstrumental || "false",
          gptDescriptionPrompt: req.body.gptDescriptionPrompt || "",
          callbackUrl: req.body.callbackUrl || ""
        };
        requestConfig.data = newBody;
      } else {
        requestConfig.data = req.body;
      }
      console.log('请求数据:', JSON.stringify(requestConfig.data));
    }

    // 如果是GET请求，附加查询参数
    if (req.method === 'GET') {
      const urlParts = req.url.split('?');
      if (urlParts.length > 1) {
        // 保留原始查询参数（除了path）
        const queryString = urlParts[1];
        const searchParams = new URLSearchParams(queryString);
        searchParams.delete('path'); // 删除path参数
        
        // 将剩余参数添加到API URL
        const remainingParams = searchParams.toString();
        if (remainingParams) {
          requestConfig.url = apiUrl + (apiUrl.includes('?') ? '&' : '?') + remainingParams;
        }
      }
    }

    // 发送请求到目标API
    console.log('发送代理请求:', requestConfig.method, requestConfig.url);
    console.log('请求头:', JSON.stringify(requestConfig.headers));
    
    const response = await axios(requestConfig);
    console.log('API响应成功:', response.status);
    
    // 返回API响应
    return res.status(response.status || 200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Token, X-UserId')
      .json(response.data);
  } catch (error) {
    console.error('API请求失败:', error.message);
    if (error.response) {
      console.error('API响应状态码:', error.response.status);
      console.error('API响应数据:', JSON.stringify(error.response.data));
    }
    
    // 返回错误响应
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || { message: error.message };
    
    return res.status(statusCode)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Token, X-UserId')
      .json({
        error: errorData,
        message: '音乐API请求失败: ' + error.message
      });
  }
}; 