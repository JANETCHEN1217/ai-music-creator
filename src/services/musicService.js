import axios from 'axios';

class MusicService {
  constructor() {
    this.apiUrl = 'https://api.acedata.cloud/suno/audios';
    this.apiKey = '65fa2f25521d4847889b3d1edf604c99';
  }

  async generateMusic(params) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${this.apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          prompt: params.description,
          duration: params.duration || 30,
          style: params.style,
          isInstrumental: params.isInstrumental,
          lyrics: params.lyrics,
          title: params.title,
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate music');
      }

      return data;
    } catch (error) {
      console.error('Error generating music:', error);
      throw error;
    }
  }

  async getTags() {
    // 返回预定义的标签，因为我们现在使用静态数据
    return {
      genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
      moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
      voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
      tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
    };
  }

  // 添加其他方法，比如获取生成历史等
  async getMusicHistory() {
    // 实现获取历史记录的逻辑
  }
}

export const musicService = new MusicService(); 