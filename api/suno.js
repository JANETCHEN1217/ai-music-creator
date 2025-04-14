// 极简Suno API代理服务 - 解决405错误问题
const axios = require('axios');

// API配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// 统一的CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// 处理预检请求
const handleOptions = (req, res) => {
  res.writeHead(200, corsHeaders);
  res.end();
};

// 处理API请求
const handleRequest = async (req, res) => {
  // 设置CORS头
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    // 判断请求路径
    const url = req.url;
    console.log('收到请求:', req.method, url);

    // 提取API端点
    let endpoint = '';
    let method = req.method;
    let data = null;

    // 生成音乐
    if (url.includes('/generate')) {
      endpoint = 'open/suno/music/generate';
      method = 'POST';
      
      // 获取请求体
      data = await getRequestBody(req);
      console.log('请求数据:', data);
    }
    // 检查状态
    else if (url.includes('/status')) {
      endpoint = 'open/suno/music/getState';
      method = 'GET';
      
      // 从URL提取查询参数
      const params = getQueryParams(url);
      if (params.taskBatchId) {
        endpoint += `?taskBatchId=${params.taskBatchId}`;
      }
    }
    // 生成歌词
    else if (url.includes('/lyrics')) {
      endpoint = 'open/suno/music/generateLyrics';
      method = 'POST';
      
      // 获取请求体
      data = await getRequestBody(req);
    }
    // 默认端点
    else {
      return sendError(res, 400, '未知的API端点');
    }

    // 构建完整URL
    const apiUrl = `${SUNO_API_URL}/${endpoint}`;
    console.log('调用API:', method, apiUrl);

    // 发送请求
    const response = await axios({
      method,
      url: apiUrl,
      headers: {
        'X-Token': SUNO_API_TOKEN,
        'X-UserId': SUNO_API_USERID,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://ai-music-creator.vercel.app'
      },
      data
    });

    // 返回响应
    console.log('API响应状态:', response.status);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response.data));

  } catch (error) {
    console.error('API错误:', error.message);
    
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || { message: error.message };
    
    sendError(res, statusCode, '请求失败', errorData);
  }
};

// 辅助函数 - 获取请求体
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString();
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
};

// 辅助函数 - 获取查询参数
const getQueryParams = (url) => {
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = value;
    });
  }
  return params;
};

// 辅助函数 - 发送错误响应
const sendError = (res, status, message, details = {}) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    error: true,
    message,
    details
  }));
};

// 导出处理函数
module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
  } else {
    handleRequest(req, res);
  }
}; 