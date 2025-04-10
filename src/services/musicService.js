import axios from 'axios';

// 使用 CORS 代理
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://suno.gcui.art/api';
const SUNO_API_KEY = process.env.REACT_APP_SUNO_API_KEY;

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
      let endpoint = '';
      let requestData = {};

      if (mode === 'simple') {
        endpoint = `${CORS_PROXY}${SUNO_API_URL}/generate`;
        requestData = {
          prompt: description,
          duration,
          api_key: SUNO_API_KEY
        };
      } else {
        endpoint = `${CORS_PROXY}${SUNO_API_URL}/custom_generate`;
        requestData = {
          title: Array.isArray(style) ? style.join(', ') : style,
          prompt: description,
          lyrics: lyrics || '',
          is_instrumental: isInstrumental,
          duration,
          api_key: SUNO_API_KEY
        };
      }

      console.log('Sending request to:', endpoint);
      console.log('Request data:', JSON.stringify(requestData));

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return {
        trackId: response.data.id,
        audioUrl: response.data.audio_url,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error generating music:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate music. Please try again.');
    }
  }

  static async checkGenerationStatus(trackId) {
    try {
      const response = await axios.get(`${CORS_PROXY}${SUNO_API_URL}/get?ids=${trackId}&api_key=${SUNO_API_KEY}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking generation status:', error);
      throw new Error('Failed to check generation status');
    }
  }

  static async getQuota() {
    try {
      const response = await axios.get(`${CORS_PROXY}${SUNO_API_URL}/get_limit?api_key=${SUNO_API_KEY}`, {
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