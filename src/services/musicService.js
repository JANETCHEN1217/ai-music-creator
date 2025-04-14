import axios from 'axios';

// 获取当前域名作为API基础URL
const isProduction = process.env.NODE_ENV === 'production';
const currentDomain = isProduction ? window.location.origin : 'http://localhost:3000';

// API基础URL
const API_URL = `${currentDomain}/api/suno`;

// API配置 - 从环境变量获取Suno API凭据
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno4.cn'; 
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// API请求方法 - 统一处理API调用
const callApi = async (method, path, data = null, params = {}) => {
  // 构建请求URL和参数
  let url;
  
  // 开发环境使用本地代理，生产环境使用Vercel代理
  if (isProduction) {
    url = `${API_URL}?path=${path}`;
    // 添加其他查询参数
    Object.keys(params).forEach(key => {
      url += `&${key}=${encodeURIComponent(params[key])}`;
    });
  } else {
    // 本地开发环境直接调用Suno API
    url = `${SUNO_API_URL}/_open/suno/music/${path}`;
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params);
      url += `?${queryParams.toString()}`;
    }
  }

  try {
    // 从localStorage获取用户设置的API令牌（如果有）
    const userApiToken = localStorage.getItem('sunoApiToken') || SUNO_API_TOKEN;
    const userId = SUNO_API_USERID;
    
    if (!userApiToken) {
      throw new Error('API令牌未设置，请在设置中配置API令牌');
    }
    
    if (!userId) {
      throw new Error('用户ID未设置，请在设置中配置用户ID');
    }
    
    // 发送请求
    const config = {
      method,
      url,
      ...(data ? { data } : {}),
      headers: {
        'X-Token': userApiToken,
        'X-UserId': userId
      }
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
    // 详细错误处理
    if (error.response) {
      // API配置错误
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('API认证错误: 令牌无效或未授权');
        throw new Error('API令牌无效或未授权。请确认您的API令牌和用户ID是否正确。');
      }
      
      // 请求方法不允许
      if (error.response.status === 405) {
        console.error('请求方法不被允许:', method, url);
        throw new Error('API请求方法不被允许。请确认API接口路径是否正确。');
      }
      
      // API参数错误
      if (error.response.status === 400) {
        console.error('请求参数错误:', error.response.data);
        throw new Error(`API参数错误: ${error.response.data?.msg || '请求参数格式有误'}`);
      }
      
      // 服务器内部错误
      if (error.response.status === 500) {
        console.error('服务器内部错误:', error.response.data);
        throw new Error(`服务器错误: ${error.response.data?.msg || '服务内部错误，请稍后再试'}`);
      }
      
      // 其他HTTP错误
      const errorMsg = error.response.data?.msg || `未知错误 (${error.response.status})`;
      console.error(`服务器错误(${error.response.status}):`, errorMsg);
      throw new Error(`API错误: ${errorMsg}`);
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
          gptDescriptionPrompt: description || "一首愉快的阳光歌曲",
          // 添加认证信息
          token: localStorage.getItem('sunoApiToken') || '',
          userId: '13411892959'
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
          // 添加认证信息
          token: localStorage.getItem('sunoApiToken') || '',
          userId: '13411892959'
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
      throw new Error(`无法生成音乐: ${error.message}`);
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
      throw new Error(`无法检查音乐生成状态: ${error.message}`);
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
      throw new Error(`无法生成歌词: ${error.message}`);
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
      throw new Error(`无法进行伴奏分离: ${error.message}`);
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
      throw new Error(`无法获取高质量WAV文件: ${error.message}`);
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
      throw new Error(`无法获取音乐历史记录: ${error.message}`);
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