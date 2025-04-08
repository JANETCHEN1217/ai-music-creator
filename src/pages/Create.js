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
  const [availableTags, setAvailableTags] = useState({
    genres: [],
    moods: [],
    voices: [],
    tempos: []
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

  const handleGenerateMusic = async () => {
    if (!user) {
      setError('Please sign in to generate music');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await musicService.generateTrack({
        mode: mode === 'simple' ? 'track' : 'custom',
        description: mode === 'simple' ? description : undefined,
        style: songStyle.join(','),
        isInstrumental,
        lyrics: mode === 'custom' ? songLyrics : undefined
      });

      setGeneratedTrack(result);
      setSuccess(true);
    } catch (error) {
      console.error('Error generating music:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '90vh',
      bgcolor: 'background.default',
      pt: 8,
      pb: 6,
    }}>
      <Container maxWidth="lg">
        <Typography
          variant="h1"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{
            mb: 4,
            background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Professional AI Song Generator
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {[1, 2, 3, 4, 5, 6].map((avatar) => (
              <Box
                key={avatar}
                component="img"
                src={`/avatars/avatar${avatar}.jpg`}
                alt={`User ${avatar}`}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '2px solid white',
                  marginLeft: '-8px',
                  '&:first-of-type': { marginLeft: 0 },
                }}
              />
            ))}
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Trusted by 25,000+ musicians, content creators, and music enthusiasts worldwide
            </Typography>
          </Box>
        </Box>

        <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom align="center">
              Create Music
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
                    {['Genre', 'Moods', 'Voices', 'Tempos'].map((category) => (
                      <Button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        variant={activeCategory === category ? 'contained' : 'outlined'}
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
                  <source src={generatedTrack.trackUrl} type="audio/mp3" />
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