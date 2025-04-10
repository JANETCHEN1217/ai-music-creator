import axios from 'axios';

// 更新为 sunoapi.org 的 API 端点
const SUNO_API_URL = 'https://api.sunoapi.org/api';
const SUNO_API_KEY = 'cd4c08a93be11e2d434a03705f11068f'; // 您的 API 密钥

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
      console.log('Starting music generation with sunoapi.org...');
      
      let endpoint = '';
      let requestData = {};

      // 根据模式选择不同的 API 端点
      if (mode === 'simple') {
        endpoint = `${SUNO_API_URL}/generate`;
        requestData = {
          prompt: description || "Happy music",
          duration
        };
      } else {
        endpoint = `${SUNO_API_URL}/custom-generate`;
        requestData = {
          title: Array.isArray(style) ? style.join(', ') : style,
          prompt: description || "Happy music",
          lyrics: lyrics || '',
          is_instrumental: isInstrumental,
          duration
        };
      }

      console.log('Sending request to:', endpoint);
      console.log('Request data:', JSON.stringify(requestData));

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUNO_API_KEY}`
        }
      });

      console.log('Response received:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return {
        trackId: response.data.id || response.data.track_id,
        audioUrl: response.data.audio_url || response.data.url,
        status: response.data.status || 'pending'
      };
    } catch (error) {
      console.error('Error generating music:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to generate music. Please try again.');
    }
  }

  static async checkGenerationStatus(trackId) {
    try {
      const response = await axios.get(`${SUNO_API_URL}/status?id=${trackId}`, {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`
        }
      });
      
      console.log('Status check response:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      return {
        id: trackId,
        audio_url: response.data.audio_url || response.data.url,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error checking generation status:', error);
      throw new Error('Failed to check generation status');
    }
  }

  static async getQuota() {
    try {
      const response = await axios.get(`${SUNO_API_URL}/quota`, {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`
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
      // 尝试从 API 获取标签
      try {
        const response = await axios.get(`${SUNO_API_URL}/tags`, {
          headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`
          }
        });
        return response.data;
      } catch (e) {
        console.log('Failed to fetch tags from API, using fallback', e);
      }
      
      // 使用默认标签作为备选
      return {
        genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
        moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
        voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
        tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
      };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {
        genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
        moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
        voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
        tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
      };
    }
  }

  // 添加其他方法，比如获取生成历史等
  async getMusicHistory() {
    // 实现获取历史记录的逻辑
  }
}

export default MusicService; 