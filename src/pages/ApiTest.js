import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, Button, Container, Heading, Text, 
  VStack, HStack, Input, Textarea, Select,
  Badge, Code, Divider, Spinner
} from '@chakra-ui/react';

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
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">API 测试工具</Heading>
        <Text>使用此工具测试 Suno API 连接和各种 API 端点功能</Text>
        
        <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
          <VStack spacing={4} align="stretch">
            <Heading size="md">测试类型</Heading>
            <Select value={testType} onChange={(e) => setTestType(e.target.value)}>
              <option value="connection">基础连接测试</option>
              <option value="custom">自定义 API 请求</option>
              <option value="generate">音乐生成测试</option>
            </Select>
            
            {testType === 'custom' && (
              <>
                <Heading size="sm">自定义 API 设置</Heading>
                <HStack>
                  <Select value={customMethod} onChange={(e) => setCustomMethod(e.target.value)} width="150px">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </Select>
                  <Input 
                    placeholder="API 路径，例如: _open/suno/music/getState" 
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                  />
                </HStack>
                
                <Text>请求数据 (JSON 格式):</Text>
                <Textarea
                  placeholder='{"key": "value"}'
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                  rows={5}
                />
              </>
            )}
            
            <Button 
              colorScheme="blue" 
              onClick={testType === 'generate' ? runSimpleMusicGenerate : handleRunTest} 
              isLoading={loading}
            >
              {testType === 'connection' 
                ? '运行连接测试' 
                : testType === 'generate'
                  ? '运行音乐生成测试'
                  : '运行自定义测试'}
            </Button>
          </VStack>
        </Box>
        
        {loading && (
          <Box textAlign="center" p={4}>
            <Spinner size="xl" />
            <Text mt={2}>请求处理中...</Text>
          </Box>
        )}
        
        {error && (
          <Box p={4} borderWidth={1} borderRadius="md" bg="red.50" borderColor="red.200">
            <Heading size="md" color="red.500">测试失败</Heading>
            <Text mt={2} fontWeight="bold">错误信息: {error.message || error}</Text>
            
            {error.status && (
              <Text mt={2}>状态码: {error.status}</Text>
            )}
            
            {error.response && (
              <Box mt={3}>
                <Text fontWeight="bold">响应数据:</Text>
                <Code p={2} display="block" whiteSpace="pre-wrap" mt={1}>
                  {JSON.stringify(error.response, null, 2)}
                </Code>
              </Box>
            )}
          </Box>
        )}
        
        {results && (
          <Box p={4} borderWidth={1} borderRadius="md" bg="green.50" borderColor="green.200">
            <Heading size="md" color="green.600">测试成功</Heading>
            
            {results.message && (
              <Text mt={2}>{results.message}</Text>
            )}
            
            {results.status && (
              <HStack mt={2}>
                <Text fontWeight="bold">状态码:</Text>
                <Badge colorScheme="green">{results.status}</Badge>
              </HStack>
            )}
            
            {results.apiConfig && (
              <Box mt={3}>
                <Text fontWeight="bold">API 配置:</Text>
                <HStack mt={1} spacing={4}>
                  <Badge colorScheme={results.apiConfig.url ? "green" : "red"}>
                    URL: {results.apiConfig.url || "未设置"}
                  </Badge>
                  <Badge colorScheme={results.apiConfig.hasToken ? "green" : "red"}>
                    Token: {results.apiConfig.hasToken ? "已设置" : "未设置"}
                  </Badge>
                  <Badge colorScheme={results.apiConfig.hasUserId ? "green" : "red"}>
                    UserId: {results.apiConfig.hasUserId ? "已设置" : "未设置"}
                  </Badge>
                </HStack>
              </Box>
            )}
            
            {results.results && (
              <Box mt={4}>
                <Heading size="sm">测试结果:</Heading>
                <Divider my={2} />
                {results.results.map((result, index) => (
                  <Box key={index} mt={3} p={3} borderWidth={1} borderRadius="md" bg={result.success ? "green.50" : "red.50"}>
                    <HStack>
                      <Badge colorScheme={result.success ? "green" : "red"}>
                        {result.success ? "成功" : "失败"}
                      </Badge>
                      <Text fontWeight="bold">{result.method}</Text>
                      {result.status && <Badge>{result.status}</Badge>}
                    </HStack>
                    
                    {result.error && (
                      <Text mt={2} color="red.500">错误: {result.error}</Text>
                    )}
                    
                    {(result.response || result.data) && (
                      <Box mt={2}>
                        <Text fontWeight="bold">响应:</Text>
                        <Code p={2} display="block" whiteSpace="pre-wrap" mt={1} fontSize="sm">
                          {JSON.stringify(result.response || result.data, null, 2)}
                        </Code>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            
            {results.data && !results.results && (
              <Box mt={3}>
                <Text fontWeight="bold">响应数据:</Text>
                <Code p={2} display="block" whiteSpace="pre-wrap" mt={1}>
                  {JSON.stringify(results.data, null, 2)}
                </Code>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default ApiTest; 