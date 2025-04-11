// Vercel API代理函数，解决CORS问题
const axios = require('axios');

// 获取API配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn/api';
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
    
    // 正确处理API路径
    if (apiPath === 'generate' || apiPath === 'open/suno/music/generate') {
      apiPath = '/open/suno/music/generate';
    } else if (apiPath === 'status' && req.query.id) {
      // 将旧的id参数转换为taskId参数
      apiPath = '/status';
      req.query.taskId = req.query.id;
      delete req.query.id;
    } else if (apiPath.startsWith('/')) {
      // 保持路径不变
    } else {
      // 添加前导斜杠
      apiPath = '/' + apiPath;
    }
    
    // 构建完整API URL - 确保URL格式正确
    const baseUrl = SUNO_API_URL.endsWith('/') ? SUNO_API_URL.slice(0, -1) : SUNO_API_URL;
    const apiUrl = `${baseUrl}${apiPath}`;
    console.log(`代理请求到: ${apiUrl}`);

    // 设置请求配置
    const requestConfig = {
      method: req.method,
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Accept': 'application/json',
        'Origin': 'https://ai-music-creator.vercel.app'
      }
    };

    // 如果是POST请求，附加请求体
    if (req.method === 'POST' && req.body) {
      // 处理generate请求的数据转换
      if (apiPath === '/open/suno/music/generate') {
        // 处理旧的API格式转换为新的格式
        if (req.body.prompt || req.body.is_instrumental !== undefined) {
          // 判断需要使用哪种模式
          if (req.body.lyrics || req.body.title) {
            // 自定义模式
            const newBody = {
              myVersion: "chirp-v4",
              inputType: "20",
              makeInstrumental: req.body.is_instrumental === true ? "true" : "false",
              prompt: req.body.lyrics || "",
              tags: req.body.style || "",
              title: req.body.title || req.body.prompt || "我的歌曲",
              callbackUrl: ""
            };
            requestConfig.data = newBody;
          } else {
            // 灵感模式
            const newBody = {
              myVersion: "chirp-v4", 
              inputType: "10",
              makeInstrumental: req.body.is_instrumental === true ? "true" : "false",
              gptDescriptionPrompt: req.body.prompt || "一首愉快的阳光歌曲",
              callbackUrl: ""
            };
            requestConfig.data = newBody;
          }
        } else {
          // 已经是新格式，不需要转换
          requestConfig.data = req.body;
        }
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
    const response = await axios(requestConfig);
    console.log('API响应成功');
    
    // 返回API响应
    return res.status(response.status || 200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .json(response.data);
  } catch (error) {
    console.error('API请求失败:', error.message);
    if (error.response) {
      console.error('API响应状态码:', error.response.status);
      console.error('API响应数据:', error.response.data);
    }
    
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
        message: '音乐API请求失败: ' + error.message
      });
  }
}; 