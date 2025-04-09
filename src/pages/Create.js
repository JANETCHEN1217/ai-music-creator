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
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { musicService } from '../services/musicService';
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
      const tags = await musicService.getTags();
      setAvailableTags({
        genres: tags.filter(tag => tag.category === 'genre'),
        moods: tags.filter(tag => tag.category === 'mood'),
        voices: tags.filter(tag => tag.category === 'voice'),
        tempos: tags.filter(tag => tag.category === 'tempo')
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
    switch (activeCategory) {
      case 'Genre':
        return showAllTags ? availableTags.genres : availableTags.genres.slice(0, 12);
      case 'Moods':
        return availableTags.moods;
      case 'Voices':
        return availableTags.voices;
      case 'Tempos':
        return availableTags.tempos;
      default:
        return [];
    }
  };

  const handleDurationChange = (event, newValue) => {
    setDuration(newValue);
  };

  const handleGenerateMusic = async () => {
    if (!user) {
      setError('Please sign in to generate music');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const musicParams = {
        description: description || songStyle.join(', '),
        duration: duration,
        style: songStyle,
        isInstrumental: isInstrumental,
        lyrics: mode === 'custom' ? songLyrics : undefined,
        title: songTitle || 'Untitled',
      };

      const result = await musicService.generateMusic(musicParams);
      
      if (result.url) {
        setGeneratedTrack(result.url);
        setSuccess(true);
      } else {
        throw new Error('No music URL in response');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate music');
    } finally {
      setLoading(false);
    }
  };

  const userAvatars = [
    { id: 1, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 2, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { id: 3, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
    { id: 4, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy' },
    { id: 5, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { id: 6, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }
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
          color="text.primary"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Create Your Music with AI
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 48
          }}>
            {userAvatars.map((avatar, index) => (
              <Box
                key={avatar.id}
                component="img"
                src={avatar.image}
                alt={`Creator ${avatar.id}`}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  backgroundColor: '#f0f0f0',
                  position: 'absolute',
                  left: `${index * 24}px`,
                  zIndex: 6 - index,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    zIndex: 10
                  }
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: { xs: 'center', sm: 'flex-start' }
          }}>
            <Typography 
              component="h2"
              variant="h6" 
              color="primary"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Join Our Growing Community
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              align={{ xs: 'center', sm: 'left' }}
            >
              Trusted by 15,000+ musicians, content creators, and music enthusiasts worldwide
            </Typography>
          </Box>
        </Box>

        <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography 
              component="h2" 
              variant="h5"
              sx={{ mb: 3 }}
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
                    {availableTags[activeCategory]?.map((tag) => (
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

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Your song has been generated successfully!
              </Alert>
            )}

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
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Sign in to start creating AI music
              </Typography>
            )}

            {generatedTrack && (
              <Box sx={{ mt: 3 }}>
                <audio controls style={{ width: '100%' }}>
                  <source src={generatedTrack} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Create; 