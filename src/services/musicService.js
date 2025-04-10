import axios from 'axios';

class MusicService {
  constructor() {
    this.cookie = '_cfuvid=tNKMEI12xFqF1.2BIV81x.WxeqYyS86PuKpHDw5NNn0-1744016194736-0.0.1.1-604800000; ajs_anonymous_id=c42c3686-25cb-4f5c-872e-9f567b73b9fe; _gcl_au=1.1.89041323.1744016195; _ga=GA1.1.201232571.1744016196; _fbp=fb.1.1744016195908.531955408874335701; afUserId=a111baab-ec31-4b2a-966a-1295e7b0ed9c-p; AF_SYNC=1744016196223; _tt_enable_cookie=1; _ttp=01JR7QEGP0EE9GRS9GCDAY4S1R_.tt.1; __client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8ydk9WZFd0RnFmWEoxM1Y3WHRNaElzcDMxWlEiLCJyb3RhdGluZ190b2tlbiI6InFqMzZ5Z282c3JrM3dpOHg4dnZvNWpnZG9odms5eDAxMm1sYWV3dGsifQ.sx-vQIvRXnzzwTLQ6W3g__ryEYLe1q6rR2QXCdPi0CfVNd4TYy5Ip3GsMQr6YFlFgH9TUtusdUX8QWSY2pbxqq9CPIrfA3mc8zxFr7QF_wfhuxIL9ykRetWCKhO_wsOaa8oTeSXmawe-64xByYWaYsfJHINI7RWz6BW_olOKYZgQMVguGCUt1k-TsRwSBTLcoaEhp0KZ1sCwkS7t_LeMOKlVP5qmYJdJjD1b0-mX4G9BiKhVNWYQPbwYq3UUZjGw5xlImC1YqI21927IKROlhUBl4pELVrEJn7loeHfcgbcxsTJsB8W0EtjewZDNnJ3MDSxIGhyxy4mkv_Fpsac2Vw';
  }

  async generateMusic(params) {
    try {
      // 1. First get the session token
      const sessionResponse = await axios({
        method: 'POST',
        url: 'https://clerk.suno.ai/v1/client/sessions/sess_2vOVk1OVHxVyf3z2JOOstZtp9qi/tokens',
        params: {
          '_clerk_js_version': '5.59.3',
          '__clerk_api_version': '2025-04-10'
        },
        headers: {
          'Cookie': this.cookie,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'Origin': 'https://suno.ai',
          'Referer': 'https://suno.ai/',
          'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site'
        }
      });

      if (!sessionResponse.data || !sessionResponse.data.jwt) {
        throw new Error('Failed to get session token');
      }

      // 2. Then generate the music
      const generateResponse = await axios({
        method: 'POST',
        url: 'https://suno.ai/api/generate',
        headers: {
          'Cookie': this.cookie,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://suno.ai',
          'Referer': 'https://suno.ai/',
          'Authorization': `Bearer ${sessionResponse.data.jwt}`
        },
        data: {
          prompt: params.description || params.style.join(', '),
          duration: params.duration || 30,
          make_instrumental: params.isInstrumental || false,
          lyrics: params.lyrics || '',
          title: params.title || 'Untitled'
        },
        timeout: 60000 // 60 seconds timeout
      });

      console.log('Generate response:', generateResponse.data);

      if (!generateResponse.data) {
        throw new Error('Invalid response from music generation API');
      }

      return {
        audio_url: generateResponse.data.url,
        id: generateResponse.data.id,
        status: 'success'
      };
    } catch (error) {
      console.error('Error generating music:', error.response || error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your cookie.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The server is taking too long to respond.');
      }
      throw new Error(error.response?.data?.message || 'Failed to generate music. Please try again.');
    }
  }

  async getTags() {
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