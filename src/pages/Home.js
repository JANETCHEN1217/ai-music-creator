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
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Amateur Musician",
      avatar: "https://this-person-does-not-exist.com/img/avatar-gen11a4f6f5def23b849c695c5449d8d2e3.jpg",
      text: "Created a personalized birthday song in minutes! My daughter's face lit up when she heard her custom song. Pure magic! ✨"
    },
    {
      name: "Mike Chen",
      role: "Content Creator",
      avatar: "https://this-person-does-not-exist.com/img/avatar-gen115af2c1ae6c7e0bb8fc2427b6dcf891.jpg",
      text: "From idea to finished song in 5 minutes. The quality is unbelievable - sounds like a professional studio production! 🎵"
    },
    {
      name: "Emma Davis",
      role: "Wedding Planner",
      avatar: "https://this-person-does-not-exist.com/img/avatar-gen1197cdf5d2d4a16a90c2a986c85e6ee0.jpg",
      text: "Made a wedding song for my sister. Everyone thought we hired a composer. This AI is revolutionary! 💍"
    }
  ].map((review, index) => (
    <Grid item xs={12} md={4} key={index}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          height: '100%',
          position: 'relative',
          borderRadius: 4,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[8],
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: '4px 4px 0 0',
            background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={review.avatar}
            sx={{
              width: 56,
              height: 56,
              mr: 2,
              border: '2px solid',
              borderColor: 'primary.main'
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {review.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {review.role}
            </Typography>
            <Rating value={5} readOnly size="small" sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.8,
            fontStyle: 'italic'
          }}
        >
          {review.text}
        </Typography>
      </Paper>
    </Grid>
  ));

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
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.background.paper, 0.4) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What Our Users Say About AI Song Maker
          </Typography>

          <Grid container spacing={4}>
            {testimonials}
          </Grid>
        </Container>
      </Box>

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
    </Box>
  );
};

export default Home; 