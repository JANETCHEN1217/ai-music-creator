import axios from 'axios';

// 获取当前域名作为API基础URL
const isProduction = process.env.NODE_ENV === 'production';
const currentDomain = isProduction ? window.location.origin : 'http://localhost:3000';

// 简单直接的代理URL
const PROXY_URL = `${currentDomain}/api/suno`; 

// API配置 - 保留以便在后端使用
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn'; 
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

class MusicService {
  // 生成音乐 - 极致简化版本
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
          gptDescriptionPrompt: description || "一首愉快的阳光歌曲",
          callbackUrl: ""
        };
      } else {
        // 自定义模式
        requestData = {
          mvVersion: "chirp-v4",
          inputType: "20",
          makeInstrumental: isInstrumental === true ? "true" : "false",
          prompt: lyrics || "",
          tags: Array.isArray(style) ? style.join(',') : style,
          title: (Array.isArray(style) ? style.join(' ') : style) || description || "我的歌曲",
          continueClipId: "",
          continueAt: "",
          callbackUrl: ""
        };
      }
      
      console.log('请求数据:', requestData);
      
      // 发送生成音乐请求
      const response = await axios.post(`${PROXY_URL}/generate`, requestData);
      
      console.log('音乐生成响应:', response.data);
      
      // 处理响应
      if (!response.data || response.data.error || response.data.code !== 200) {
        throw new Error(
          response.data?.error || 
          response.data?.msg || 
          "创建音乐失败"
        );
      }
      
      return {
        trackId: response.data.data?.taskBatchId || "",
        items: response.data.data?.items || []
      };
    } catch (error) {
      console.error('生成音乐失败:', error);
      throw new Error(`无法连接到音乐生成服务。请检查网络连接或稍后再试。\n详细错误: ${error.message}`);
    }
  }

  // 检查音乐生成状态 - 极致简化版本
  static async checkGenerationStatus(trackId) {
    try {
      if (!trackId) {
        throw new Error('任务ID不能为空');
      }
      
      const response = await axios.get(`${PROXY_URL}/status?taskBatchId=${trackId}`);
      
      if (!response.data || response.data.error || response.data.code !== 200) {
        throw new Error(
          response.data?.error || 
          response.data?.msg || 
          "检查音乐状态失败"
        );
      }
      
      return {
        taskBatchId: trackId,
        taskStatus: response.data.data?.taskStatus || "processing",
        items: response.data.data?.items || []
      };
    } catch (error) {
      console.error('检查状态失败:', error);
      throw new Error('无法检查音乐生成状态，请稍后再试。');
    }
  }

  // 生成歌词 - 极致简化版本
  static async generateLyrics(prompt) {
    try {
      const response = await axios.post(`${PROXY_URL}/lyrics`, { prompt });
      
      if (!response.data || response.data.error || response.data.code !== 200) {
        throw new Error(
          response.data?.error || 
          response.data?.msg || 
          "生成歌词失败"
        );
      }
      
      return {
        lyric: response.data.data?.lyric || "",
        title: response.data.data?.title || ""
      };
    } catch (error) {
      console.error('生成歌词失败:', error);
      throw new Error('无法生成歌词，请稍后再试。');
    }
  }

  // 伴奏分离
  static async separateVocalAndInstrumental(clipId) {
    try {
      const response = await axios.get(`${PROXY_URL}/stems?clipId=${clipId}`);
      
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
      const response = await axios.get(`${PROXY_URL}/wav?clipId=${clipId}`);
      
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
      const response = await axios.get(`${PROXY_URL}/my?pageNum=${pageNum}&pageSize=${pageSize}`);
      
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