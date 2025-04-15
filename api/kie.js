const axios = require('axios');

// KIE AI API configuration
const KIE_API_URL = 'https://kieai.erweima.ai/api/v1';
const KIE_API_KEY = '153f32022fb5a002b7ac26c94294fe73';

// API request method - Unified API call handling
const callKieApi = async (method, endpoint, data = null) => {
  try {
    const url = `${KIE_API_URL}/${endpoint}`;
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`
      },
      ...(data ? { data } : {})
    };
    
    console.log(`Calling KIE API: ${method.toUpperCase()} ${url}`);
    if (data) console.log('Request data:', data);
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || 'API request failed');
    }
    throw error;
  }
};

// Handle requests
export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const success = (data) => res.status(200).json({
    code: 200,
    msg: 'success',
    data: data
  });
  
  const error = (status, message) => {
    console.error(`Error: ${status} - ${message}`);
    return res.status(status).json({
      code: status,
      msg: message
    });
  };

  try {
    const { path } = req.query;
    console.log(`Received ${req.method} request, path: ${path}`, req.body);

    // Generate music
    if (path === 'generate') {
      try {
        const result = await callKieApi('post', 'generate', req.body);
        return success(result);
      } catch (err) {
        return error(err.status || 500, `Music generation failed: ${err.message}`);
      }
    }

    // Check generation status
    else if (path === 'status') {
      const { taskId } = req.query;
      if (!taskId) {
        return error(400, 'Missing required parameter: taskId');
      }

      try {
        const result = await callKieApi('get', `status/${taskId}`);
        return success(result);
      } catch (err) {
        return error(err.status || 500, `Status check failed: ${err.message}`);
      }
    }

    // Unknown endpoint
    else {
      return error(400, `Unknown API endpoint: ${path}`);
    }
  } catch (err) {
    console.error('Request handling failed:', err);
    return error(err.status || 500, err.message || 'Internal server error');
  }
} 