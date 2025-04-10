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
      pt: 4,
      pb: 6
    }}>
      <Container maxWidth="lg">
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

        <Grid container spacing={3}>
          {/* Left side - Creation controls */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
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

                {mode === 'custom' ? (
                  <>
                    <TextField
                      fullWidth
                      label="Song Title"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />

                    <Box sx={{ mb: 3 }}>
                      <ButtonGroup 
                        variant="outlined" 
                        fullWidth 
                        sx={{ mb: 2 }}
                      >
                        {['Genre', 'Moods', 'Voices', 'Tempos'].map((category) => (
                          <Button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            variant={activeCategory === category ? 'contained' : 'outlined'}
                          >
                            {category}
                          </Button>
                        ))}
                      </ButtonGroup>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerateMusic}
                  disabled={loading}
                  sx={{
                    py: 2,
                    borderRadius: '8px',
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
            </StyledCard>
          </Grid>

          {/* Right side - Generated Music */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generated Music
                </Typography>
                {generatedTracks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No songs generated yet. Create your first song!
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {generatedTracks.map((track, index) => (
                      <React.Fragment key={track.trackId || index}>
                        <ListItem alignItems="flex-start">
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
                                {track.status === 'completed' ? (
                                  <Box sx={{ mt: 1 }}>
                                    <audio
                                      controls
                                      src={track.audioUrl}
                                      style={{ width: '100%' }}
                                    />
                                    <Button
                                      startIcon={<DownloadIcon />}
                                      onClick={() => window.open(track.audioUrl, '_blank')}
                                      sx={{ mt: 1 }}
                                    >
                                      Download
                                    </Button>
                                  </Box>
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                      Generating...
                                    </Typography>
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        {index < generatedTracks.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
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