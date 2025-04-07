import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Button,
  Stack,
  Rating,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Create from './Create';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

// AI-generated avatar URLs (replace with actual AI-generated avatars)
const avatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
];

const steps = [
  {
    title: 'Describe Your Song',
    description: 'Tell us about the style, mood, and lyrics of your song. Our AI understands your creative vision.',
    icon: <EditIcon fontSize="large" />,
  },
  {
    title: 'Generate Music',
    description: 'Click generate and watch as our AI creates a unique song based on your description in seconds.',
    icon: <AutoAwesomeIcon fontSize="large" />,
  },
  {
    title: 'Download & Share',
    description: 'Download your song in high quality or share it directly with friends and family.',
    icon: <MusicNoteIcon fontSize="large" />,
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Create Section */}
      <Create />

      {/* How to Make Songs Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            How to Make Songs with AI for Free
          </Typography>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      transition: 'transform 0.3s ease-in-out',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: 'white',
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* User Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            What Our Users Say About AI Song Maker
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  position: 'relative',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">Sarah Johnson</Typography>
                    <Rating value={5} readOnly />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <FormatQuoteIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: 'primary.main',
                      transform: 'rotate(180deg)',
                      mr: 2 
                    }} 
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  I used AI Song Maker to create a personalized birthday song for my daughter's 5th birthday. 
                  The AI understood exactly what I wanted - a cheerful, fun melody with her name in it. 
                  The result was amazing! My daughter's face lit up when she heard her custom birthday song. 
                  It made her celebration truly special and unique. I never thought creating a custom song could be this easy!
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <FormatQuoteIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Trust Indicators */}
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Trusted by 25,000+ musicians and creators worldwide
            </Typography>
            <Stack
              direction="row"
              spacing={-1}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              {avatars.map((avatar, index) => (
                <Avatar
                  key={index}
                  src={avatar}
                  sx={{
                    width: 48,
                    height: 48,
                    border: '2px solid white',
                    '&:not(:first-of-type)': {
                      marginLeft: -1,
                    },
                  }}
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/create')}
              sx={{ mt: 4 }}
            >
              Start Creating Your Song
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 