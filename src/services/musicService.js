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

// API客户端类 - 极简版直接请求实现
class ApiClient {
  static async request(method, endpoint, data = null, headers = {}, timeout = 15000) {
    const errors = [];
    
    // 认证头
    const authHeaders = {
      'X-Token': SUNO_API_TOKEN,
      'X-UserId': SUNO_API_USERID,
      'Content-Type': 'application/json',
      ...headers
    };
    
    // 直接使用简单路径，不再使用_open前缀
    const proxyUrl = `${VERCEL_PROXY_URL}/${endpoint}`;
    
    console.log(`准备请求: ${method.toUpperCase()} ${proxyUrl}`);
    
    try {
      const response = await axios({
        method,
        url: proxyUrl,
        headers: authHeaders,
        timeout,
        ...(data ? { data } : {})
      });
      
      console.log('请求成功, 响应:', response.data);
      return response.data;
    } catch (error) {
      console.error(`请求失败: ${error.message}`);
      if (error.response) {
        console.error('状态码:', error.response.status);
      }
      
      // 所有尝试失败
      throw new Error(`请求失败: ${error.message}`);
    }
  }
}

class MusicService {
  // 生成音乐 - 极简实现
  static async generateTrack({
    mode,
    description,
    style,
    lyrics,
    isInstrumental = false,
    duration = 30
  }) {
    try {
      console.log('开始生成音乐...');
      
      // 构建请求数据
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
      
      // 直接使用 generate 端点
      const response = await ApiClient.request('post', 'generate', requestData);
      
      if (!response || response.error || response.code !== 200) {
        throw new Error(response?.error || response?.msg || "创建音乐失败");
      }
      
      return {
        trackId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error('生成音乐失败:', error);
      throw new Error(`无法连接到音乐生成服务。请检查网络连接或稍后再试。\n详细错误: ${error.message}`);
    }
  }

  // 检查音乐生成状态 - 简化实现
  static async checkGenerationStatus(trackId) {
    try {
      const response = await ApiClient.request('get', `status?taskBatchId=${trackId}`);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "检查音乐状态失败");
      }
      
      return {
        taskBatchId: trackId,
        taskStatus: response.data.taskStatus || "processing",
        items: response.data.items || []
      };
    } catch (error) {
      console.error('检查状态失败:', error.message);
      throw new Error('无法检查音乐生成状态，请稍后再试。');
    }
  }

  // 生成歌词 - 简化实现
  static async generateLyrics(prompt) {
    try {
      const response = await ApiClient.request('post', 'lyrics', { prompt });
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "生成歌词失败");
      }
      
      return {
        lyric: response.data.lyric || "",
        title: response.data.title || ""
      };
    } catch (error) {
      console.error('生成歌词失败:', error.message);
      throw new Error('无法生成歌词，请稍后再试。');
    }
  }

  // 伴奏分离 - 简化实现
  static async separateVocalAndInstrumental(clipId) {
    try {
      const response = await ApiClient.request('get', `stems?clipId=${clipId}`);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "伴奏分离失败");
      }
      
      return {
        taskBatchId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error('伴奏分离失败:', error.message);
      throw new Error('无法进行伴奏分离，请稍后再试。');
    }
  }

  // 获取WAV文件 - 简化实现
  static async getWavFile(clipId) {
    try {
      const response = await ApiClient.request('get', `wav?clipId=${clipId}`);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "获取WAV文件失败");
      }
      
      return {
        taskBatchId: response.data.taskBatchId || "",
        items: response.data.items || []
      };
    } catch (error) {
      console.error('获取WAV文件失败:', error.message);
      throw new Error('无法获取高质量WAV文件，请稍后再试。');
    }
  }

  // 获取历史记录 - 简化实现
  static async getMusicHistory(pageNum = 1, pageSize = 10) {
    try {
      const response = await ApiClient.request('get', `history?pageNum=${pageNum}&pageSize=${pageSize}`);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "获取历史记录失败");
      }
      
      return {
        list: response.data.list || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('获取历史记录失败:', error.message);
      throw new Error('无法获取音乐历史记录，请稍后再试。');
    }
  }

  // 其他方法也同样简化...
  // 以下为必要的标签获取方法
  static async getTags() {
    const defaultTags = {
      genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
      moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
      voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
      tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
    };
    
    return defaultTags;
  }
}

export default MusicService; 