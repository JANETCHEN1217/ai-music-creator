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

// 辅助函数 - 记录详细请求信息
function logRequestDetails(prefix, req, apiPath, apiUrl, method, headers, data) {
  console.log(`${prefix} - 方法:`, method);
  console.log(`${prefix} - 原始URL:`, req.url);
  console.log(`${prefix} - API路径:`, apiPath);
  console.log(`${prefix} - 目标URL:`, apiUrl);
  console.log(`${prefix} - 请求头:`, JSON.stringify(headers));
  if (data) {
    console.log(`${prefix} - 请求数据:`, JSON.stringify(data));
  }
}

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
      apiPath = req.url.split('/api/proxy/')[1];
      // 如果URL包含查询参数，将其分离出来
      if (apiPath.includes('?')) {
        apiPath = apiPath.split('?')[0];
      }
    }
    
    // 确保有API路径
    if (!apiPath) {
      console.error('缺少API路径参数');
      return res.status(400).json({ error: '缺少API路径参数' });
    }
    
    // 移除可能的前导斜杠
    apiPath = apiPath.replace(/^\//, '');
    
    // 构建完整API URL和确定请求方法
    let apiUrl;
    let requestMethod = req.method;
    
    // 特殊处理音乐生成接口
    if (apiPath.includes('generate')) {
      // 强制使用POST方法
      requestMethod = 'POST';
      
      // 直接使用标准URL，不要通过_open格式转换
      apiUrl = `${SUNO_API_URL}/open/suno/music/generate`;
    } 
    // 处理其他_open格式路径
    else if (apiPath.startsWith('_open/')) {
      // 直接将_open替换为open
      apiUrl = `${SUNO_API_URL}/${apiPath.replace('_open/', '')}`;
    }
    // 处理特定的API端点
    else if (apiPath === 'getState' || apiPath === 'status') {
      apiUrl = `${SUNO_API_URL}/open/suno/music/getState`;
    }
    else {
      // 普通路径 - 如果不包含完整路径，添加默认前缀
      if (!apiPath.includes('open/suno/music/')) {
        apiUrl = `${SUNO_API_URL}/open/suno/music/${apiPath}`;
      } else {
        apiUrl = `${SUNO_API_URL}/${apiPath}`;
      }
    }
    
    // 添加查询参数
    const urlParts = req.url.split('?');
    if (urlParts.length > 1) {
      const queryString = urlParts[1];
      const searchParams = new URLSearchParams(queryString);
      searchParams.delete('path'); // 删除path参数
      
      // 将剩余参数添加到API URL
      const remainingParams = searchParams.toString();
      if (remainingParams) {
        apiUrl = apiUrl + (apiUrl.includes('?') ? '&' : '?') + remainingParams;
      }
    }
    
    // 设置请求配置 - 确保包含正确的认证头
    const requestHeaders = {
      'Content-Type': 'application/json',
      'X-Token': SUNO_API_TOKEN || req.headers['x-token'] || '',
      'X-UserId': SUNO_API_USERID || req.headers['x-userid'] || '',
      'Accept': 'application/json',
      'Origin': req.headers.origin || 'https://ai-music-creator.vercel.app'
    };
    
    // 构建请求配置
    const requestConfig = {
      method: requestMethod,
      url: apiUrl,
      headers: requestHeaders,
    };
    
    // 处理请求数据
    let requestData = null;
    if ((requestMethod === 'POST' || requestMethod === 'PUT') && req.body) {
      requestData = { ...req.body };
      
      // 特殊处理生成音乐接口
      if (apiPath.includes('generate')) {
        // 确保使用正确的参数格式 (mvVersion 而不是 myVersion)
        requestData.mvVersion = requestData.mvVersion || requestData.myVersion || "chirp-v4";
        // 删除错误的参数名，以免冲突
        if (requestData.myVersion) delete requestData.myVersion;
      }
      
      // 添加到请求配置
      requestConfig.data = requestData;
    }
    
    // 记录详细请求信息
    logRequestDetails('代理请求', req, apiPath, apiUrl, requestMethod, requestHeaders, requestData);
    
    // 发送请求到目标API
    console.log('执行API请求...');
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
    
    // 记录详细错误信息
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', JSON.stringify(error.response.data || {}));
      console.error('错误响应头:', JSON.stringify(error.response.headers || {}));
    }
    
    if (error.request) {
      console.error('请求信息:', error.request._header || '无请求头信息');
    }
    
    if (error.config) {
      console.error('请求配置:', {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers,
        data: error.config.data
      });
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