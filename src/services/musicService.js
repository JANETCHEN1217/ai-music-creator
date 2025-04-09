import axios from 'axios';

class MusicService {
  constructor() {
    this.apiUrl = 'https://api.acedata.cloud/suno/audios';
    this.apiKey = process.env.REACT_APP_ACEDATA_API_KEY || '65fa2f25521d4847889b3d1edf604c99';
  }

  async generateMusic(params) {
    try {
      // 使用 axios 替代 fetch，更好的错误处理
      const response = await axios({
        method: 'POST',
        url: this.apiUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          prompt: params.description,
          duration: params.duration || 30,
          style: Array.isArray(params.style) ? params.style.join(', ') : params.style,
          isInstrumental: Boolean(params.isInstrumental),
          lyrics: params.lyrics || '',
          title: params.title || 'Untitled',
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error generating music:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to generate music');
    }
  }

  async getTags() {
    try {
      // 返回预定义的标签
      return {
        genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
        moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
        voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
        tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
      };
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch music tags');
    }
  }

  // 添加其他方法，比如获取生成历史等
  async getMusicHistory() {
    // 实现获取历史记录的逻辑
  }
}

export const musicService = new MusicService(); 