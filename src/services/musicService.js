import axios from 'axios';

class MusicService {
  constructor() {
    this.apiUrl = 'https://api.acedata.cloud/suno/audios';
    this.apiKey = process.env.REACT_APP_ACEDATA_API_KEY || '65fa2f25521d4847889b3d1edf604c99';
  }

  async generateMusic(params) {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const response = await axios({
        method: 'POST',
        url: this.apiUrl,
        headers,
        data: {
          prompt: params.description || params.style.join(', '),
          duration: params.duration || 30,
          style: Array.isArray(params.style) ? params.style.join(', ') : params.style,
          isInstrumental: Boolean(params.isInstrumental),
          lyrics: params.lyrics || '',
          title: params.title || 'Untitled',
        },
        timeout: 120000, // 120 seconds timeout
        withCredentials: false // Disable sending cookies
      });

      if (!response.data || !response.data.url) {
        throw new Error('Invalid response from music generation API');
      }

      return {
        url: response.data.url,
        id: response.data.id,
        status: 'success'
      };
    } catch (error) {
      console.error('Error generating music:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your API key.');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. Please check your API permissions.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The server is taking too long to respond.');
      } else if (error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to generate music. Please try again.');
    }
  }

  async getTags() {
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

export const musicService = new MusicService(); 