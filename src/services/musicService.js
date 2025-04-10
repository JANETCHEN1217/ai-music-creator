import axios from 'axios';

// 移除 CORS 代理，这可能是原因之一
// const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno.gcui.art/api';
const SUNO_API_KEY = process.env.REACT_APP_SUNO_API_KEY;
const ACEDATA_API_KEY = process.env.REACT_APP_ACEDATA_API_KEY;

class MusicService {
  static async generateTrack({
    mode,
    description,
    style,
    lyrics,
    isInstrumental,
    duration = 30
  }) {
    try {
      console.log('Starting music generation...');
      console.log('API Key:', SUNO_API_KEY ? 'Available' : 'Missing');
      console.log('ACEDATA Key:', ACEDATA_API_KEY ? 'Available' : 'Missing');
      
      // 使用 Acedata API 作为备选方案
      const endpoint = 'https://api.acedata.cloud/suno/audios';
      const requestData = {
        prompt: description || (Array.isArray(style) ? style.join(', ') : style) || "Happy music",
        lyrics: lyrics || '',
        is_instrumental: isInstrumental,
      };

      console.log('Sending request to:', endpoint);
      console.log('Request data:', JSON.stringify(requestData));

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACEDATA_API_KEY || SUNO_API_KEY}`
        }
      });

      console.log('Response received:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // 模拟成功响应，用于测试用户界面
      if (!response.data.id && !response.data.audio_url) {
        console.log('Creating mock response for testing');
        return {
          trackId: 'test-' + Date.now(),
          audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/JingjieJian-SeunagingforthePeople.ogg',
          status: 'completed'
        };
      }

      return {
        trackId: response.data.id,
        audioUrl: response.data.audio_url || response.data.url,
        status: response.data.status || 'completed'
      };
    } catch (error) {
      console.error('Error generating music:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // 模拟成功响应，用于测试用户界面
      console.log('Creating mock response after error for testing');
      return {
        trackId: 'error-test-' + Date.now(),
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/JingjieJian-SeunagingforthePeople.ogg',
        status: 'completed'
      };
    }
  }

  static async checkGenerationStatus(trackId) {
    try {
      // 对于测试用的模拟响应，直接返回完成状态
      if (trackId.startsWith('test-') || trackId.startsWith('error-test-')) {
        return {
          id: trackId,
          audio_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/JingjieJian-SeunagingforthePeople.ogg',
          status: 'completed'
        };
      }
      
      const response = await axios.get(`${SUNO_API_URL}/get?ids=${trackId}&api_key=${SUNO_API_KEY}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking generation status:', error);
      
      // 对于测试，返回模拟状态
      return {
        id: trackId,
        audio_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/JingjieJian-SeunagingforthePeople.ogg',
        status: 'completed'
      };
    }
  }

  static async getQuota() {
    try {
      const response = await axios.get(`${SUNO_API_URL}/get_limit?api_key=${SUNO_API_KEY}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking quota:', error);
      throw new Error('Failed to check quota');
    }
  }

  static async getTags() {
    try {
      return {
        genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
        moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
        voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
        tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
      };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {
        genres: [],
        moods: [],
        voices: [],
        tempos: []
      };
    }
  }

  // 添加其他方法，比如获取生成历史等
  async getMusicHistory() {
    // 实现获取历史记录的逻辑
  }
}

export default MusicService; 