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
    let apiPath = '';
    
    // 处理两种可能的URL格式:
    // 1. /api/proxy?path=xxx 
    // 2. /api/proxy/xxx
    if (req.query.path) {
      apiPath = req.query.path;
    } else if (req.url.includes('/api/proxy/')) {
      apiPath = req.url.split('/api/proxy/')[1].split('?')[0];
    }
    
    // 确保有API路径
    if (!apiPath) {
      console.error('缺少API路径参数');
      return res.status(400).json({ error: '缺少API路径参数' });
    }
    
    // 移除可能的前导斜杠，并规范化路径格式
    apiPath = apiPath.replace(/^\//, '');
    
    // 构建完整API URL
    let apiUrl;
    let requestMethod = req.method; // 默认使用请求的原始方法
    
    // 根据路径类型确定API URL和方法
    if (apiPath.includes('suno/music/generate')) {
      // 对于生成音乐的端点，总是使用POST方法
      requestMethod = 'POST';
      
      // 根据路径格式构建正确的URL
      if (apiPath.startsWith('_open/')) {
        apiUrl = `${SUNO_API_URL}/${apiPath.replace('_open/', '')}`;
      } else {
        apiUrl = `${SUNO_API_URL}/open/suno/music/generate`;
      }
    } else if (apiPath.startsWith('_open/')) {
      // 其他 _open 格式的API路径
      apiUrl = `${SUNO_API_URL}/${apiPath.replace('_open/', '')}`;
    } else {
      // 处理旧格式路径
      if (apiPath === 'generate') {
        apiUrl = `${SUNO_API_URL}/open/suno/music/generate`;
        requestMethod = 'POST';
      } else if (apiPath === 'status' || apiPath === 'getState') {
        apiUrl = `${SUNO_API_URL}/open/suno/music/getState`;
        // 将旧的id参数转换为taskBatchId参数
        if (req.query.id && !req.query.taskBatchId) {
          req.query.taskBatchId = req.query.id;
          delete req.query.id;
        }
      } else {
        apiUrl = `${SUNO_API_URL}/${apiPath}`;
      }
    }
    
    console.log(`代理请求到: ${apiUrl}，使用方法: ${requestMethod}`);

    // 设置请求配置 - 使用正确的认证头
    const requestConfig = {
      method: requestMethod,
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Token': SUNO_API_TOKEN || req.headers['x-token'] || '',
        'X-UserId': SUNO_API_USERID || req.headers['x-userid'] || '',
        'Accept': 'application/json',
        'Origin': req.headers.origin || 'https://ai-music-creator.vercel.app'
      }
    };

    // 如果是POST请求或方法被覆盖为POST，附加请求体
    if (requestMethod === 'POST' && req.body) {
      // 直接使用请求体，确保参数命名正确
      if (apiPath.includes('generate') || apiPath === 'generate') {
        // 确保使用正确的参数格式 (mvVersion 而不是 myVersion)
        const newBody = {
          ...req.body,
          mvVersion: req.body.mvVersion || req.body.myVersion || "chirp-v4"
        };
        
        // 移除错误的参数名
        if (newBody.myVersion) delete newBody.myVersion;
        
        requestConfig.data = newBody;
      } else {
        requestConfig.data = req.body;
      }
      console.log('请求数据:', JSON.stringify(requestConfig.data));
    }

    // 如果是GET请求，附加查询参数
    if (requestMethod === 'GET') {
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