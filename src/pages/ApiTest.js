import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, Button, Container, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Paper, Grid, Divider, CircularProgress,
  Chip, Stack, Alert, AlertTitle
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
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [testType, setTestType] = useState('connection');
  const [customEndpoint, setCustomEndpoint] = useState('_open/suno/music/getState');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customData, setCustomData] = useState('{}');

  // 运行测试连接
  const runConnectionTest = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const response = await axios.get('/api/test-connection');
      setResults(response.data);
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
    setResults(null);
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
      
      setResults({
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
    setResults(null);
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
      
      setResults({
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h3" align="center">API 测试工具</Typography>
        <Typography>使用此工具测试 Suno API 连接和各种 API 端点功能</Typography>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5">测试类型</Typography>
            <FormControl fullWidth>
              <InputLabel>选择测试类型</InputLabel>
              <Select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                label="选择测试类型"
              >
                <MenuItem value="connection">基础连接测试</MenuItem>
                <MenuItem value="custom">自定义 API 请求</MenuItem>
                <MenuItem value="generate">音乐生成测试</MenuItem>
              </Select>
            </FormControl>
            
            {testType === 'custom' && (
              <>
                <Typography variant="h6">自定义 API 设置</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel>请求方法</InputLabel>
                      <Select
                        value={customMethod}
                        onChange={(e) => setCustomMethod(e.target.value)}
                        label="请求方法"
                      >
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="POST">POST</MenuItem>
                        <MenuItem value="PUT">PUT</MenuItem>
                        <MenuItem value="DELETE">DELETE</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField 
                      fullWidth
                      label="API 路径"
                      placeholder="例如: _open/suno/music/getState" 
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                    />
                  </Grid>
                </Grid>
                
                <Typography>请求数据 (JSON 格式):</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder='{"key": "value"}'
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                />
              </>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={testType === 'generate' ? runSimpleMusicGenerate : handleRunTest} 
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (
                testType === 'connection' 
                  ? '运行连接测试' 
                  : testType === 'generate'
                    ? '运行音乐生成测试'
                    : '运行自定义测试'
              )}
            </Button>
          </Box>
        </Paper>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 2 }}>请求处理中...</Typography>
          </Box>
        )}
        
        {error && (
          <Paper sx={{ p: 3, bgcolor: '#fdeded' }}>
            <Alert severity="error">
              <AlertTitle>测试失败</AlertTitle>
              <Typography sx={{ fontWeight: 'bold' }}>错误信息: {error.message || error}</Typography>
              
              {error.status && (
                <Typography sx={{ mt: 1 }}>状态码: {error.status}</Typography>
              )}
              
              {error.response && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>响应数据:</Typography>
                  <CodeBlock>
                    {JSON.stringify(error.response, null, 2)}
                  </CodeBlock>
                </Box>
              )}
            </Alert>
          </Paper>
        )}
        
        {results && (
          <Paper sx={{ p: 3, bgcolor: '#edf7ed' }}>
            <Alert severity="success">
              <AlertTitle>测试成功</AlertTitle>
              
              {results.message && (
                <Typography sx={{ mt: 1 }}>{results.message}</Typography>
              )}
              
              {results.status && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>状态码:</Typography>
                  <Chip label={results.status} color="success" size="small" />
                </Box>
              )}
              
              {results.apiConfig && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>API 配置:</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip 
                      label={`URL: ${results.apiConfig.url || "未设置"}`} 
                      color={results.apiConfig.url ? "success" : "error"}
                      size="small"
                    />
                    <Chip 
                      label={`Token: ${results.apiConfig.hasToken ? "已设置" : "未设置"}`} 
                      color={results.apiConfig.hasToken ? "success" : "error"}
                      size="small"
                    />
                    <Chip 
                      label={`UserId: ${results.apiConfig.hasUserId ? "已设置" : "未设置"}`} 
                      color={results.apiConfig.hasUserId ? "success" : "error"}
                      size="small"
                    />
                  </Stack>
                </Box>
              )}
              
              {results.results && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">测试结果:</Typography>
                  <Divider sx={{ my: 1 }} />
                  {results.results.map((result, index) => (
                    <Paper key={index} sx={{ mt: 2, p: 2, bgcolor: result.success ? '#f0f7f0' : '#fdeded' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={result.success ? "成功" : "失败"} 
                          color={result.success ? "success" : "error"}
                          size="small"
                        />
                        <Typography sx={{ fontWeight: 'bold' }}>{result.method}</Typography>
                        {result.status && <Chip label={result.status} size="small" />}
                      </Stack>
                      
                      {result.error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          错误: {result.error}
                        </Alert>
                      )}
                      
                      {(result.response || result.data) && (
                        <Box sx={{ mt: 1 }}>
                          <Typography sx={{ fontWeight: 'bold' }}>响应:</Typography>
                          <CodeBlock>
                            {JSON.stringify(result.response || result.data, null, 2)}
                          </CodeBlock>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
              
              {results.data && !results.results && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>响应数据:</Typography>
                  <CodeBlock>
                    {JSON.stringify(results.data, null, 2)}
                  </CodeBlock>
                </Box>
              )}
            </Alert>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ApiTest; 