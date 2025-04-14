// 直接面向Suno API的Vercel代理服务
import axios from 'axios';

// Suno API配置 - 明确使用环境变量
const SUNO_API_URL = process.env.SUNO_API_URL || process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.SUNO_API_TOKEN || process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.SUNO_API_USERID || process.env.REACT_APP_SUNO_API_USERID || '13411892959';

// 显示环境配置信息
console.log("API环境配置:", {
  SUNO_API_URL: SUNO_API_URL,
  SUNO_API_TOKEN: SUNO_API_TOKEN ? "已设置" : "未设置",
  SUNO_API_USERID: SUNO_API_USERID ? "已设置" : "未设置",
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV
});

// API请求方法 - 统一处理API调用
const callSunoApi = async (method, endpoint, data = null, params = {}, customToken = null) => {
  try {
    // 构建完整URL
    const url = `${SUNO_API_URL}/${endpoint}`;
    
    // 使用自定义令牌或环境变量中的令牌
    const apiToken = customToken || SUNO_API_TOKEN;
    
    // 打印详细的请求信息
    console.log(`调用Suno API: ${method.toUpperCase()} ${url}`);
    console.log('API凭证:', {
      'X-Token': apiToken ? '已设置' : '未设置',
      'X-UserId': SUNO_API_USERID
    });
    
    if (data) console.log('请求数据:', JSON.stringify(data, null, 2));
    if (Object.keys(params).length > 0) console.log('请求参数:', JSON.stringify(params, null, 2));
    
    // 检查API凭证
    if (!apiToken) {
      console.error('API令牌未设置');
      throw { status: 500, message: 'API令牌未设置，请联系管理员' };
    }
    
    // 格式化请求数据
    let formattedData = data;
    if (data && endpoint === 'open/suno/music/generate') {
      // 确保数据格式正确
      formattedData = {
        ...data,
        // 确保字段名称正确
        mvVersion: data.mvVersion || data.myVersion || "chirp-v4",
        // 确保布尔值正确转换为字符串
        makeInstrumental: data.makeInstrumental === true ? "true" : "false"
      };
      // 移除可能导致问题的字段
      if (formattedData.myVersion) delete formattedData.myVersion;
      
      console.log('格式化后的请求数据:', JSON.stringify(formattedData, null, 2));
    }
    
    // 格式化参数
    const queryParams = { ...params };
    
    // 准备请求配置
    const requestConfig = {
      method: method.toLowerCase(),
      url: url,
      headers: {
        'X-Token': apiToken,
        'X-UserId': SUNO_API_USERID,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: queryParams,
      data: formattedData,
      timeout: 30000 // 30秒超时
    };
    
    console.log('最终请求配置:', JSON.stringify({
      method: requestConfig.method,
      url: requestConfig.url,
      headers: {
        'X-Token': apiToken ? '已设置' : '未设置',
        'X-UserId': SUNO_API_USERID,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: requestConfig.params,
      data: requestConfig.data
    }, null, 2));
    
    // 发送API请求
    const response = await axios(requestConfig);
    
    console.log(`API响应状态码: ${response.status}`);
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('API请求失败:', error.message);
    console.error('完整错误信息:', JSON.stringify(error, null, 2));
    
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
      console.error('请求头:', JSON.stringify(error.config?.headers, null, 2));
      console.error('请求URL:', error.config?.url);
      console.error('请求方法:', error.config?.method);
      throw { 
        status: error.response.status, 
        message: `API错误: ${JSON.stringify(error.response.data)}`
      };
    }
    
    // 更详细的错误处理
    if (error.code === 'ECONNREFUSED') {
      console.error('无法连接到API服务器');
      throw { status: 500, message: `无法连接到API服务器: ${SUNO_API_URL}` };
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('找不到API服务器域名');
      throw { status: 500, message: `无法解析API服务器域名: ${SUNO_API_URL}` };
    }
    
    if (error.code === 'ETIMEDOUT') {
      console.error('API请求超时');
      throw { status: 500, message: 'API请求超时，请稍后重试' };
    }
    
    console.error('其他错误:', error);
    throw { status: 500, message: `请求失败: ${error.message}` };
  }
};

// 处理请求
export default async function handler(req, res) {
  // 允许CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-TOKEN');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    console.log('处理CORS预检请求');
    return res.status(200).end();
  }

  // 默认响应格式
  const success = (data) => res.status(200).json({
    code: 200,
    msg: 'success',
    data: data
  });
  
  const error = (status, message) => {
    console.error(`返回错误: ${status} - ${message}`);
    return res.status(status).json({
      code: status,
      msg: message
    });
  };

  try {
    const { path } = req.query;
    console.log(`收到${req.method}请求, 路径: ${path}`, JSON.stringify(req.body, null, 2));
    
    // 从请求头中获取自定义令牌
    const customToken = req.headers['x-api-token'];
    if (customToken) {
      console.log('使用客户端提供的API令牌');
    }
    
    // 使用环境变量中的令牌或客户端提供的令牌
    const apiToken = customToken || SUNO_API_TOKEN;
    
    // 检查API配置
    if (!apiToken) {
      console.error('API令牌未设置');
      return error(500, '服务配置不完整: API令牌未设置，请联系管理员');
    }
    
    // 生成音乐
    if (path === 'generate') {
      if (req.method !== 'POST') {
        return error(405, '不支持的请求方法');
      }
      
      try {
        console.log('处理音乐生成请求');
        const result = await callSunoApi(
          'post', 
          'open/suno/music/generate', 
          req.body,
          {},
          apiToken
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
        console.log('处理状态查询请求');
        const result = await callSunoApi(
          'get', 
          'open/suno/music/getState', 
          null, 
          { taskBatchId },
          apiToken
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
        console.log('处理歌词生成请求');
        const result = await callSunoApi(
          'post', 
          'open/suno/music/generateLyrics', 
          req.body,
          {},
          apiToken
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
        console.log('处理伴奏分离请求');
        const result = await callSunoApi(
          'get', 
          'open/suno/music/stems', 
          null, 
          { clipId },
          apiToken
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
        console.log('处理WAV下载请求');
        const result = await callSunoApi(
          'get', 
          'open/suno/music/wav', 
          null, 
          { clipId },
          apiToken
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
        console.log('处理历史记录请求');
        const result = await callSunoApi(
          'get', 
          'open/suno/music/my', 
          null, 
          { pageNum: pageNum || 1, pageSize: pageSize || 10 },
          apiToken
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