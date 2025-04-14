import axios from 'axios';

// 获取当前域名作为API基础URL
const isProduction = process.env.NODE_ENV === 'production';
const currentDomain = isProduction ? window.location.origin : 'http://localhost:3000';

// API基础URL
const API_URL = `${currentDomain}/api/suno`;

// API配置 - 保留以便在后端使用
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn'; 
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// API请求方法 - 统一处理API调用
const callApi = async (method, path, data = null, params = {}) => {
  // 构建请求URL和参数
  let url = `${API_URL}?path=${path}`;
  
  // 添加其他查询参数
  Object.keys(params).forEach(key => {
    url += `&${key}=${encodeURIComponent(params[key])}`;
  });
  
  try {
    // 发送请求
    const config = {
      method,
      url,
      ...(data ? { data } : {})
    };
    
    console.log(`发送API请求: ${method.toUpperCase()} ${url}`);
    if (data) console.log('请求数据:', data);
    
    const response = await axios(config);
    
    // 验证响应
    if (!response.data || response.data.code !== 200) {
      throw new Error(response.data?.msg || '请求失败');
    }
    
    return response.data;
  } catch (error) {
    // 特殊错误处理
    if (error.response) {
      // 检查是否是API配置错误 (500错误)
      if (error.response.status === 500) {
        const errorMsg = error.response.data?.msg || '';
        if (errorMsg.includes('服务配置不完整') || errorMsg.includes('API凭证未正确配置')) {
          console.error('API配置错误: API密钥未正确设置');
          throw new Error('API密钥未配置或无效。请联系管理员设置正确的API密钥。');
        }
      }
      
      // 405 Method Not Allowed
      if (error.response.status === 405) {
        console.error('请求方法不被允许:', method, url);
        throw new Error('API请求方法不被允许，可能是服务器配置问题。');
      }
      
      // 检查是否有详细错误信息
      const errorMsg = error.response.data?.msg || '未知错误';
      console.error(`服务器错误(${error.response.status}):`, errorMsg);
      throw new Error(`服务器错误: ${errorMsg}`);
    }
    
    // 网络错误
    console.error(`API请求失败 (${path}):`, error.message);
    throw error;
  }
};

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
      console.log('开始生成音乐...');
      
      // 构建请求数据
      let requestData = {};
      
      if (mode === 'simple') {
        // 灵感模式
        requestData = {
          mvVersion: "chirp-v4",
          inputType: "10",
          makeInstrumental: isInstrumental === true ? "true" : "false", 
          gptDescriptionPrompt: description || "一首愉快的阳光歌曲"
        };
      } else {
        // 自定义模式
        requestData = {
          mvVersion: "chirp-v4",
          inputType: "20",
          makeInstrumental: isInstrumental === true ? "true" : "false",
          prompt: lyrics || "",
          tags: Array.isArray(style) ? style.join(',') : style,
          title: (Array.isArray(style) ? style.join(' ') : style) || description || "我的歌曲"
        };
      }
      
      // 发送API请求
      const response = await callApi('post', 'generate', requestData);
      
      return {
        trackId: response.data?.taskBatchId || "",
        items: response.data?.items || []
      };
    } catch (error) {
      console.error('生成音乐失败:', error.message);
      
      // 判断错误类型，提供更友好的错误消息
      if (error.message.includes('API密钥未配置')) {
        throw new Error(`无法生成音乐：API密钥未正确配置。请联系管理员设置API密钥。`);
      } else if (error.message.includes('服务器错误')) {
        throw new Error(`音乐生成服务器错误: ${error.message}`);
      } else if (error.message.includes('请求方法不被允许')) {
        throw new Error(`音乐生成API调用错误: 请求方法不被允许，请联系管理员。`);
      }
      
      // 默认错误消息
      throw new Error(`无法连接到音乐生成服务。请检查网络连接或稍后再试。\n详细错误: ${error.message}`);
    }
  }

  // 检查音乐生成状态
  static async checkGenerationStatus(trackId) {
    try {
      if (!trackId) {
        throw new Error('任务ID不能为空');
      }
      
      // 发送API请求
      const response = await callApi('get', 'status', null, { taskBatchId: trackId });
      
      return {
        taskBatchId: trackId,
        taskStatus: response.data?.taskStatus || "processing",
        items: response.data?.items || []
      };
    } catch (error) {
      console.error('检查状态失败:', error.message);
      throw new Error('无法检查音乐生成状态，请稍后再试。');
    }
  }

  // 生成歌词
  static async generateLyrics(prompt) {
    try {
      // 发送API请求
      const response = await callApi('post', 'lyrics', { prompt });
      
      return {
        lyric: response.data?.lyric || "",
        title: response.data?.title || ""
      };
    } catch (error) {
      console.error('生成歌词失败:', error.message);
      throw new Error('无法生成歌词，请稍后再试。');
    }
  }

  // 伴奏分离
  static async separateVocalAndInstrumental(clipId) {
    try {
      // 发送API请求
      const response = await callApi('get', 'stems', null, { clipId });
      
      return {
        taskBatchId: response.data?.taskBatchId || "",
        items: response.data?.items || []
      };
    } catch (error) {
      console.error('伴奏分离失败:', error.message);
      throw new Error('无法进行伴奏分离，请稍后再试。');
    }
  }

  // 获取WAV文件
  static async getWavFile(clipId) {
    try {
      // 发送API请求
      const response = await callApi('get', 'wav', null, { clipId });
      
      return {
        taskBatchId: response.data?.taskBatchId || "",
        items: response.data?.items || []
      };
    } catch (error) {
      console.error('获取WAV文件失败:', error.message);
      throw new Error('无法获取高质量WAV文件，请稍后再试。');
    }
  }

  // 获取历史记录
  static async getMusicHistory(pageNum = 1, pageSize = 10) {
    try {
      // 发送API请求
      const response = await callApi('get', 'my', null, { pageNum, pageSize });
      
      return {
        list: response.data?.list || [],
        total: response.data?.total || 0
      };
    } catch (error) {
      console.error('获取历史记录失败:', error.message);
      throw new Error('无法获取音乐历史记录，请稍后再试。');
    }
  }

  // 获取标签 - 使用本地数据而非API调用
  static async getTags() {
    return {
      genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
      moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
      voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
      tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
    };
  }
}

export default MusicService; 