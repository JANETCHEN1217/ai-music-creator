import axios from 'axios';

// 更新为正确的 sunoapi.org 的 API 端点
// 注意：使用 https://api.sunoai.xyz/api 作为备选端点
const SUNO_API_URL = 'https://api.sunoapi.com/api';
const SUNO_API_KEY = 'cd4c08a93be11e2d434a03705f11068f'; // 您的 API 密钥

// 备用 API 端点列表，如果主端点失败，将尝试这些端点
const BACKUP_API_ENDPOINTS = [
  'https://api.sunoai.xyz/api',
  'https://api-suno.endpoints.acedata.workers.dev'
];

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
    
    // 尝试主 API 端点，然后是备用端点
    let apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    
    for (const baseUrl of apiEndpoints) {
      try {
        console.log(`尝试使用 API 端点: ${baseUrl}`);
        
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

        console.log('发送请求到:', endpoint);
        console.log('请求数据:', JSON.stringify(requestData));

        const response = await axios.post(endpoint, requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUNO_API_KEY}`
          },
          timeout: 15000 // 15秒超时
        });

        console.log('收到响应:', response.data);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        return {
          trackId: response.data.id || response.data.track_id,
          audioUrl: response.data.audio_url || response.data.url,
          status: response.data.status || 'pending'
        };
      } catch (error) {
        console.error(`使用 ${baseUrl} 生成音乐时出错:`, error);
        errors.push(error);
        // 记录错误但继续尝试下一个端点
      }
    }
    
    // 所有端点都失败了
    console.error('所有 API 端点都失败了。错误列表:', errors);
    throw new Error('无法连接到音乐生成服务。请检查您的网络连接并稍后再试。');
  }

  static async checkGenerationStatus(trackId) {
    let errors = [];
    
    // 尝试主 API 端点，然后是备用端点
    let apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    
    for (const baseUrl of apiEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}/status?id=${trackId}`, {
          headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`
          },
          timeout: 10000 // 10秒超时
        });
        
        console.log('状态检查响应:', response.data);
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        
        return {
          id: trackId,
          audio_url: response.data.audio_url || response.data.url,
          status: response.data.status
        };
      } catch (error) {
        console.error(`使用 ${baseUrl} 检查状态时出错:`, error);
        errors.push(error);
        // 记录错误但继续尝试下一个端点
      }
    }
    
    // 所有端点都失败了
    console.error('检查状态时所有 API 端点都失败了。错误列表:', errors);
    throw new Error('无法检查音乐生成状态。请稍后再试。');
  }

  static async getQuota() {
    let errors = [];
    
    // 尝试主 API 端点，然后是备用端点
    let apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    
    for (const baseUrl of apiEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}/quota`, {
          headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`
          },
          timeout: 10000 // 10秒超时
        });
        return response.data;
      } catch (error) {
        console.error(`使用 ${baseUrl} 检查配额时出错:`, error);
        errors.push(error);
        // 记录错误但继续尝试下一个端点
      }
    }
    
    // 所有端点都失败了
    console.error('检查配额时所有 API 端点都失败了。错误列表:', errors);
    throw new Error('无法检查配额。请稍后再试。');
  }

  static async getTags() {
    // 使用默认标签，因为 tags API 调用不是必需的
    const defaultTags = {
      genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
      moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
      voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
      tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
    };
    
    // 尝试主 API 端点，然后是备用端点
    let apiEndpoints = [SUNO_API_URL, ...BACKUP_API_ENDPOINTS];
    
    for (const baseUrl of apiEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}/tags`, {
          headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`
          },
          timeout: 10000 // 10秒超时
        });
        return response.data;
      } catch (error) {
        console.log(`使用 ${baseUrl} 获取标签失败，尝试下一个端点`, error);
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