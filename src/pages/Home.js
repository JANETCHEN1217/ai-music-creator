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
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  ButtonGroup,
  Slider,
  Snackbar,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import MusicService from '../services/musicService';
import { useUser } from '../contexts/UserContext';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Rating from '@mui/material/Rating';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledIconBox = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'rotate(5deg) scale(1.1)',
  },
}));

const Home = () => {
  const theme = useTheme();
  const { user } = useUser();
  const [mode, setMode] = useState('custom');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songStyle, setSongStyle] = useState([]);
  const [songLyrics, setSongLyrics] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState('');
  const [activeCategory, setActiveCategory] = useState('Genre');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [availableTags, setAvailableTags] = useState({
    Genre: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
    Moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
    Voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
    Tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
  });

  // Define avatars array
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
  ];

  // Define steps array
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

  // Define testimonials array
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

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await MusicService.getTags();
      setAvailableTags({
        Genre: tags.genres || [],
        Moods: tags.moods || [],
        Voices: tags.voices || [],
        Tempos: tags.tempos || []
      });
    } catch (error) {
      console.error('Error loading tags:', error);
      setError('Failed to load music tags');
    }
  };

  const handleTagClick = (tag) => {
    if (songStyle.includes(tag)) {
      setSongStyle(songStyle.filter(t => t !== tag));
    } else {
      setSongStyle([...songStyle, tag]);
    }
  };

  const getVisibleTags = () => {
    return availableTags[activeCategory] || [];
  };

  const handleGenerateMusic = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!user) {
        throw new Error('Please sign in to generate music');
      }

      const result = await MusicService.generateTrack({
        mode: mode,
        description: description || "Happy music",
        style: songStyle.length > 0 ? songStyle : songTitle,
        lyrics: songLyrics,
        isInstrumental: isInstrumental,
        duration: 30
      });

      const coverImage = `https://source.unsplash.com/300x300/?${encodeURIComponent(songTitle || description || 'music')}`;
      
      const newTrack = {
        ...result,
        title: songTitle || description || 'My Song',
        coverImage,
        timeStamp: new Date().toISOString()
      };

      setGeneratedTracks([newTrack, ...generatedTracks]);
      setSuccess(true);
      
    } catch (error) {
      console.error('Music generation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: 8,
      pb: 10
    }}>
      <Container maxWidth="lg">
        <Typography
          variant="h1"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: '3rem', md: '6rem' },
            fontWeight: 900,
            mb: 6,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Professional AI Song Generator
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 8 }}>
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

        <Card sx={{ mb: 10, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
              Create Music
            </Typography>

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(e, newMode) => newMode && setMode(newMode)}
              fullWidth
              sx={{ mb: 4 }}
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
              sx={{ mb: 4 }}
            />

            {mode === 'custom' ? (
              <>
                <TextField
                  fullWidth
                  label="Song Title"
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
                  value={songStyle.join(', ')}
                  onChange={(e) => setSongStyle(e.target.value.split(',').map(s => s.trim()))}
                  variant="outlined"
                  sx={{ mb: 3 }}
                  inputProps={{ maxLength: 120 }}
                  helperText={`${songStyle.join(', ').length}/120`}
                />

                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Style and Genre List
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" spacing={0} sx={{ mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
                    <Button 
                      variant={activeCategory === 'Genre' ? 'contained' : 'outlined'}
                      onClick={() => setActiveCategory('Genre')}
                      sx={{ 
                        py: 1.5, 
                        flex: 1,
                        background: activeCategory === 'Genre' ? 'linear-gradient(90deg, #6C63FF, #B46EFF)' : 'transparent',
                        borderRadius: 0,
                        '&:hover': {
                          background: activeCategory === 'Genre' ? 'linear-gradient(90deg, #6C63FF, #B46EFF)' : 'transparent',
                        }
                      }}
                    >
                      #Genre
                    </Button>
                    <Button 
                      variant={activeCategory === 'Moods' ? 'contained' : 'outlined'}
                      onClick={() => setActiveCategory('Moods')}
                      sx={{ 
                        py: 1.5, 
                        flex: 1,
                        background: activeCategory === 'Moods' ? 'linear-gradient(90deg, #B46EFF, #FF6584)' : 'transparent',
                        borderRadius: 0,
                        '&:hover': {
                          background: activeCategory === 'Moods' ? 'linear-gradient(90deg, #B46EFF, #FF6584)' : 'transparent',
                        }
                      }}
                    >
                      #Moods
                    </Button>
                    <Button 
                      variant={activeCategory === 'Voices' ? 'contained' : 'outlined'}
                      onClick={() => setActiveCategory('Voices')}
                      sx={{ 
                        py: 1.5, 
                        flex: 1,
                        borderRadius: 0
                      }}
                    >
                      #Voices
                    </Button>
                    <Button 
                      variant={activeCategory === 'Tempos' ? 'contained' : 'outlined'}
                      onClick={() => setActiveCategory('Tempos')}
                      sx={{ 
                        py: 1.5, 
                        flex: 1,
                        borderRadius: 0
                      }}
                    >
                      #Tempos
                    </Button>
                  </Stack>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 2 }}>
                    {getVisibleTags().map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleTagClick(tag)}
                        color={songStyle.includes(tag) ? 'primary' : 'default'}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
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
                    sx={{ mb: 4 }}
                    inputProps={{ maxLength: 2000 }}
                    helperText={`${songLyrics.length}/2000`}
                  />
                )}
              </>
            ) : (
              <TextField
                fullWidth
                label="Describe your song"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                multiline
                rows={4}
                sx={{ mb: 4 }}
                placeholder="E.g. A happy pop song about summer vacation"
              />
            )}

            <FormControlLabel
              control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
              label="When enabled, your song will be visible to other users in the community"
              sx={{ mb: 4, display: 'flex' }}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleGenerateMusic}
              disabled={loading}
              sx={{
                py: 2.5,
                mb: 2,
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5952d5, #ff4f73)',
                },
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Generating...
                </Box>
              ) : (
                <>
                  <MusicNoteIcon sx={{ mr: 1 }} /> Generate with AI
                </>
              )}
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center">
              2 free generations remaining today <Button color="primary">Upgrade Now →</Button>
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 8,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '4rem' },
            }}
          >
            How to Make Songs with AI for Free
          </Typography>

          <Grid container spacing={6}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  px: 4,
                  backgroundColor: alpha(theme.palette.background.paper, 0.4),
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[4],
                  },
                }}>
                  <StyledIconBox>
                    {step.icon}
                  </StyledIconBox>
                  <Typography 
                    variant="h4" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 3,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography 
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 8,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '4rem' },
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

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        action={
          <IconButton size="small" color="inherit" onClick={() => setError(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Song generated successfully!"
        action={
          <IconButton size="small" color="inherit" onClick={() => setSuccess(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default Home; 