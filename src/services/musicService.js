import axios from 'axios';

// 使用环境变量读取 API 设置
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://api.sunoapi.com/api';
const SUNO_API_KEY = process.env.REACT_APP_SUNO_API_KEY || 'cd4c08a93be11e2d434a03705f11068f';

// 使用环境变量读取备用 API 端点
const BACKUP_API_ENDPOINTS = [
  process.env.REACT_APP_SUNO_API_BACKUP_1 || 'https://api.sunoai.xyz/api',
  process.env.REACT_APP_SUNO_API_BACKUP_2 || 'https://api-suno.endpoints.acedata.workers.dev'
].filter(Boolean); // 移除空值

// 创建一个带有 axios 实例的工具类，加入 retry 逻辑和错误处理
class ApiClient {
  static async request(method, url, data = null, headers = {}, timeout = 15000) {
    console.log(`发起 ${method.toUpperCase()} 请求到: ${url}`);
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
    
    try {
      const response = await axios(requestConfig);
      console.log('请求成功, 响应数据:', response.data);
      return response.data;
    } catch (error) {
      console.error('请求失败:', error.message);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误响应:', error.response.data);
      }
      throw error;
    }
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
    
    // 尝试所有 API 端点
    const apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    console.log('可用的 API 端点:', apiEndpoints);
    
    for (const baseUrl of apiEndpoints) {
      try {
        console.log(`尝试 API 端点: ${baseUrl}`);
        
        let endpoint = '';
        let requestData = {};

        // 根据模式选择不同的 API 端点
        if (mode === 'simple') {
          endpoint = `${baseUrl}/generate`;
          requestData = {
            prompt: description || "Happy music",
            duration
          };
        } else {
          endpoint = `${baseUrl}/custom-generate`;
          requestData = {
            title: Array.isArray(style) ? style.join(', ') : style,
            prompt: description || "Happy music",
            lyrics: lyrics || '',
            is_instrumental: isInstrumental,
            duration
          };
        }

        const response = await ApiClient.request('post', endpoint, requestData);

        if (response.error) {
          throw new Error(response.error);
        }

        return {
          trackId: response.id || response.track_id,
          audioUrl: response.audio_url || response.url,
          status: response.status || 'pending'
        };
      } catch (error) {
        console.error(`使用 ${baseUrl} 生成音乐时出错:`, error.message);
        errors.push({ endpoint: baseUrl, error: error.message });
      }
    }
    
    // 所有端点都失败了 - 返回详细错误信息
    const errorDetails = errors.map(e => `${e.endpoint}: ${e.error}`).join('\n');
    console.error('所有 API 端点都失败了。错误详情:\n', errorDetails);
    throw new Error(`无法连接到音乐生成服务。请检查网络连接或稍后再试。\n详细错误: ${errorDetails}`);
  }

  static async checkGenerationStatus(trackId) {
    let errors = [];
    
    // 尝试所有 API 端点
    const apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    
    for (const baseUrl of apiEndpoints) {
      try {
        const endpoint = `${baseUrl}/status?id=${trackId}`;
        const response = await ApiClient.request('get', endpoint);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return {
          id: trackId,
          audio_url: response.audio_url || response.url,
          status: response.status
        };
      } catch (error) {
        console.error(`使用 ${baseUrl} 检查状态时出错:`, error.message);
        errors.push({ endpoint: baseUrl, error: error.message });
      }
    }
    
    // 所有端点都失败了
    const errorDetails = errors.map(e => `${e.endpoint}: ${e.error}`).join('\n');
    console.error('检查状态时所有 API 端点都失败了。错误详情:\n', errorDetails);
    throw new Error('无法检查音乐生成状态，请稍后再试。');
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