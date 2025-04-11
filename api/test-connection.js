// 测试连接到Suno API的服务
const axios = require('axios');

// 获取API配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// 处理CORS预检请求
const handleOptions = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Token, X-UserId');
  res.status(200).end();
};

module.exports = async (req, res) => {
  console.log('收到测试连接请求:', req.method, req.url);
  
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  try {
    // 尝试多种请求方法和格式
    const testResults = [];
    
    // 1. 测试使用 X-Token 和 X-UserId 头部直接访问 
    try {
      const directResponse = await axios({
        method: 'GET',
        url: `${SUNO_API_URL}/open/suno/music/getState`,
        headers: {
          'X-Token': SUNO_API_TOKEN,
          'X-UserId': SUNO_API_USERID,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      testResults.push({
        method: 'Direct API call with X-Token headers',
        status: directResponse.status,
        success: true,
        response: directResponse.data
      });
    } catch (error) {
      testResults.push({
        method: 'Direct API call with X-Token headers',
        success: false,
        status: error.response?.status,
        error: error.message,
        data: error.response?.data
      });
    }
    
    // 2. 测试通过代理转发 X-Token 和 X-UserId 头部
    try {
      const proxyResponse = await axios({
        method: 'GET',
        url: `${SUNO_API_URL}/open/suno/music/getState`,
        headers: {
          'X-Token': SUNO_API_TOKEN,
          'X-UserId': SUNO_API_USERID,
          'Content-Type': 'application/json',
          'Origin': req.headers.origin || 'https://ai-music-creator.vercel.app'
        },
        timeout: 5000
      });
      
      testResults.push({
        method: 'Proxy forwarded with X-Token headers',
        status: proxyResponse.status,
        success: true,
        response: proxyResponse.data
      });
    } catch (error) {
      testResults.push({
        method: 'Proxy forwarded with X-Token headers',
        success: false,
        status: error.response?.status,
        error: error.message,
        data: error.response?.data
      });
    }
    
    // 3. 测试OPTIONS请求
    try {
      const optionsResponse = await axios({
        method: 'OPTIONS',
        url: `${SUNO_API_URL}/open/suno/music/getState`,
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'X-Token, X-UserId, Content-Type',
          'Origin': req.headers.origin || 'https://ai-music-creator.vercel.app'
        },
        timeout: 5000
      });
      
      testResults.push({
        method: 'OPTIONS preflight',
        status: optionsResponse.status,
        success: true,
        response: optionsResponse.headers
      });
    } catch (error) {
      testResults.push({
        method: 'OPTIONS preflight',
        success: false,
        status: error.response?.status,
        error: error.message,
        data: error.response?.data
      });
    }
    
    // 返回所有测试结果
    return res.status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        success: true,
        message: '连接测试完成',
        results: testResults,
        apiConfig: {
          url: SUNO_API_URL,
          hasToken: !!SUNO_API_TOKEN,
          hasUserId: !!SUNO_API_USERID
        }
      });
  } catch (error) {
    console.error('测试连接失败:', error.message);
    
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        success: false,
        message: '测试连接失败: ' + error.message
      });
  }
}; 