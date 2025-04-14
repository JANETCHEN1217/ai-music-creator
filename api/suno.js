// 直接面向Suno API的Vercel代理服务
import axios from 'axios';

// Suno API配置 - 明确使用环境变量
const SUNO_API_URL = process.env.SUNO_API_URL || process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.SUNO_API_TOKEN || process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.SUNO_API_USERID || process.env.REACT_APP_SUNO_API_USERID || '';

// 显示环境配置信息
console.log("API环境配置:", {
  SUNO_API_URL: SUNO_API_URL,
  SUNO_API_TOKEN: SUNO_API_TOKEN ? "已设置" : "未设置",
  SUNO_API_USERID: SUNO_API_USERID ? "已设置" : "未设置",
  NODE_ENV: process.env.NODE_ENV
});

// API请求方法 - 统一处理API调用
const callSunoApi = async (method, endpoint, data = null, params = {}) => {
  // 构建完整URL
  const url = `${SUNO_API_URL}/${endpoint}`;
  
  // 打印详细的请求信息
  console.log(`调用Suno API: ${method.toUpperCase()} ${url}`);
  if (data) console.log('请求数据:', JSON.stringify(data));
  if (Object.keys(params).length > 0) console.log('请求参数:', JSON.stringify(params));
  
  // 检查API凭证
  if (!SUNO_API_TOKEN || !SUNO_API_USERID) {
    console.error('API凭证未设置:', {
      'X-Token': SUNO_API_TOKEN ? '已设置' : '未设置',
      'X-UserId': SUNO_API_USERID ? '已设置' : '未设置'
    });
    throw { status: 500, message: 'API凭证未正确配置，请联系管理员' };
  }
  
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
      console.error('错误详情:', JSON.stringify(error.response.data));
      throw { status: error.response.status, message: JSON.stringify(error.response.data) };
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
    console.log(`收到${req.method}请求, 路径: ${path}`, JSON.stringify(req.body));
    
    // 检查API配置
    if (!SUNO_API_TOKEN || !SUNO_API_USERID) {
      console.error('API凭证未完全配置');
      return error(500, '服务配置不完整，请联系管理员');
    }
    
    // 生成音乐
    if (path === 'generate') {
      if (req.method !== 'POST') {
        return error(405, '不支持的请求方法');
      }
      
      try {
        const result = await callSunoApi(
          'post', 
          'open/suno/music/generate', 
          req.body
        );
        
        return success(result.data);
      } catch (err) {
        console.error('生成音乐失败:', err);
        return error(err.status || 500, `音乐生成失败: ${err.message}`);
      }
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
      
      try {
        const result = await callSunoApi(
          'get', 
          'open/suno/music/getState', 
          null, 
          { taskBatchId }
        );
        
        return success(result.data);
      } catch (err) {
        console.error('查询状态失败:', err);
        return error(err.status || 500, `状态查询失败: ${err.message}`);
      }
    }
    
    // 生成歌词
    else if (path === 'lyrics') {
      if (req.method !== 'POST') {
        return error(405, '不支持的请求方法');
      }
      
      try {
        const result = await callSunoApi(
          'post', 
          'open/suno/music/generateLyrics', 
          req.body
        );
        
        return success(result.data);
      } catch (err) {
        console.error('生成歌词失败:', err);
        return error(err.status || 500, `歌词生成失败: ${err.message}`);
      }
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
      
      try {
        const result = await callSunoApi(
          'get', 
          'open/suno/music/stems', 
          null, 
          { clipId }
        );
        
        return success(result.data);
      } catch (err) {
        console.error('伴奏分离失败:', err);
        return error(err.status || 500, `伴奏分离失败: ${err.message}`);
      }
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
      
      try {
        const result = await callSunoApi(
          'get', 
          'open/suno/music/wav', 
          null, 
          { clipId }
        );
        
        return success(result.data);
      } catch (err) {
        console.error('获取WAV失败:', err);
        return error(err.status || 500, `获取WAV失败: ${err.message}`);
      }
    }
    
    // 历史记录
    else if (path === 'my') {
      if (req.method !== 'GET') {
        return error(405, '不支持的请求方法');
      }
      
      const { pageNum, pageSize } = req.query;
      
      try {
        const result = await callSunoApi(
          'get', 
          'open/suno/music/my', 
          null, 
          { pageNum: pageNum || 1, pageSize: pageSize || 10 }
        );
        
        return success(result.data);
      } catch (err) {
        console.error('获取历史记录失败:', err);
        return error(err.status || 500, `获取历史记录失败: ${err.message}`);
      }
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