import axios from 'axios';

// 获取当前域名作为API基础URL
const isProduction = process.env.NODE_ENV === 'production';
const currentDomain = isProduction ? window.location.origin : 'http://localhost:3000';

// API配置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn';
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// 使用CORS代理进行直接API调用 (避开405错误)
const CORS_PROXY_URL = 'https://corsproxy.io/?';

// API帮助函数 - 直接调用API，避开代理服务
const callApi = async (method, endpoint, data = null) => {
  // 构建完整URL (使用CORS代理)
  const url = `${CORS_PROXY_URL}${SUNO_API_URL}/${endpoint}`;
  
  // 打印请求信息
  console.log(`【API请求】${method.toUpperCase()} ${url}`);
  if (data) console.log('【请求数据】', JSON.stringify(data));
  
  // 构建请求配置
  const config = {
    method,
    url,
    headers: {
      'X-Token': SUNO_API_TOKEN,
      'X-UserId': SUNO_API_USERID,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    ...(data ? { data } : {})
  };
  
  try {
    // 发送请求
    const response = await axios(config);
    console.log('【API响应】', response.data);
    return response.data;
  } catch (error) {
    console.error('【API错误】', error.message);
    if (error.response) {
      console.error('【错误状态】', error.response.status);
      console.error('【错误数据】', error.response.data);
    }
    throw error;
  }
};

class MusicService {
  // 生成音乐 - 直接调用API实现
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
      
      // 直接调用API
      const response = await callApi('post', 'open/suno/music/generate', requestData);
      
      if (response.error || response.code !== 200) {
        throw new Error(response.error || response.msg || "创建音乐失败");
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

  // 检查音乐生成状态
  static async checkGenerationStatus(trackId) {
    try {
      const response = await callApi('get', `open/suno/music/getState?taskBatchId=${trackId}`);
      
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

  // 生成歌词
  static async generateLyrics(prompt) {
    try {
      const response = await callApi('post', 'open/suno/music/generateLyrics', { prompt });
      
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

  // 伴奏分离
  static async separateVocalAndInstrumental(clipId) {
    try {
      const response = await callApi('get', `open/suno/music/stems?clipId=${clipId}`);
      
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

  // 获取WAV文件
  static async getWavFile(clipId) {
    try {
      const response = await callApi('get', `open/suno/music/wav?clipId=${clipId}`);
      
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

  // 获取历史记录
  static async getMusicHistory(pageNum = 1, pageSize = 10) {
    try {
      const response = await callApi('get', `open/suno/music/my?pageNum=${pageNum}&pageSize=${pageSize}`);
      
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

  // 获取标签
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