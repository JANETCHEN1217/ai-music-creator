import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Button, Container, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Paper, Grid, Divider, CircularProgress,
  Chip, Stack, Alert, AlertTitle, FormControlLabel, Switch
} from '@mui/material';
import { styled } from '@mui/system';

// 自定义代码显示组件
const CodeBlock = styled('pre')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflowX: 'auto',
  fontSize: '0.875rem',
  border: `1px solid ${theme.palette.divider}`,
  margin: theme.spacing(1, 0),
}));

const ApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [testType, setTestType] = useState('connection');
  const [customEndpoint, setCustomEndpoint] = useState('_open/suno/music/getState');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customData, setCustomData] = useState('{}');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);

  // 组件加载时尝试从localStorage读取保存的令牌
  useEffect(() => {
    const savedToken = localStorage.getItem('sunoApiToken');
    if (savedToken) {
      setToken(savedToken);
      setTokenSaved(true);
    }
  }, []);
  
  // 保存令牌到localStorage
  const saveToken = () => {
    if (token) {
      localStorage.setItem('sunoApiToken', token);
      setTokenSaved(true);
    }
  };
  
  // 清除令牌
  const clearToken = () => {
    localStorage.removeItem('sunoApiToken');
    setToken('');
    setTokenSaved(false);
    setResult(null);
  };

  // 运行测试连接
  const runConnectionTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await axios.get('/api/test-connection');
      setResult(response.data);
    } catch (err) {
      console.error('测试连接失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 运行自定义 API 测试
  const runCustomTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      let requestData = {};
      try {
        requestData = JSON.parse(customData);
      } catch (e) {
        setError('JSON 数据格式错误，请检查');
        setLoading(false);
        return;
      }
      
      // 生成音乐专用测试
      if (customEndpoint.includes('generate') && customMethod === 'POST') {
        // 确保使用正确的键名
        if (!requestData.mvVersion && requestData.myVersion) {
          requestData.mvVersion = requestData.myVersion;
          delete requestData.myVersion;
        }
      }
      
      const config = {
        method: customMethod.toLowerCase(),
        url: `/api/proxy/${customEndpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (customMethod === 'POST' || customMethod === 'PUT') {
        config.data = requestData;
      }
      
      console.log('发送请求:', config);
      const response = await axios(config);
      
      setResult({
        status: response.status,
        data: response.data
      });
    } catch (err) {
      console.error('API 测试失败:', err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = () => {
    if (testType === 'connection') {
      runConnectionTest();
    } else {
      runCustomTest();
    }
  };

  // 简单音乐生成测试
  const runSimpleMusicGenerate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const requestData = {
        mvVersion: "chirp-v4",
        inputType: "10",
        makeInstrumental: "false",
        gptDescriptionPrompt: "一首欢快的流行歌曲，带有节奏感的鼓点和旋律",
        callbackUrl: ""
      };
      
      const response = await axios({
        method: 'post',
        url: '/api/proxy/_open/suno/music/generate',
        headers: {
          'Content-Type': 'application/json'
        },
        data: requestData
      });
      
      setResult({
        status: response.status,
        data: response.data,
        message: '音乐生成请求已提交'
      });
    } catch (err) {
      console.error('音乐生成测试失败:', err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // 测试API配置
      const testResponse = await axios.post('/api/suno?path=generate', {
        mvVersion: "chirp-v4",
        inputType: "10",
        makeInstrumental: "false",
        gptDescriptionPrompt: "测试API连接"
      }, {
        headers: token ? { 'X-API-TOKEN': token } : {}
      });
      
      setResult(testResponse.data);
      console.log('API测试成功:', testResponse.data);
      
      // 如果测试成功但令牌尚未保存，自动保存
      if (!tokenSaved && token) {
        localStorage.setItem('sunoApiToken', token);
        setTokenSaved(true);
      }
    } catch (err) {
      console.error('API测试失败:', err);
      setError(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Suno API 连接测试
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          此页面用于测试Suno API的连接是否正常。您需要在此处设置API令牌才能使用音乐生成功能。
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            API令牌设置
          </Typography>
          <TextField
            fullWidth
            label="API令牌"
            variant="outlined"
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setTokenSaved(false);
            }}
            placeholder="请输入从Suno获取的API令牌"
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControlLabel 
              control={
                <Switch 
                  checked={showToken} 
                  onChange={(e) => setShowToken(e.target.checked)} 
                />
              } 
              label="显示令牌" 
            />
            <Box>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={saveToken}
                disabled={!token || tokenSaved}
                size="small"
                sx={{ mr: 1 }}
              >
                {tokenSaved ? "已保存" : "保存令牌"}
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={clearToken}
                disabled={!token}
                size="small"
              >
                清除令牌
              </Button>
            </Box>
          </Box>
          {tokenSaved && (
            <Alert severity="success" sx={{ mt: 2 }}>
              API令牌已保存，应用程序将使用此令牌调用API
            </Alert>
          )}
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          onClick={testAPI}
          disabled={loading}
          sx={{ mt: 2, mb: 4 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "测试API连接"}
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2">API测试失败</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
        
        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              API连接测试成功！服务器正常响应。
            </Alert>
            
            <Typography variant="h6" gutterBottom>API响应</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#1d1d1d', overflow: 'auto' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" color="primary" href="/api-guide">
            查看API配置指南
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            href="/" 
            sx={{ ml: 2 }}
          >
            返回首页
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApiTest; 