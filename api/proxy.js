// 简化版 Vercel API 代理函数 - 解决 405 问题
const axios = require('axios');

// API 配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// 处理 CORS 预检请求
const handleOptions = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Token, X-UserId');
  res.status(200).end();
};

// 打印请求详情（用于调试）
const logRequest = (prefix, method, url, headers, data) => {
  console.log(`${prefix} - 方法: ${method}`);
  console.log(`${prefix} - URL: ${url}`);
  console.log(`${prefix} - 头部: ${JSON.stringify(headers)}`);
  if (data) console.log(`${prefix} - 数据: ${JSON.stringify(data)}`);
};

module.exports = async (req, res) => {
  console.log(`收到${req.method}请求: ${req.url}`);
  
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }
  
  try {
    // 提取路径 - /api/proxy/xxx
    let path = '';
    if (req.url.includes('/api/proxy/')) {
      path = req.url.split('/api/proxy/')[1];
      // 处理查询参数
      if (path.includes('?')) {
        path = path.split('?')[0];
      }
    } else if (req.query.path) {
      path = req.query.path;
    }
    
    if (!path) {
      return res.status(400).json({ error: '缺少路径参数' });
    }
    
    // 根据请求内容构建目标 URL
    let targetUrl = '';
    let method = req.method;
    
    // 音乐生成接口的特殊处理
    if (path === 'generate' || path.includes('generate')) {
      targetUrl = `${SUNO_API_URL}/open/suno/music/generate`;
      method = 'POST'; // 强制使用 POST 方法
    } 
    // 其他类型的请求
    else {
      // 移除 _open 前缀
      if (path.startsWith('_open/')) {
        path = path.replace('_open/', '');
      }
      
      // 如果路径不包含完整路径，添加默认前缀
      if (!path.includes('open/suno/music/')) {
        targetUrl = `${SUNO_API_URL}/open/suno/music/${path}`;
      } else {
        targetUrl = `${SUNO_API_URL}/${path}`;
      }
    }
    
    // 添加查询参数
    const urlParts = req.url.split('?');
    if (urlParts.length > 1) {
      const queryParams = new URLSearchParams(urlParts[1]);
      queryParams.delete('path'); // 移除 path 参数
      
      const remainingParams = queryParams.toString();
      if (remainingParams) {
        targetUrl += (targetUrl.includes('?') ? '&' : '?') + remainingParams;
      }
    }
    
    // 构建请求头
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Token': SUNO_API_TOKEN || req.headers['x-token'] || '',
      'X-UserId': SUNO_API_USERID || req.headers['x-userid'] || '',
      'Origin': 'https://ai-music-creator.vercel.app'
    };
    
    // 处理请求数据
    let data = null;
    if (method === 'POST' || method === 'PUT') {
      data = req.body || {};
      
      // 音乐生成接口的特殊处理
      if (path.includes('generate')) {
        // 修正参数名称
        data.mvVersion = data.mvVersion || data.myVersion || 'chirp-v4';
        if (data.myVersion) delete data.myVersion;
      }
    }
    
    // 记录请求详情
    logRequest('请求', method, targetUrl, headers, data);
    
    // 发送请求到目标 API
    console.log(`发送${method}请求到: ${targetUrl}`);
    
    const response = await axios({
      method,
      url: targetUrl,
      headers,
      data,
      timeout: 30000 // 30秒超时
    });
    
    console.log(`请求成功，状态码: ${response.status}`);
    
    // 返回 API 响应结果
    return res.status(response.status)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json(response.data);
  } catch (error) {
    console.error(`请求失败: ${error.message}`);
    
    // 记录详细错误信息
    if (error.response) {
      console.error(`错误状态码: ${error.response.status}`);
      console.error(`错误响应数据: ${JSON.stringify(error.response.data || {})}`);
    }
    
    // 返回错误响应
    return res.status(error.response?.status || 500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        error: true,
        message: `API请求失败: ${error.message}`,
        details: error.response?.data || {}
      });
  }
}; 