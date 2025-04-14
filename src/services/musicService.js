import axios from 'axios';

// Get current domain as API base URL
const isProduction = process.env.NODE_ENV === 'production';
const currentDomain = isProduction ? window.location.origin : 'http://localhost:3000';

// API base URL
const API_URL = `${currentDomain}/api/suno`;

// API configuration - Get Suno API credentials from environment variables
const SUNO_API_URL = process.env.REACT_APP_SUNO_API_URL || 'https://dzwlai.com/apiuser'; 
const SUNO_API_TOKEN = process.env.REACT_APP_SUNO_API_TOKEN || '';
const SUNO_API_USERID = process.env.REACT_APP_SUNO_API_USERID || '';

// API request method - Unified API call handling
const callApi = async (method, path, data = null, params = {}) => {
  // Build request URL and parameters
  let url;
  
  // Use local proxy in development, Vercel proxy in production
  if (isProduction) {
    url = `${API_URL}?path=${path}`;
    // Add other query parameters
    Object.keys(params).forEach(key => {
      url += `&${key}=${encodeURIComponent(params[key])}`;
    });
  } else {
    // Local development environment directly calls Suno API - Use correct path format
    url = `${SUNO_API_URL}/_open/suno/music/${path}`;
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params);
      url += `?${queryParams.toString()}`;
    }
  }

  try {
    // Get user-set API token from localStorage (if any)
    const userApiToken = localStorage.getItem('sunoApiToken') || SUNO_API_TOKEN;
    const userId = SUNO_API_USERID;
    
    if (!userApiToken) {
      throw new Error('API token not set. Please configure API token in settings');
    }
    
    if (!userId) {
      throw new Error('User ID not set. Please configure user ID in settings');
    }
    
    // Send request
    const config = {
      method,
      url,
      ...(data ? { data } : {}),
      headers: {
        'X-Token': userApiToken,
        'X-UserId': userId
      }
    };
    
    console.log(`Sending API request: ${method.toUpperCase()} ${url}`);
    if (data) console.log('Request data:', data);
    
    const response = await axios(config);
    
    // Validate response
    if (!response.data || response.data.code !== 200) {
      throw new Error(response.data?.msg || 'Request failed');
    }
    
    return response.data;
  } catch (error) {
    // Detailed error handling
    if (error.response) {
      // API configuration error
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('API authentication error: Invalid token or unauthorized');
        throw new Error('Invalid API token or unauthorized. Please verify your API token and user ID.');
      }
      
      // Method not allowed
      if (error.response.status === 405) {
        console.error('Request method not allowed:', method, url);
        throw new Error('API request method not allowed. Please verify the API endpoint path.');
      }
      
      // API parameter error
      if (error.response.status === 400) {
        console.error('Request parameter error:', error.response.data);
        throw new Error(`API parameter error: ${error.response.data?.msg || 'Invalid request parameter format'}`);
      }
      
      // Server internal error
      if (error.response.status === 500) {
        console.error('Server internal error:', error.response.data);
        throw new Error(`Server error: ${error.response.data?.msg || 'Internal service error, please try again later'}`);
      }
      
      // Other HTTP errors
      const errorMsg = error.response.data?.msg || `Unknown error (${error.response.status})`;
      console.error(`Server error (${error.response.status}):`, errorMsg);
      throw new Error(`API error: ${errorMsg}`);
    }
    
    // Network error
    console.error(`API request failed (${path}):`, error.message);
    throw error;
  }
};

class MusicService {
  // Generate music
  static async generateTrack({
    mode,
    description,
    style,
    lyrics,
    isInstrumental = false,
    duration = 30
  }) {
    try {
      console.log('Starting music generation...');
      
      // Build request data
      let requestData = {};
      
      if (mode === 'simple') {
        // Inspiration mode
        requestData = {
          mvVersion: "chirp-v4",
          inputType: "10",
          makeInstrumental: isInstrumental === true ? "true" : "false", 
          gptDescriptionPrompt: description || "A happy sunshine song",
        };
      } else {
        // Custom mode
        requestData = {
          mvVersion: "chirp-v4",
          inputType: "20",
          makeInstrumental: isInstrumental === true ? "true" : "false",
          prompt: lyrics || "",
          tags: Array.isArray(style) ? style.join(',') : style,
          title: (Array.isArray(style) ? style.join(' ') : style) || description || "My Song",
        };
      }
      
      // Send API request
      const response = await callApi('post', 'generate', requestData);
      
      console.log('Generation response:', response);
      
      return {
        trackId: response.data?.taskBatchId || "",
        items: response.data?.items || [],
        status: 'pending'
      };
    } catch (error) {
      console.error('Music generation failed:', error.message);
      throw new Error(`Unable to generate music: ${error.message}`);
    }
  }

  // Check music generation status
  static async checkGenerationStatus(trackId) {
    try {
      if (!trackId) {
        throw new Error('Task ID cannot be empty');
      }
      
      console.log(`Checking music generation status, trackId: ${trackId}`);
      
      // Build request data - Using POST body method
      const requestData = { 
        taskBatchId: trackId
      };
      
      // Send API request - Using POST method instead of GET
      const response = await callApi('post', 'status', requestData);
      
      console.log('Status query response:', response);
      
      // If there is no correct response structure, give a clearer error
      if (!response.data) {
        console.error('Status query response format error:', response);
        throw new Error('Incorrect status data format returned by server');
      }
      
      return {
        taskBatchId: trackId,
        taskStatus: response.data?.taskStatus || "processing",
        items: response.data?.items || []
      };
    } catch (error) {
      console.error('Status check failed:', error.message);
      throw new Error(`Unable to check music generation status: ${error.message}`);
    }
  }

  // Generate lyrics
  static async generateLyrics(prompt) {
    try {
      // Send API request
      const response = await callApi('post', 'lyrics', { prompt });
      
      return {
        lyric: response.data?.lyric || "",
        title: response.data?.title || ""
      };
    } catch (error) {
      console.error('Lyrics generation failed:', error.message);
      throw new Error(`Unable to generate lyrics: ${error.message}`);
    }
  }

  // Separate vocals and instrumental
  static async separateVocalAndInstrumental(clipId) {
    try {
      // Send API request
      const response = await callApi('get', 'stems', null, { clipId });
      
      return {
        taskBatchId: response.data?.taskBatchId || "",
        items: response.data?.items || []
      };
    } catch (error) {
      console.error('Vocal/instrumental separation failed:', error.message);
      throw new Error(`Unable to separate vocals and instrumental: ${error.message}`);
    }
  }

  // Get WAV file
  static async getWavFile(clipId) {
    try {
      // Send API request
      const response = await callApi('get', 'wav', null, { clipId });
      
      return {
        taskBatchId: response.data?.taskBatchId || "",
        items: response.data?.items || []
      };
    } catch (error) {
      console.error('Failed to get WAV file:', error.message);
      throw new Error(`Unable to get high-quality WAV file: ${error.message}`);
    }
  }

  // Get music generation history
  static async getMusicHistory() {
    try {
      // Send API request
      const response = await callApi('get', 'list');
      
      return response.data?.items || [];
    } catch (error) {
      console.error('Failed to get music history:', error.message);
      throw new Error(`Unable to get music generation history: ${error.message}`);
    }
  }

  // Get available tags
  static async getTags() {
    try {
      // In a real implementation, this would call the API
      // For now, we'll return a hardcoded list of tags
      return {
        genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
        moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
        voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
        tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
      };
    } catch (error) {
      console.error('Failed to get tags:', error.message);
      throw new Error(`Unable to get music tags: ${error.message}`);
    }
  }
}

export default MusicService; 