// 直接面向Suno API的Vercel代理服务
const axios = require('./axios');

// Suno API配置 - 明确使用环境变量
const SUNO_API_URL = process.env.SUNO_API_URL || process.env.REACT_APP_SUNO_API_URL || 'https://dzwlai.com/apiuser';
const SUNO_API_TOKEN = process.env.SUNO_API_TOKEN || process.env.REACT_APP_SUNO_API_TOKEN || 'sk-14c3e692bb0943b98f682a9d19b500b9';
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
const callSunoApi = async (method, endpoint, data = null, params = {}, customToken = null, customUserId = null) => {
  try {
    // 构建完整URL - 使用正确的API端点
    const url = `${SUNO_API_URL}/_open/suno/music/${endpoint}`;
    
    // 使用自定义令牌或环境变量中的令牌
    const apiToken = customToken || SUNO_API_TOKEN || 'sk-14c3e692bb0943b98f682a9d19b500b9';
    const userId = customUserId || SUNO_API_USERID || '13411892959';
    
    // 打印详细的请求信息
    console.log(`调用Suno API: ${method.toUpperCase()} ${url}`);
    console.log('API凭证:', {
      'X-Token': apiToken ? '已设置' : '未设置',
      'X-UserId': userId || '未设置'
    });
    
    if (data) console.log('请求数据:', JSON.stringify(data, null, 2));
    if (Object.keys(params).length > 0) console.log('请求参数:', JSON.stringify(params, null, 2));
    
    // 检查API凭证
    if (!apiToken) {
      console.error('API令牌未设置');
      throw { status: 500, message: 'API令牌未设置，请联系管理员' };
    }
    
    // 合并请求数据和参数到一个对象中
    let requestData = { ...data } || {};
    let queryParams = {};
    
    // 使用正确的HTTP方法 - 对于getState使用GET方法
    const httpMethod = (endpoint === 'getState') ? 'get' : method;
    
    // 如果是GET请求，将数据放入查询参数
    if (httpMethod.toLowerCase() === 'get') {
      queryParams = { ...requestData, ...params };
      requestData = null; // GET请求不需要请求体
    } else {
      // 将查询参数也添加到请求体中
      if (Object.keys(params).length > 0) {
        requestData = { ...requestData, ...params };
      }
    }
    
    // 特别处理生成音乐的情况
    if (endpoint === 'generate') {
      // 确保字段名称正确
      requestData.mvVersion = requestData.mvVersion || requestData.myVersion || "chirp-v4";
      // 确保布尔值正确转换为字符串
      if (typeof requestData.makeInstrumental === 'boolean') {
        requestData.makeInstrumental = requestData.makeInstrumental ? "true" : "false";
      }
      // 移除可能导致问题的字段
      if (requestData.myVersion) delete requestData.myVersion;
    }
    
    console.log('最终请求数据:', requestData ? JSON.stringify(requestData, null, 2) : '无 (GET请求)');
    
    // 构建URL查询字符串 - 对于GET请求
    let fullUrl = url;
    if (httpMethod.toLowerCase() === 'get' && Object.keys(queryParams).length > 0) {
      const urlParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        urlParams.append(key, value);
      }
      fullUrl = `${url}?${urlParams.toString()}`;
    }
    
    // 准备请求配置 - 使用X-Token和X-UserId作为认证头
    const requestConfig = {
      method: httpMethod,
      url: fullUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Token': apiToken,
        'X-UserId': userId
      },
      ...(requestData ? { data: requestData } : {}),
      timeout: 30000
    };
    
    console.log('最终请求配置:', JSON.stringify({
      method: requestConfig.method,
      url: requestConfig.url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Token': apiToken ? '已设置' : '未设置',
        'X-UserId': userId || '未设置'
      },
      ...(requestData ? { data: '已设置' } : { data: '无 (GET请求)' })
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
      throw { status: 500, message: `无法连接到API服务器: ${url}` };
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('找不到API服务器域名');
      throw { status: 500, message: `无法解析API服务器域名: ${url}` };
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-TOKEN, X-Token, X-UserId');

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
    
    // 从多个可能的来源获取令牌
    const customToken = req.headers['x-api-token'] || req.headers['x-token'] || req.body?.token;
    
    // 如果请求头中有用户ID，也使用它
    const customUserId = req.headers['x-userid'] || req.body?.userId;
    
    if (customToken) {
      console.log('使用客户端提供的API令牌');
    }
    
    if (customUserId) {
      console.log('使用客户端提供的用户ID');
    }
    
    // 使用环境变量中的令牌、客户端提供的令牌，或者硬编码的备用令牌
    const apiToken = customToken || SUNO_API_TOKEN || 'sk-14c3e692bb0943b98f682a9d19b500b9';
    const userId = customUserId || SUNO_API_USERID || '13411892959';
    
    // 检查API配置 - 虽然有备用令牌，但还是进行检查
    if (!apiToken) {
      console.error('API令牌未设置');
      return error(500, '服务配置不完整: API令牌未设置，请联系管理员');
    }
    
    // 显示将使用的API凭据（隐藏完整令牌）
    console.log('使用的API凭据:', {
      'token': apiToken ? `${apiToken.substring(0, 5)}...${apiToken.substring(apiToken.length - 5)}` : '未设置',
      'userId': userId || '未设置'
    });
    
    // 生成音乐
    if (path === 'generate') {
      try {
        console.log('处理音乐生成请求');
        const result = await callSunoApi(
          'post', 
          'generate', 
          req.body,
          {},
          apiToken,
          userId
        );
        
        return success(result.data);
      } catch (err) {
        console.error('生成音乐失败:', err);
        return error(err.status || 500, `音乐生成失败: ${err.message}`);
      }
    }
    
    // 查询状态
    else if (path === 'status') {
      // 从查询参数或请求体中获取taskBatchId
      const taskBatchId = req.query.taskBatchId || req.body?.taskBatchId;
      
      if (!taskBatchId) {
        return error(400, '缺少必要参数: taskBatchId');
      }
      
      try {
        console.log('处理状态查询请求，taskBatchId:', taskBatchId);
        
        // 构建带有taskBatchId的请求数据
        const requestData = { taskBatchId };
        
        const result = await callSunoApi(
          'get',  // 使用GET方法调用getState接口
          'getState', 
          requestData,
          {},
          apiToken,
          userId
        );
        
        console.log('原始状态查询响应:', JSON.stringify(result, null, 2));
        
        // 检查响应结构是否正确
        if (!result.data) {
          console.error('API返回的状态数据结构不完整:', result);
          return error(500, '服务器返回的状态数据不完整');
        }
        
        // 打印更详细的响应内容，帮助排查
        console.log('状态数据详情:');
        console.log('- taskStatus:', result.data.taskStatus);
        console.log('- items:', JSON.stringify(result.data.items || [], null, 2));
        
        // 如果响应中taskStatus字段是success，则手动创建一个已完成的响应
        // 确保生成的歌曲可以显示，即使API的返回格式不完全符合预期
        let responseData;
        
        if (result.data.taskStatus === 'success' || 
            result.data.status === 'success' || 
            result.data.taskStatus === 'complete') {
          // 将API返回改造为前端需要的格式
          
          // 确保items数组存在
          const items = result.data.items || [];
          const enhancedItems = items.length > 0 ? items : [{}]; // 至少有一个item
          
          // 增强items数组中的每个项，确保关键字段存在
          const processedItems = enhancedItems.map(item => {
            // 确保每个关键字段都存在 - 如果不存在则创建示例数据
            const enhancedItem = {
              ...item,
              // 模型ID或歌曲ID
              taskId: item.taskId || result.data.taskBatchId || taskBatchId,
              
              // 歌曲名称
              title: item.title || result.data.title || '生成的音乐',
              
              // 歌曲音频URL
              url: item.url || item.fileUrl || item.mp3Url || 
                  (`https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${item.clipId || taskBatchId}`),
              
              // 封面图片URL
              imageUrl: item.imageUrl || item.coverUrl || item.coverImageUrl || 
                       `https://source.unsplash.com/random/300x300?music&${taskBatchId}`,
              
              // 歌词 - 没有则使用默认歌词
              lyrics: item.lyrics || "这是AI生成的音乐\n暂无歌词\nAI Music Creator",
              
              // 歌曲时长
              duration: item.duration || 30
            };
            return enhancedItem;
          });
          
          responseData = {
            taskStatus: 'success',
            status: 'success', // 同时提供两种状态字段，确保前端能识别
            items: processedItems,
            taskBatchId: taskBatchId,
            // 添加原始响应，方便调试
            originalResponse: result.data
          };
        } else {
          // 其他状态（处理中或失败）
          responseData = {
            taskStatus: result.data.taskStatus || result.data.status || 'processing',
            status: result.data.taskStatus || result.data.status || 'processing',
            items: (result.data.items || []).map(item => ({
              ...item,
              // 确保有正确的URL字段格式，即使是进行中状态
              url: item.url || item.fileUrl || item.mp3Url,
              imageUrl: item.imageUrl || item.coverUrl || item.coverImageUrl
            })),
            taskBatchId: taskBatchId,
            // 添加原始响应，方便调试
            originalResponse: result.data
          };
        }
        
        console.log('发送给前端的响应:', JSON.stringify(responseData, null, 2));
        
        return success(responseData);
      } catch (err) {
        console.error('查询状态失败:', err);
        return error(err.status || 500, `状态查询失败: ${err.message}`);
      }
    }
    
    // 生成歌词
    else if (path === 'lyrics') {
      try {
        console.log('处理歌词生成请求');
        const result = await callSunoApi(
          'post', 
          'generateLyrics', 
          req.body,
          {},
          apiToken,
          userId
        );
        
        return success(result.data);
      } catch (err) {
        console.error('生成歌词失败:', err);
        return error(err.status || 500, `歌词生成失败: ${err.message}`);
      }
    }
    
    // 伴奏分离
    else if (path === 'stems') {
      const { clipId } = req.query;
      if (!clipId) {
        return error(400, '缺少必要参数: clipId');
      }
      
      try {
        console.log('处理伴奏分离请求');
        const result = await callSunoApi(
          'post', // 改为POST方法
          'stems', 
          null, 
          { clipId },
          apiToken,
          userId
        );
        
        return success(result.data);
      } catch (err) {
        console.error('伴奏分离失败:', err);
        return error(err.status || 500, `伴奏分离失败: ${err.message}`);
      }
    }
    
    // WAV下载
    else if (path === 'wav') {
      const { clipId } = req.query;
      if (!clipId) {
        return error(400, '缺少必要参数: clipId');
      }
      
      try {
        console.log('处理WAV下载请求');
        const result = await callSunoApi(
          'post', // 改为POST方法
          'wav', 
          null, 
          { clipId },
          apiToken,
          userId
        );
        
        return success(result.data);
      } catch (err) {
        console.error('获取WAV失败:', err);
        return error(err.status || 500, `获取WAV失败: ${err.message}`);
      }
    }
    
    // 历史记录
    else if (path === 'my') {
      const { pageNum, pageSize } = req.query;
      
      try {
        console.log('处理历史记录请求');
        const result = await callSunoApi(
          'post', // 改为POST方法
          'my', 
          null, 
          { pageNum: pageNum || 1, pageSize: pageSize || 10 },
          apiToken,
          userId
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