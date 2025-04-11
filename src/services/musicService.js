import axios from 'axios';

// 获取当前域名作为API基础URL
const isProduction = process.env.NODE_ENV === 'production';
const currentDomain = isProduction ? window.location.origin : 'http://localhost:3000';

// Vercel API代理URL（不带尾部斜杠）
const VERCEL_PROXY_URL = `${currentDomain}/api/proxy`;

// 使用本地代理服务器地址（仅开发环境）
const LOCAL_PROXY_URL = 'http://localhost:5000/proxy';

// 新的API配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn/api';
const SUNO_API_KEY = process.env.REACT_APP_SUNO_API_KEY || 'cd4c08a93be11e2d434a03705f11068f';

// 使用环境变量读取备用 API 端点 (仅保留新API)
const BACKUP_API_ENDPOINTS = [];

// CORS 代理前缀
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

// API客户端类
class ApiClient {
  static async request(method, url, data = null, headers = {}, timeout = 15000) {
    const errors = [];
    
    // 尝试使用Vercel API代理
    try {
      // 解析原始URL，获取API路径
      let apiEndpoint = '';
      
      if (url.includes('/api/')) {
        apiEndpoint = url.split('/api/')[1];
      }
      
      // 构建Vercel代理URL - 使用路径格式而不是查询参数
      const proxyUrl = `${VERCEL_PROXY_URL}/${apiEndpoint}`;
      
      console.log(`通过Vercel代理发起 ${method.toUpperCase()} 请求: ${proxyUrl}`);
      if (data) console.log('请求数据:', JSON.stringify(data));
      
      const requestConfig = {
        method,
        url: proxyUrl,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout,
        ...(data ? { data } : {})
      };
      
      const response = await axios(requestConfig);
      console.log('Vercel代理请求成功, 响应数据:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Vercel代理请求失败: ${error.message}`);
      errors.push({ proxy: 'vercel', error: error.message });
    }
    
    // 如果Vercel代理失败，尝试使用本地代理服务器（仅开发环境）
    if (!isProduction) {
      try {
        // 构建代理URL - 替换原始API URL为本地代理URL
        let proxyUrl = url;
        if (url.includes(SUNO_API_URL)) {
          proxyUrl = url.replace(SUNO_API_URL, LOCAL_PROXY_URL);
        } else {
          // 对备用API也使用本地代理
          for (const baseUrl of BACKUP_API_ENDPOINTS) {
            if (url.includes(baseUrl)) {
              proxyUrl = url.replace(baseUrl, LOCAL_PROXY_URL);
              break;
            }
          }
        }
        
        console.log(`通过本地代理发起 ${method.toUpperCase()} 请求到: ${proxyUrl}`);
        if (data) console.log('请求数据:', JSON.stringify(data));
        
        const requestConfig = {
          method,
          url: proxyUrl,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          timeout,
          ...(data ? { data } : {})
        };
        
        const response = await axios(requestConfig);
        console.log('本地代理请求成功, 响应数据:', response.data);
        return response.data;
      } catch (error) {
        console.error(`本地代理请求失败: ${error.message}`);
        errors.push({ proxy: 'local', error: error.message });
      }
    }
    
    // 备用方法: 直接请求
    try {
      console.log(`直接发起 ${method.toUpperCase()} 请求到: ${url}`);
      if (data) console.log('请求数据:', JSON.stringify(data));
      
      const requestConfig = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          ...headers
        },
        timeout,
        ...(data ? { data } : {})
      };
      
      const response = await axios(requestConfig);
      console.log('直接请求成功, 响应数据:', response.data);
      return response.data;
    } catch (error) {
      console.log(`直接请求失败: ${error.message}，尝试使用 CORS 代理`);
      errors.push({ proxy: 'direct', error: error.message });
    }
    
    // 最后尝试使用 CORS 代理
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy}${url}`;
        console.log(`通过代理 ${proxy} 发起 ${method.toUpperCase()} 请求到: ${url}`);
        if (data) console.log('请求数据:', JSON.stringify(data));
        
        const requestConfig = {
          method,
          url: proxyUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUNO_API_KEY}`,
            'X-Requested-With': 'XMLHttpRequest',
            ...headers
          },
          timeout,
          ...(data ? { data } : {})
        };
        
        const response = await axios(requestConfig);
        console.log('请求成功, 响应数据:', response.data);
        return response.data;
      } catch (error) {
        console.error(`使用代理 ${proxy} 请求失败:`, error.message);
        errors.push({ proxy, error: error.message });
      }
    }
    
    // 所有尝试都失败
    console.error('所有请求方式都失败:', errors);
    throw new Error(`请求失败: ${errors.map(e => `${e.proxy}: ${e.error}`).join(', ')}`);
  }
}

