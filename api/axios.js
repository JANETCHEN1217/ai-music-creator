// Vercel Serverless Function中使用axios的包装器
let axios;

try {
  // 尝试直接加载axios
  axios = require('axios');
  console.log('成功加载axios');
} catch (error) {
  console.error('无法加载axios:', error.message);
  
  try {
    // 尝试使用第二种方式加载
    const httpModule = require('http');
    const httpsModule = require('https');
    
    // 创建一个基本的axios替代品
    axios = {
      get: (url, config = {}) => {
        return new Promise((resolve, reject) => {
          const protocol = url.startsWith('https') ? httpsModule : httpModule;
          
          const req = protocol.request(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              try {
                const jsonData = JSON.parse(data);
                resolve({ data: jsonData, status: res.statusCode });
              } catch (e) {
                resolve({ data, status: res.statusCode });
              }
            });
          });
          
          req.on('error', (error) => {
            reject(error);
          });
          
          req.end();
        });
      },
      
      post: (url, data, config = {}) => {
        return new Promise((resolve, reject) => {
          const protocol = url.startsWith('https') ? httpsModule : httpModule;
          
          const options = new URL(url);
          options.method = 'POST';
          options.headers = {
            'Content-Type': 'application/json',
            ...config.headers
          };
          
          const req = protocol.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
              responseData += chunk;
            });
            
            res.on('end', () => {
              try {
                const jsonData = JSON.parse(responseData);
                resolve({ data: jsonData, status: res.statusCode });
              } catch (e) {
                resolve({ data: responseData, status: res.statusCode });
              }
            });
          });
          
          req.on('error', (error) => {
            reject(error);
          });
          
          const postData = JSON.stringify(data);
          req.write(postData);
          req.end();
        });
      }
    };
    
    console.log('使用内置http/https模块创建axios替代品');
  } catch (innerError) {
    console.error('无法创建axios替代品:', innerError.message);
    throw new Error('无法加载或创建HTTP客户端，请确保安装了axios');
  }
}

module.exports = axios; 