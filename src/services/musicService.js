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

// API客户端类
class ApiClient {
  static async request(method, endpointPath, data = null, headers = {}, timeout = 15000) {
    const errors = [];
    
    // 添加认证头
    const authHeaders = {
      'X-Token': SUNO_API_TOKEN,
      'X-UserId': SUNO_API_USERID,
      ...headers
    };
    
    // 确保路径格式正确（移除前导斜杠）
    const normalizedPath = endpointPath.replace(/^\//, '');
    
    // 构建 Vercel 代理 URL
    const proxyUrl = `${VERCEL_PROXY_URL}/${normalizedPath}`;
    
    // 尝试使用Vercel API代理
    try {
      console.log(`通过Vercel代理发起 ${method.toUpperCase()} 请求: ${proxyUrl}`);
      if (data) console.log('请求数据:', JSON.stringify(data));
      
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
      errors.push({ proxy: 'vercel', error: error.message });
      
      // 如果是开发环境，继续尝试本地代理
      if (!isProduction) {
        try {
          // 构建代理URL
          let proxyUrl = `${LOCAL_PROXY_URL}/${normalizedPath}`;
          
          console.log(`通过本地代理发起 ${method.toUpperCase()} 请求到: ${proxyUrl}`);
          if (data) console.log('请求数据:', JSON.stringify(data));
          
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
      console.log('开始生成音乐');
      
      // 创建符合API格式的请求数据 - 确保使用 mvVersion 而不是 myVersion
      let requestData = {};
      
      if (mode === 'simple') {
        // 灵感模式
        requestData = {
          "mvVersion": "chirp-v4", // 注意这里使用 mvVersion 而不是 myVersion
          "inputType": "10",
          "makeInstrumental": isInstrumental === true ? "true" : "false", 
          "gptDescriptionPrompt": description || "一首愉快的阳光歌曲",
          "callbackUrl": ""
        };
      } else {
        // 自定义模式
        requestData = {
          "mvVersion": "chirp-v4", // 注意这里使用 mvVersion 而不是 myVersion
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
      
      console.log('请求数据:', requestData);
      
      // 使用正确的 API 路径格式
      const endpoint = `_open/suno/music/generate`;
      
      // 直接传递 endpoint 路径给 request 方法
      const response = await ApiClient.request('post', endpoint, requestData);

      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "创建音乐失败");
      }

      // 返回任务ID
      return {
        trackId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error(`生成音乐时出错:`, error.message);
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