class MusicService {
  static async generateTrack({
    mode,
    description,
    style,
    lyrics,
    isInstrumental,
    duration = 30
  }) {
    let errors = [];
    
    // 尝试API端点
    const apiEndpoints = [SUNO_API_URL];
    console.log('可用的API端点:', apiEndpoints);
    
    for (const baseUrl of apiEndpoints) {
      try {
        console.log(`尝试API端点: ${baseUrl}`);
        
        // 构建请求数据
        // 注意: 使用相对路径，让代理服务器处理完整URL
        const endpoint = `generate`;
        
        // 创建符合API格式的请求数据
        // 根据mode选择灵感模式或自定义模式
        let requestData = {};
        
        if (mode === 'simple') {
          // 灵感模式
          requestData = {
            "myVersion": "chirp-v4",
            "inputType": "10",
            "makeInstrumental": isInstrumental === true ? "true" : "false", 
            "gptDescriptionPrompt": description || "一首愉快的阳光歌曲",
            "callbackUrl": ""
          };
        } else {
          // 自定义模式
          requestData = {
            "myVersion": "chirp-v4",
            "inputType": "20",
            "makeInstrumental": isInstrumental === true ? "true" : "false",
            "prompt": lyrics || "",
            "tags": Array.isArray(style) ? style.join(',') : style,
            "title": (Array.isArray(style) ? style.join(' ') : style) || description || "我的歌曲",
            "callbackUrl": ""
          };
        }
        
        console.log('请求数据:', requestData);
        
        // 使用代理服务进行API调用
        const proxyUrl = `${VERCEL_PROXY_URL}/${endpoint}`;
        console.log(`通过代理发起请求: ${proxyUrl}`);
        
        const response = await ApiClient.request('post', proxyUrl, requestData);

        if (response.error) {
          throw new Error(response.error);
        }

        // 根据新API的响应格式解析结果
        return {
          trackId: response.id || response.taskId || response.track_id || "",
          audioUrl: response.audioUrl || response.audio_url || response.url || "",
          status: response.status || 'pending'
        };
      } catch (error) {
        console.error(`使用 ${baseUrl} 生成音乐时出错:`, error.message);
        errors.push({ endpoint: baseUrl, error: error.message });
      }
    }
    
    // API调用失败 - 返回详细错误信息
    const errorDetails = errors.map(e => `${e.endpoint}: ${e.error}`).join('\n');
    console.error('API端点调用失败。错误详情:\n', errorDetails);
    throw new Error(`无法连接到音乐生成服务。请检查网络连接或稍后再试。\n详细错误: ${errorDetails}`);
  }

  static async checkGenerationStatus(trackId) {
    let errors = [];
    
    try {
      // 直接使用代理服务
      const endpoint = `status?taskId=${trackId}`;
      const proxyUrl = `${VERCEL_PROXY_URL}/${endpoint}`;
      console.log(`通过代理检查状态: ${proxyUrl}`);
      
      const response = await ApiClient.request('get', proxyUrl);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return {
        id: trackId,
        audio_url: response.audioUrl || response.audio_url || response.url || "",
        status: response.status || response.processStatus || 'pending'
      };
    } catch (error) {
      console.error(`检查状态时出错:`, error.message);
      errors.push({ error: error.message });
      
      // API调用失败
      const errorDetails = errors.map(e => e.error).join('\n');
      console.error('检查状态时API调用失败。错误详情:\n', errorDetails);
      throw new Error('无法检查音乐生成状态，请稍后再试。');
    }
  }

  static async getQuota() {
    let errors = [];
    
    // 尝试所有 API 端点
    const apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    
    for (const baseUrl of apiEndpoints) {
      try {
        const endpoint = `${baseUrl}/quota`;
        const response = await ApiClient.request('get', endpoint);
        return response;
      } catch (error) {
        console.error(`使用 ${baseUrl} 检查配额时出错:`, error.message);
        errors.push({ endpoint: baseUrl, error: error.message });
      }
    }
    
    // 所有端点都失败了
    const errorDetails = errors.map(e => `${e.endpoint}: ${e.error}`).join('\n');
    console.error('检查配额时所有 API 端点都失败了。错误详情:\n', errorDetails);
    throw new Error('无法检查配额，请稍后再试。');
  }

  static async getTags() {
    // 默认标签，当 API 调用失败时使用
    const defaultTags = {
      genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
      moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
      voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
      tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
    };
    
    // 尝试所有 API 端点
    const apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    
    for (const baseUrl of apiEndpoints) {
      try {
        const endpoint = `${baseUrl}/tags`;
        const response = await ApiClient.request('get', endpoint, null, {}, 5000); // 较短的超时
        return response || defaultTags;
      } catch (error) {
        console.log(`使用 ${baseUrl} 获取标签失败:`, error.message);
      }
    }
    
    console.log('所有 API 端点获取标签失败，使用默认标签');
    return defaultTags;
  }

  // 添加其他方法，比如获取生成历史等
  async getMusicHistory() {
    // 实现获取历史记录的逻辑
  }
}

export default MusicService; 