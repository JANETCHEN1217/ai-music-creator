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
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [duration, setDuration] = useState(30);
  const [generationTime, setGenerationTime] = useState(0);
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
    setGenerationTime(0);
    
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Please sign in to generate music');
      }

      const startTime = Date.now();
      const timer = setInterval(() => {
        setGenerationTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      const result = await MusicService.generateTrack({
        mode: mode,
        description: description || "Happy music",
        style: songStyle.length > 0 ? songStyle : songTitle,
        lyrics: songLyrics,
        isInstrumental: isInstrumental,
        duration: 30
      });

      clearInterval(timer);

      // Create cover image for the track
      const coverImage = `https://source.unsplash.com/300x300/?${encodeURIComponent(songTitle || description || 'music')}`;
      
      const newTrack = {
        ...result,
        title: songTitle || description || 'My Song',
        coverImage,
        timeStamp: new Date().toISOString(),
        generationTime: Math.floor((Date.now() - startTime) / 1000)
      };

      setGeneratedTracks([newTrack, ...generatedTracks]);
      setSuccess(true);
      
      // Poll for status if the generation is not immediate
      if (result.status === 'pending') {
        const checkStatus = async () => {
          try {
            const status = await MusicService.checkGenerationStatus(result.trackId);
            if (status.status === 'completed') {
              setGeneratedTracks(prev => {
                const updatedTracks = [...prev];
                const index = updatedTracks.findIndex(t => t.trackId === result.trackId);
                if (index !== -1) {
                  updatedTracks[index] = {
                    ...updatedTracks[index],
                    ...status,
                    status: 'completed'
                  };
                }
                return updatedTracks;
              });
            } else if (status.status === 'failed') {
              setError('Music generation failed. Please try again.');
              setGeneratedTracks(prev => {
                const updatedTracks = [...prev];
                const index = updatedTracks.findIndex(t => t.trackId === result.trackId);
                if (index !== -1) {
                  updatedTracks[index] = {
                    ...updatedTracks[index],
                    status: 'failed'
                  };
                }
                return updatedTracks;
              });
            } else {
              setTimeout(checkStatus, 5000); // Check again in 5 seconds
            }
          } catch (error) {
            console.error('Error checking status:', error);
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

  // Getting track cover image based on title/description
  const getTrackCoverImage = (title, description) => {
    return `https://source.unsplash.com/300x300/?${encodeURIComponent(title || description || 'music')}`;
  };

  return (
    <Box sx={{ 
      minHeight: '90vh',
      bgcolor: 'background.default',
      pt: 4,
      pb: 6,
      overflow: 'hidden',
    }}>
      <Grid container spacing={2} sx={{ px: 2 }}>
        {/* Left side - Creation controls */}
        <Grid item xs={12} md={6} lg={5}>
          <Box
            sx={{
              height: { md: 'calc(100vh - 100px)', xs: 'auto' },
              overflowY: 'auto',
              pr: { md: 2, xs: 0 },
              pb: 2,
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(45deg, #6C63FF 30%, #FF6584 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create Music
            </Typography>

            <Card sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(event, newMode) => newMode && setMode(newMode)}
                    aria-label="creation mode"
                    sx={{
                      width: '100%',
                      '.MuiToggleButton-root': {
                        borderRadius: '10px',
                        py: 1.5,
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                          backgroundColor: '#6C63FF',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#5a52d5',
                          },
                        },
                      },
                      '.MuiToggleButtonGroup-grouped': {
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                      },
                    }}
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
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#6C63FF',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#6C63FF',
                        },
                      }}
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
                      multiline
                      rows={3}
                      inputProps={{ maxLength: 120 }}
                      helperText={`${songStyle.join(', ').length}/120`}
                    />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Style and Genre List
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <ButtonGroup 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          mb: 2,
                          '& .MuiButtonGroup-grouped': {
                            borderRadius: '20px',
                            mx: 0.5,
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            '&.Mui-selected': {
                              backgroundColor: '#6C63FF',
                              color: 'white',
                            },
                          },
                        }}
                      >
                        <Button 
                          onClick={() => setActiveCategory('Genre')}
                          variant={activeCategory === 'Genre' ? 'contained' : 'outlined'}
                          sx={{ 
                            borderRadius: '20px',
                            bgcolor: activeCategory === 'Genre' ? '#6C63FF' : 'transparent',
                            color: activeCategory === 'Genre' ? 'white' : 'inherit',
                            '&:hover': {
                              bgcolor: activeCategory === 'Genre' ? '#5a52d5' : 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          # Genre
                        </Button>
                        <Button 
                          onClick={() => setActiveCategory('Moods')}
                          variant={activeCategory === 'Moods' ? 'contained' : 'outlined'}
                          sx={{ 
                            borderRadius: '20px',
                            bgcolor: activeCategory === 'Moods' ? '#6C63FF' : 'transparent',
                            color: activeCategory === 'Moods' ? 'white' : 'inherit',
                            '&:hover': {
                              bgcolor: activeCategory === 'Moods' ? '#5a52d5' : 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          # Moods
                        </Button>
                        <Button 
                          onClick={() => setActiveCategory('Voices')}
                          variant={activeCategory === 'Voices' ? 'contained' : 'outlined'}
                          sx={{ 
                            borderRadius: '20px',
                            bgcolor: activeCategory === 'Voices' ? '#6C63FF' : 'transparent',
                            color: activeCategory === 'Voices' ? 'white' : 'inherit',
                            '&:hover': {
                              bgcolor: activeCategory === 'Voices' ? '#5a52d5' : 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          # Voices
                        </Button>
                        <Button 
                          onClick={() => setActiveCategory('Tempos')}
                          variant={activeCategory === 'Tempos' ? 'contained' : 'outlined'}
                          sx={{ 
                            borderRadius: '20px',
                            bgcolor: activeCategory === 'Tempos' ? '#6C63FF' : 'transparent',
                            color: activeCategory === 'Tempos' ? 'white' : 'inherit',
                            '&:hover': {
                              bgcolor: activeCategory === 'Tempos' ? '#5a52d5' : 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          # Tempos
                        </Button>
                      </ButtonGroup>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {getVisibleTags().map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onClick={() => handleTagClick(tag)}
                            color={songStyle.includes(tag) ? 'primary' : 'default'}
                            variant={songStyle.includes(tag) ? 'filled' : 'outlined'}
                            sx={{ 
                              borderRadius: '16px',
                              bgcolor: songStyle.includes(tag) ? '#6C63FF' : 'transparent',
                              '&:hover': {
                                bgcolor: songStyle.includes(tag) ? '#5a52d5' : 'rgba(0, 0, 0, 0.04)',
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {!isInstrumental && (
                      <TextField
                        fullWidth
                        label="Enter lyrics (optional)"
                        value={songLyrics}
                        onChange={(e) => setSongLyrics(e.target.value)}
                        variant="outlined"
                        multiline
                        rows={4}
                        sx={{ mb: 3 }}
                        placeholder="Enter your lyrics here or leave empty for AI-generated lyrics"
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
                    sx={{ mb: 3 }}
                    placeholder="E.g. A happy pop song about summer with female vocals"
                  />
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#6C63FF',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#6C63FF',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>Display public</span>
                      <Tooltip title="When enabled, your song will be visible to other users in the community">
                        <HelpOutlineIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </Tooltip>
                    </Box>
                  }
                  sx={{ mb: 3 }}
                />

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerateMusic}
                  disabled={loading}
                  sx={{
                    py: 2,
                    borderRadius: '8px',
                    bgcolor: '#6C63FF',
                    '&:hover': {
                      bgcolor: '#5a52d5',
                    },
                    fontSize: '1rem',
                    mb: 2
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

                <Typography variant="body2" color="text.secondary" align="center">
                  1 free generation remaining today
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Middle section - No music selected state */}
        <Grid item xs={12} md={6} lg={4} sx={{ display: { xs: 'block', md: 'block' } }}>
          <Box
            sx={{
              height: { md: 'calc(100vh - 100px)', xs: 'auto' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              p: 3,
            }}
          >
            {generatedTracks.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  opacity: 0.7,
                }}
              >
                <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                  No music selected
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Select a song from the list to start playing
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', maxHeight: '100%', overflowY: 'auto' }}>
                {generatedTracks.map((track, index) => (
                  <Box
                    key={track.trackId || index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {track.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Box
                        component="img"
                        src={track.coverImage}
                        alt={track.title}
                        sx={{
                          width: 150,
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 2,
                          mr: 2,
                        }}
                      />
                      
                      <Box sx={{ flex: 1 }}>
                        {track.status === 'completed' ? (
                          <>
                            <Typography variant="body2" gutterBottom>
                              Your song is ready! Click to play.
                            </Typography>
                            
                            <audio
                              controls
                              src={track.audioUrl}
                              style={{ width: '100%', marginTop: '10px' }}
                            />
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => window.open(track.audioUrl, '_blank')}
                                sx={{ borderRadius: '20px' }}
                              >
                                Download
                              </Button>
                            </Box>
                          </>
                        ) : track.status === 'failed' ? (
                          <Typography color="error">
                            Generation failed. Please try again.
                          </Typography>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <CircularProgress size={30} sx={{ mb: 2 }} />
                            <Typography variant="body2">
                              Generating... {track.generationTime || generationTime}s
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Please wait about 30 seconds, your song will start playing soon
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right side - My Music */}
        <Grid item xs={12} lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Box
            sx={{
              height: 'calc(100vh - 100px)',
              overflowY: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 3,
              border: '1px solid rgba(0, 0, 0, 0.12)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                My Music
              </Typography>
              <IconButton size="small">
                <RefreshIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="text"
                startIcon={<DownloadIcon />}
                sx={{ color: '#4CAF50', justifyContent: 'flex-start', px: 1 }}
              >
                Download
              </Button>
            </Box>

            {generatedTracks.length > 0 ? (
              <List sx={{ mt: 2 }}>
                {generatedTracks.map((track, index) => (
                  <React.Fragment key={track.trackId || index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={track.coverImage}
                          sx={{ width: 56, height: 56 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={track.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.primary">
                              {track.status === 'completed' ? '1m 35s' : `${track.generationTime || generationTime}s`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {track.status === 'completed' 
                                ? 'You can click to play this song now'
                                : 'Generating... Please wait'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < generatedTracks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                No songs generated yet. Create your first song!
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

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

export default Create;