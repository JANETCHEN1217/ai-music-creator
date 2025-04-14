import axios from 'axios';

// 获取当前域名作为API基础URL
const isProduction = process.env.NODE_ENV === 'production';
const currentDomain = isProduction ? window.location.origin : 'http://localhost:3000';

// Vercel API代理URL（不带尾部斜杠）
const VERCEL_PROXY_URL = `${currentDomain}/api/proxy`;

// 使用本地代理服务器地址（仅开发环境）
const LOCAL_PROXY_URL = 'http://localhost:5000/proxy';

// API配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// 使用环境变量读取备用 API 端点 (仅保留新API)
const BACKUP_API_ENDPOINTS = [];

// CORS 代理前缀
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

// API客户端类 - 简化请求流程，使用不同的策略尝试请求
class ApiClient {
  // 直接请求API的方法
  static async request(method, endpointPath, data = null, headers = {}, timeout = 15000) {
    const errors = [];
    
    // 添加认证头
    const authHeaders = {
      'X-Token': SUNO_API_TOKEN,
      'X-UserId': SUNO_API_USERID,
      ...headers
    };
    
    // 确保路径格式正确 - 移除前导斜杠并处理_open格式
    let normalizedPath = endpointPath.replace(/^\//, '');
    
    // 特殊处理生成音乐API
    if (normalizedPath.includes('generate')) {
      // 直接使用固定路径，禁止使用 _open 格式
      normalizedPath = 'generate';
      // 强制使用POST方法
      method = 'post';
    }
    
    // 构建 Vercel 代理 URL - 统一使用不带_open前缀的格式
    const proxyUrl = `${VERCEL_PROXY_URL}/${normalizedPath}`;
    
    // 打印详细请求信息用于调试
    console.log(`准备发起 ${method.toUpperCase()} 请求到: ${proxyUrl}`);
    console.log('请求头:', JSON.stringify(authHeaders));
    if (data) {
      // 特殊处理生成音乐请求数据
      if (normalizedPath.includes('generate')) {
        // 确保使用mvVersion而非myVersion
        const requestData = { ...data };
        requestData.mvVersion = requestData.mvVersion || requestData.myVersion || 'chirp-v4';
        if (requestData.myVersion) delete requestData.myVersion;
        data = requestData;
      }
      console.log('请求数据:', JSON.stringify(data));
    }
    
    // 尝试发起请求 - 先尝试Vercel代理
    try {
      console.log(`通过Vercel代理发起 ${method.toUpperCase()} 请求: ${proxyUrl}`);
      
      const requestConfig = {
        method,
        url: proxyUrl,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        timeout,
        ...(data ? { data } : {})
      };
      
      const response = await axios(requestConfig);
      console.log('Vercel代理请求成功, 响应数据:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Vercel代理请求失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误响应数据:', error.response.data);
      }
      errors.push({ proxy: 'vercel', error: error.message });
      
      // 如果是生成音乐API遇到405错误，尝试使用直接API路径
      if (normalizedPath.includes('generate') && error.response?.status === 405) {
        try {
          console.log('检测到405错误，尝试使用直接API路径...');
          const directUrl = `${VERCEL_PROXY_URL}/open/suno/music/generate`;
          
          const directConfig = {
            method: 'post',  // 强制使用POST
            url: directUrl,
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders
            },
            timeout,
            data
          };
          
          console.log(`尝试直接API路径: ${directUrl}`);
          const response = await axios(directConfig);
          console.log('直接API路径请求成功, 响应数据:', response.data);
          return response.data;
        } catch (directError) {
          console.error(`直接API路径请求失败: ${directError.message}`);
          errors.push({ proxy: 'direct', error: directError.message });
        }
      }
      
      // 如果是开发环境，继续尝试本地代理
      if (!isProduction) {
        try {
          // 构建本地代理URL
          const localProxyUrl = `${LOCAL_PROXY_URL}/${normalizedPath}`;
          
          console.log(`通过本地代理发起 ${method.toUpperCase()} 请求到: ${localProxyUrl}`);
          
          const requestConfig = {
            method,
            url: localProxyUrl,
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders
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
      
      // 所有尝试都失败
      console.error('所有请求方式都失败:', errors);
      throw new Error(`请求失败: ${errors.map(e => `${e.proxy}: ${e.error}`).join(', ')}`);
    }
  }
}

class MusicService {
  // 生成音乐
  static async generateTrack({
    mode,
    description,
    style,
    lyrics,
    isInstrumental = false,
    duration = 30
  }) {
    try {
      console.log('开始生成音乐', { mode, description, style, isInstrumental, duration });
      
      // 创建符合API格式的请求数据
      let requestData = {};
      
      if (mode === 'simple') {
        // 灵感模式
        requestData = {
          "mvVersion": "chirp-v4",
          "inputType": "10",
          "makeInstrumental": isInstrumental === true ? "true" : "false", 
          "gptDescriptionPrompt": description || "一首愉快的阳光歌曲",
          "callbackUrl": ""
        };
      } else {
        // 自定义模式
        requestData = {
          "mvVersion": "chirp-v4",
          "inputType": "20",
          "makeInstrumental": isInstrumental === true ? "true" : "false",
          "prompt": lyrics || "",
          "tags": Array.isArray(style) ? style.join(',') : style,
          "title": (Array.isArray(style) ? style.join(' ') : style) || description || "我的歌曲",
          "continueClipId": "",
          "continueAt": "",
          "callbackUrl": ""
        };
      }
      
      console.log('最终请求数据:', requestData);
      
      // 使用简化的路径，让代理服务器处理路径转换
      const endpoint = 'generate';
      
      // 发起请求
      const response = await ApiClient.request('post', endpoint, requestData);
      
      // 验证响应
      if (!response) {
        throw new Error("API返回空响应");
      }

      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || `创建音乐失败: ${JSON.stringify(response)}`);
      }

      // 返回任务ID
      return {
        trackId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error(`生成音乐时出错:`, error);
      throw new Error(`无法连接到音乐生成服务。请检查网络连接或稍后再试。\n详细错误: ${error.message}`);
    }
  }

  // 检查音乐生成状态
  static async checkGenerationStatus(trackId) {
    try {
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/getState?taskBatchId=${trackId}`;
      
      // 直接传递完整路径给 request 方法
      const response = await ApiClient.request('get', endpoint);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "检查音乐状态失败");
      }
      
      return {
        taskBatchId: trackId,
        taskStatus: response.data.taskStatus || "processing",
        items: response.data.items || []
      };
    } catch (error) {
      console.error(`检查状态时出错:`, error.message);
      throw new Error('无法检查音乐生成状态，请稍后再试。');
    }
  }

  // 生成歌词
  static async generateLyrics(prompt) {
    try {
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/generateLyrics`;
      
      // 直接传递 endpoint 路径给 request 方法
      const response = await ApiClient.request('post', endpoint, { prompt });
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "生成歌词失败");
      }
      
      return {
        lyric: response.data.lyric || "",
        title: response.data.title || ""
      };
    } catch (error) {
      console.error(`生成歌词时出错:`, error.message);
      throw new Error('无法生成歌词，请稍后再试。');
    }
  }

  // 获取标签
  static async getTags() {
    // 默认标签，当 API 调用失败时使用
    const defaultTags = {
      genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
      moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
      voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
      tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
    };
    
    try {
      // 目前API文档中没有提供获取标签的端点，使用默认值
      return defaultTags;
    } catch (error) {
      console.log(`获取标签失败:`, error.message);
      return defaultTags;
    }
  }

  // 伴奏分离
  static async separateVocalAndInstrumental(clipId) {
    try {
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/stems?clipId=${clipId}`;
      
      // 直接传递完整路径给 request 方法
      const response = await ApiClient.request('get', endpoint);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "伴奏分离失败");
      }
      
      return {
        taskBatchId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error(`伴奏分离时出错:`, error.message);
      throw new Error('无法进行伴奏分离，请稍后再试。');
    }
  }

  // 获取高质量WAV文件
  static async getWavFile(clipId) {
    try {
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/wav?clipId=${clipId}`;
      
      // 直接传递完整路径给 request 方法
      const response = await ApiClient.request('get', endpoint);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "获取WAV文件失败");
      }
      
      return {
        taskBatchId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error(`获取WAV文件时出错:`, error.message);
      throw new Error('无法获取高质量WAV文件，请稍后再试。');
    }
  }

  // 获取音乐历史记录
  static async getMusicHistory(pageNum = 1, pageSize = 10) {
    try {
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/my?pageNum=${pageNum}&pageSize=${pageSize}`;
      
      // 直接传递完整路径给 request 方法
      const response = await ApiClient.request('get', endpoint);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "获取历史记录失败");
      }
      
      return {
        list: response.data.list || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error(`获取历史记录时出错:`, error.message);
      throw new Error('无法获取音乐历史记录，请稍后再试。');
    }
  }

  // 拼接音乐片段
  static async concatenateTrack(clipId) {
    try {
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/concat`;
      
      // 直接传递 endpoint 路径给 request 方法
      const response = await ApiClient.request('post', endpoint, { clipId });
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "拼接音乐片段失败");
      }
      
      return {
        taskBatchId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error(`拼接音乐片段时出错:`, error.message);
      throw new Error('无法拼接音乐片段，请稍后再试。');
    }
  }

  // 获取歌词定时信息
  static async getLyricTiming(clipId) {
    try {
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/lyricTime?clipId=${clipId}`;
      
      // 直接传递完整路径给 request 方法
      const response = await ApiClient.request('get', endpoint);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "获取歌词定时信息失败");
      }
      
      return response.data || {};
    } catch (error) {
      console.error(`获取歌词定时信息时出错:`, error.message);
      throw new Error('无法获取歌词定时信息，请稍后再试。');
    }
  }
}

export default MusicService; 