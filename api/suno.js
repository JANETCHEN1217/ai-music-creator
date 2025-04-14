// 直接面向Suno API的Vercel代理服务
import axios from 'axios';

// Suno API配置 - 明确使用环境变量
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// API请求方法 - 统一处理API调用
const callSunoApi = async (method, endpoint, data = null, params = {}) => {
  // 构建完整URL
  const url = `${SUNO_API_URL}/${endpoint}`;
  
  // 打印详细的请求信息
  console.log(`调用Suno API: ${method.toUpperCase()} ${url}`);
  if (data) console.log('请求数据:', JSON.stringify(data));
  if (Object.keys(params).length > 0) console.log('请求参数:', JSON.stringify(params));
  
  try {
    // 发送API请求
    const response = await axios({
      method: method.toLowerCase(),
      url: url,
      headers: {
        'X-Token': SUNO_API_TOKEN,
        'X-UserId': SUNO_API_USERID,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: params,
      data: data,
      timeout: 30000 // 30秒超时
    });
    
    console.log(`API响应状态码: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error('API请求失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', error.response.data);
      throw { status: error.response.status, data: error.response.data };
    }
    throw { status: 500, message: error.message };
  }
};

// 处理请求
export default async function handler(req, res) {
  // 允许CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 默认响应格式
  const success = (data) => res.status(200).json({
    code: 200,
    msg: 'success',
    data: data
  });
  
  const error = (status, message) => res.status(status).json({
    code: status,
    msg: message
  });

  try {
    const { path } = req.query;
    console.log(`收到${req.method}请求, 路径: ${path}`);
    
    // 生成音乐
    if (path === 'generate') {
      if (req.method !== 'POST') {
        return error(405, '不支持的请求方法');
      }
      
      const result = await callSunoApi(
        'post', 
        'open/suno/music/generate', 
        req.body
      );
      
      return success(result.data);
    }
    
    // 查询状态
    else if (path === 'status') {
      if (req.method !== 'GET') {
        return error(405, '不支持的请求方法');
      }
      
      const { taskBatchId } = req.query;
      if (!taskBatchId) {
        return error(400, '缺少必要参数: taskBatchId');
      }
      
      const result = await callSunoApi(
        'get', 
        'open/suno/music/getState', 
        null, 
        { taskBatchId }
      );
      
      return success(result.data);
    }
    
    // 生成歌词
    else if (path === 'lyrics') {
      if (req.method !== 'POST') {
        return error(405, '不支持的请求方法');
      }
      
      const result = await callSunoApi(
        'post', 
        'open/suno/music/generateLyrics', 
        req.body
      );
      
      return success(result.data);
    }
    
    // 伴奏分离
    else if (path === 'stems') {
      if (req.method !== 'GET') {
        return error(405, '不支持的请求方法');
      }
      
      const { clipId } = req.query;
      if (!clipId) {
        return error(400, '缺少必要参数: clipId');
      }
      
      const result = await callSunoApi(
        'get', 
        'open/suno/music/stems', 
        null, 
        { clipId }
      );
      
      return success(result.data);
    }
    
    // WAV下载
    else if (path === 'wav') {
      if (req.method !== 'GET') {
        return error(405, '不支持的请求方法');
      }
      
      const { clipId } = req.query;
      if (!clipId) {
        return error(400, '缺少必要参数: clipId');
      }
      
      const result = await callSunoApi(
        'get', 
        'open/suno/music/wav', 
        null, 
        { clipId }
      );
      
      return success(result.data);
    }
    
    // 历史记录
    else if (path === 'my') {
      if (req.method !== 'GET') {
        return error(405, '不支持的请求方法');
      }
      
      const { pageNum, pageSize } = req.query;
      
      const result = await callSunoApi(
        'get', 
        'open/suno/music/my', 
        null, 
        { pageNum: pageNum || 1, pageSize: pageSize || 10 }
      );
      
      return success(result.data);
    }
    
    // 未知端点
    else {
      return error(400, `未知的API端点: ${path}`);
    }
  } catch (err) {
    console.error('处理请求失败:', err);
    return error(err.status || 500, err.message || '服务器内部错误');
  }
} 