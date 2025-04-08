import axios from 'axios';

const MUBERT_API_URL = 'https://api-b2b.mubert.com/v2';

class MusicService {
  constructor() {
    this.apiKey = process.env.REACT_APP_MUBERT_API_KEY;
  }

  async generateTrack({ mode, description, style, genre, mood, tempo, isInstrumental }) {
    try {
      // Step 1: Get PAT (Personal Access Token)
      const patResponse = await axios.post(`${MUBERT_API_URL}/TTM/GetPAT`, {
        email: process.env.REACT_APP_MUBERT_EMAIL,
        license: "ttm"
      });

      const pat = patResponse.data.data.pat;

      // Step 2: Generate music based on text description
      const generateParams = {
        pat,
        duration: 180, // 3 minutes
        tags: this._constructTags({ style, genre, mood, tempo }),
        mode: mode || 'track', // 'track' or 'loop'
        format: 'mp3',
        bitrate: '320'
      };

      if (description) {
        generateParams.text = description;
      }

      if (isInstrumental) {
        generateParams.tags.push('instrumental');
      }

      const response = await axios.post(`${MUBERT_API_URL}/TTM/GenerateTrack`, generateParams);

      return {
        trackUrl: response.data.data.track_url,
        status: response.data.status,
        trackId: response.data.data.track_id
      };
    } catch (error) {
      console.error('Error generating music:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate music');
    }
  }

  _constructTags({ style, genre, mood, tempo }) {
    const tags = [];
    
    if (style) tags.push(style);
    if (genre) tags.push(genre);
    if (mood) tags.push(mood);
    if (tempo) tags.push(tempo);

    return tags;
  }

  // Get available tags for music generation
  async getTags() {
    try {
      const response = await axios.get(`${MUBERT_API_URL}/TTM/Tags`);
      return response.data.data.tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch music tags');
    }
  }
}

export const musicService = new MusicService(); 