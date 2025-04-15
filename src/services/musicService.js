import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class MusicService {
  // Generate music
  async generateMusic(prompt, style = 'pop', title = '', customMode = false, instrumental = false) {
    try {
      const response = await axios.post(`${API_BASE_URL}/kie?path=generate`, {
        prompt,
        style,
        title,
        customMode,
        instrumental,
        model: 'default',
        callBackUrl: '',
        negativeTags: []
      });
      
      if (response.data.code === 200) {
        return {
          taskId: response.data.data.task_id,
          status: 'pending'
        };
      }
      throw new Error(response.data.msg || 'Failed to generate music');
    } catch (error) {
      console.error('Music generation failed:', error);
      throw error;
    }
  }

  // Check generation status
  async checkStatus(taskId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/kie?path=status&taskId=${taskId}`);
      
      if (response.data.code === 200) {
        const { callbackType, data } = response.data.data;
        
        if (callbackType === 'complete') {
          return {
            status: 'completed',
            taskId: response.data.data.task_id,
            items: data.map(item => ({
              id: item.id,
              audioUrl: item.audio_url,
              streamUrl: item.stream_audio_url,
              imageUrl: item.image_url,
              prompt: item.prompt,
              model: item.model_name,
              title: item.title,
              tags: item.tags,
              createTime: item.createTime,
              duration: item.duration
            }))
          };
        } else if (callbackType === 'processing') {
          return {
            status: 'processing',
            taskId: response.data.data.task_id
          };
        } else {
          return {
            status: 'failed',
            taskId: response.data.data.task_id,
            error: response.data.msg
          };
        }
      }
      throw new Error(response.data.msg || 'Failed to check status');
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }

  // Get music history
  async getHistory() {
    try {
      const response = await axios.get(`${API_BASE_URL}/kie?path=history`);
      
      if (response.data.code === 200) {
        return response.data.data.map(item => ({
          id: item.id,
          audioUrl: item.audio_url,
          streamUrl: item.stream_audio_url,
          imageUrl: item.image_url,
          prompt: item.prompt,
          model: item.model_name,
          title: item.title,
          tags: item.tags,
          createTime: item.createTime,
          duration: item.duration
        }));
      }
      throw new Error(response.data.msg || 'Failed to fetch history');
    } catch (error) {
      console.error('History fetch failed:', error);
      throw error;
    }
  }
}

export default new MusicService(); 