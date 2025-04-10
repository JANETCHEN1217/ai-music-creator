import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Paper,
  Rating,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { useUser } from '../contexts/UserContext';
import MusicService from '../services/musicService';

// AI-generated avatar URLs
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

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useUser();
  const [mode, setMode] = useState('custom');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songStyle, setSongStyle] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  ];

  const handleGenerateMusic = async () => {
    if (!user) {
      setError('Please sign in to generate music');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Call music generation service
      await MusicService.generateTrack({
        mode,
        title: songTitle,
        style: songStyle,
        lyrics: songLyrics,
        isInstrumental
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 4, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Title and Trust Indicators */}
        <Typography
          variant="h1"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 900,
            mb: 4,
            background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Professional AI Song Generator
        </Typography>

        {/* Trust Badges */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
            }}
          >
            {avatars.map((avatar, index) => (
              <Avatar
                key={index}
                src={avatar}
                sx={{
                  width: 48,
                  height: 48,
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
        </Box>

        {/* Music Creation Interface */}
        <Card sx={{ mb: 8, bgcolor: 'background.paper', borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Create Music
            </Typography>

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(e, newMode) => newMode && setMode(newMode)}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="custom" sx={{ py: 1.5 }}>
                CUSTOM MODE
              </ToggleButton>
              <ToggleButton value="simple" sx={{ py: 1.5 }}>
                SIMPLE MODE
              </ToggleButton>
            </ToggleButtonGroup>

            <FormControlLabel
              control={
                <Switch
                  checked={isInstrumental}
                  onChange={(e) => setIsInstrumental(e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Instrumental Mode</span>
                  <Tooltip title="Create music without lyrics">
                    <HelpOutlineIcon sx={{ fontSize: 18 }} />
                  </Tooltip>
                </Box>
              }
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Enter song title"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 30 }}
              helperText={`${songTitle.length}/30`}
            />

            <TextField
              fullWidth
              label="Enter song style"
              value={songStyle}
              onChange={(e) => setSongStyle(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 120 }}
              helperText={`${songStyle.length}/120`}
            />

            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Style and Genre List
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button variant="contained" color="primary">#Genre</Button>
                <Button variant="outlined">#Moods</Button>
                <Button variant="outlined">#Voices</Button>
                <Button variant="outlined">#Tempos</Button>
              </Stack>
            </Box>

            {!isInstrumental && (
              <TextField
                fullWidth
                label="Enter song lyrics"
                value={songLyrics}
                onChange={(e) => setSongLyrics(e.target.value)}
                variant="outlined"
                multiline
                rows={4}
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 2000 }}
                helperText={`${songLyrics.length}/2000`}
              />
            )}

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="When enabled, your song will be visible to other users in the community"
              sx={{ mb: 3 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleGenerateMusic}
              disabled={loading}
              sx={{
                py: 2,
                background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5952d5, #ff4f73)',
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Generating...
                </Box>
              ) : (
                'Generate with AI'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* How to Make Songs Section */}
        <Box sx={{ mb: 8 }}>
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
                    sx={{ lineHeight: 1.8 }}
                  >
                    {step.description}
                  </Typography>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ mb: 8 }}>
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

          <Grid container spacing={3}>
            {testimonials.map((review, index) => (
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
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 