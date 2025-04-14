import React from 'react';
import { Box, Typography, Paper, Alert, Button, TextField, Container, Divider, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const CodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'monospace',
  overflowX: 'auto',
  marginBottom: theme.spacing(2),
}));

const ApiGuide = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Suno API 配置指南
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          此应用需要有效的 Suno API 凭证才能生成音乐。请按照以下步骤配置您的 API 密钥。
        </Alert>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          步骤 1: 获取 API 密钥
        </Typography>
        <Typography paragraph>
          您需要从 Suno 官方网站获取 API 令牌（Token）：
        </Typography>
        <ol>
          <li>
            <Typography paragraph>
              访问 <Link href="https://suno4.cn/#/api" target="_blank" rel="noopener">https://suno4.cn/#/api</Link>
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              登录您的账户
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              在 API 页面找到您的 API 令牌（Token）
            </Typography>
          </li>
        </ol>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          步骤 2: 配置应用程序
        </Typography>
        <Typography paragraph>
          您需要将 API 凭证添加到应用程序配置中。以下是配置方法：
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          本地开发环境:
        </Typography>
        <Typography paragraph>
          创建或编辑项目根目录中的 <code>.env.local</code> 文件:
        </Typography>
        <CodeBlock>
          SUNO_API_URL=https://suno4.cn<br />
          SUNO_API_TOKEN=您的令牌<br />
          SUNO_API_USERID=13411892959
        </CodeBlock>
        
        <Typography variant="subtitle1" gutterBottom>
          生产环境 (Vercel):
        </Typography>
        <Typography paragraph>
          在 Vercel 仪表板的项目设置中，添加以下环境变量：
        </Typography>
        <CodeBlock>
          SUNO_API_URL=https://suno4.cn<br />
          SUNO_API_TOKEN=您的令牌<br />
          SUNO_API_USERID=13411892959
        </CodeBlock>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h5" gutterBottom>
          故障排除
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          如果您遇到 "API密钥未配置" 错误:
        </Typography>
        <Typography paragraph>
          这通常意味着您尚未正确配置 API 令牌。请确保：
        </Typography>
        <ul>
          <li>
            <Typography paragraph>
              本地开发时，您已创建 <code>.env.local</code> 文件并填写了正确的 API 令牌
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              部署到 Vercel 时，您已在项目设置中添加了必要的环境变量
            </Typography>
          </li>
        </ul>
        
        <Typography variant="subtitle1" gutterBottom>
          如果您遇到 "405 Method Not Allowed" 错误:
        </Typography>
        <Typography paragraph>
          这可能是由于 API 地址不正确或 API 令牌权限问题。请确保：
        </Typography>
        <ul>
          <li>
            <Typography paragraph>
              您使用的是最新版本的 API 端点 (https://suno4.cn)
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              您的 API 令牌具有必要的权限
            </Typography>
          </li>
        </ul>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          联系支持
        </Typography>
        <Typography paragraph>
          如果您仍然遇到问题，请联系我们的支持团队获取帮助。
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          href="/" 
          sx={{ mt: 2 }}
        >
          返回首页
        </Button>
      </Paper>
    </Container>
  );
};

export default ApiGuide; 