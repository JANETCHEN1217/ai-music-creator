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
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

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

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledIconBox = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'rotate(5deg) scale(1.1)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 32px',
  fontSize: '1.1rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

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
    <Box sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container>
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 4,
              background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Professional AI Song Generator
          </Typography>

          <Typography
            variant="h5"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              mb: 6,
              color: 'text.secondary',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Create studio-quality music in seconds. Personalized songs for any occasion, all powered by advanced AI technology.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 8 }}
          >
            <StyledButton
              variant="contained"
              size="large"
              onClick={() => navigate('/create')}
              startIcon={<MusicNoteIcon />}
            >
              Create Music Now
            </StyledButton>
            <StyledButton
              variant="outlined"
              size="large"
              onClick={() => navigate('/pricing')}
              sx={{
                borderRadius: 12,
                padding: '12px 32px',
                fontSize: '1.1rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              View Pricing
            </StyledButton>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 4,
            }}
          >
            {avatars.map((avatar, index) => (
              <Avatar
                key={index}
                src={avatar}
                sx={{
                  width: 56,
                  height: 56,
                  border: '2px solid white',
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              />
            ))}
          </Box>

          <Typography variant="body1" color="text.secondary">
            Trusted by 25,000+ musicians, content creators, and music enthusiasts worldwide
          </Typography>
        </Container>
      </Box>

      {/* How to Make Songs Section */}
      <Box 
        sx={{ 
          py: 8, 
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: 'blur(10px)',
        }}
      >
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
            How to Make Songs with AI for Free
          </Typography>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <StyledCard>
                  <StyledIconBox>
                    {step.icon}
                  </StyledIconBox>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.8,
                      opacity: 0.8 
                    }}
                  >
                    {step.description}
                  </Typography>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
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
          
          <Box sx={{ position: 'relative', mb: 6 }}>
            <FormatQuoteIcon
              sx={{
                position: 'absolute',
                top: -40,
                left: { xs: 0, md: -60 },
                fontSize: 120,
                color: 'primary.main',
                opacity: 0.1,
                transform: 'rotate(180deg)',
              }}
            />
            
            <Grid container spacing={3}>
              {testimonials}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 10, 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ready to Create Your First AI Song?
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              maxWidth: 800,
              mx: 'auto',
              color: 'text.secondary',
            }}
          >
            Start creating personalized songs in seconds. No musical experience required!
          </Typography>
          
          <StyledButton
            variant="contained"
            size="large"
            onClick={() => navigate('/create')}
            sx={{ px: 6, py: 1.5 }}
          >
            Get Started Now
          </StyledButton>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 