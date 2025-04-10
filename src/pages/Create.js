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
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MusicService from '../services/musicService';
import { useUser } from '../contexts/UserContext';

const Create = () => {
  const { user } = useUser();
  const [mode, setMode] = useState('custom');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songStyle, setSongStyle] = useState([]);
  const [songLyrics, setSongLyrics] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState('');
  const [activeCategory, setActiveCategory] = useState('Genre');
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatedTrack, setGeneratedTrack] = useState(null);
  const [duration, setDuration] = useState(30);
  const [availableTags, setAvailableTags] = useState({
    Genre: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
    Moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
    Voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
    Tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
  });

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
    const tags = availableTags[activeCategory] || [];
    return activeCategory === 'Genre' && !showAllTags ? tags.slice(0, 12) : tags;
  };

  const handleDurationChange = (event, newValue) => {
    setDuration(newValue);
  };

  const handleGenerateMusic = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Please sign in to generate music');
      }

      const result = await MusicService.generateTrack({
        mode: mode,
        description: description,
        style: songStyle,
        lyrics: songLyrics,
        isInstrumental: isInstrumental,
        duration: 30
      });

      setGeneratedTrack(result);
      setSuccess(true);
      
      // Poll for status if the generation is not immediate
      if (result.status === 'pending') {
        const checkStatus = async () => {
          const status = await MusicService.checkGenerationStatus(result.trackId);
          if (status.status === 'completed') {
            setGeneratedTrack(status);
          } else if (status.status === 'failed') {
            setError('Music generation failed. Please try again.');
          } else {
            setTimeout(checkStatus, 5000); // Check again in 5 seconds
          }
        };
        checkStatus();
      }
    } catch (error) {
      console.error('Music generation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Amateur Musician',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      rating: 5,
      comment: "Created a personalized birthday song in minutes! My daughter's face lit up when she heard her custom song. Pure magic! ✨"
    },
    {
      name: 'Mike Chen',
      role: 'Content Creator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      rating: 5,
      comment: "From idea to finished song in 5 minutes. The quality is unbelievable - sounds like a professional studio production! 🎵"
    },
    {
      name: 'Emma Davis',
      role: 'Wedding Planner',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      rating: 5,
      comment: "Made a wedding song for my sister. Everyone thought we hired a composer. This AI is revolutionary! 🎸"
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '90vh',
      bgcolor: 'background.default',
      pt: 8,
      pb: 6,
    }}>
      <Container maxWidth="lg">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(45deg, #6C63FF 30%, #FF6584 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
          }}
        >
          Professional AI Song Generator
        </Typography>

        <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography 
              component="h2" 
              variant="h5"
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Music Generation
            </Typography>

            <Box sx={{ mb: 3 }}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(event, newMode) => newMode && setMode(newMode)}
                aria-label="creation mode"
                fullWidth
              >
                <ToggleButton value="custom" aria-label="custom mode">
                  Custom Mode
                </ToggleButton>
                <ToggleButton value="simple" aria-label="simple mode">
                  Simple Mode
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

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
                    <HelpOutlineIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Tooltip>
                </Box>
              }
              sx={{ mb: 3 }}
            />

            {mode === 'custom' ? (
              <>
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
                  value={songStyle.join(', ')}
                  onChange={(e) => setSongStyle(e.target.value.split(', '))}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  placeholder="E.g. mexican music, cumbia, male voice"
                  inputProps={{ maxLength: 120 }}
                  helperText={`${songStyle.length}/120`}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Style and Genre List
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <ButtonGroup variant="outlined" fullWidth>
                    {Object.keys(availableTags).map((category) => (
                      <Button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        variant={activeCategory === category ? 'contained' : 'outlined'}
                        sx={{
                          background: activeCategory === category ? 'linear-gradient(45deg, #6C63FF, #FF6584)' : 'transparent',
                          color: activeCategory === category ? 'white' : 'inherit',
                        }}
                      >
                        #{category}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>

                <Box sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto' }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {getVisibleTags().map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleTagClick(tag)}
                        sx={{
                          bgcolor: songStyle.includes(tag) ? 'primary.main' : '#2A2A2A',
                          color: 'white',
                          '&:hover': {
                            bgcolor: songStyle.includes(tag) ? 'primary.dark' : '#3A3A3A',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Enter song lyrics"
                  value={songLyrics}
                  onChange={(e) => setSongLyrics(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 3 }}
                  inputProps={{ maxLength: 2000 }}
                  helperText={`${songLyrics.length}/2000`}
                />
              </>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="E.g. A happy pop song about summer vacation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 200 }}
                helperText={`${description.length}/200`}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              }
              label={
                <Typography sx={{ color: 'text.secondary' }}>
                  When enabled, your song will be visible to other users in the community
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                Song Duration: {duration} seconds
              </Typography>
              <Slider
                value={duration}
                onChange={handleDurationChange}
                min={15}
                max={180}
                step={15}
                marks={[
                  { value: 15, label: '15s' },
                  { value: 60, label: '1m' },
                  { value: 120, label: '2m' },
                  { value: 180, label: '3m' },
                ]}
                valueLabelDisplay="auto"
                sx={{
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(106, 99, 255, 0.16)',
                    },
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MusicNoteIcon />}
              onClick={handleGenerateMusic}
              disabled={loading || (!description && mode === 'simple') || (!songStyle.length && mode === 'custom')}
              sx={{
                background: 'linear-gradient(45deg, #8E2DE2, #4A00E0)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7B1FA2, #4A00E0)',
                },
              }}
            >
              {loading ? 'Generating...' : 'Generate with AI'}
            </Button>

            {!user && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2,
                  textAlign: 'center',
                  color: 'text.secondary'
                }}
              >
                Sign in to start creating AI music
              </Typography>
            )}

            {generatedTrack && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Generated Track
                </Typography>
                <audio controls style={{ width: '100%' }}>
                  <source src={generatedTrack.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </Box>
            )}

            <Snackbar 
              open={Boolean(error)} 
              autoHideDuration={6000} 
              onClose={() => setError(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Snackbar>

            <Snackbar
              open={success}
              autoHideDuration={6000}
              onClose={() => setSuccess(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert severity="success" onClose={() => setSuccess(false)}>
                Music generated successfully!
              </Alert>
            </Snackbar>

            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Typography variant="h6" gutterBottom>
                What Our Users Say
              </Typography>
              {testimonials.map((testimonial, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Box
                    component="img"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      mr: 2,
                      border: '2px solid #6C63FF'
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} role="img" aria-label="star" style={{ color: '#FFD700' }}>⭐</span>
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {testimonial.comment}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Create; 