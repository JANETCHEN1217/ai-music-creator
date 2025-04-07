import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SaveIcon from '@mui/icons-material/Save';

const Create = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicStyle, setMusicStyle] = useState('pop');
  const [duration, setDuration] = useState(30);
  const [mood, setMood] = useState('happy');
  const [description, setDescription] = useState('');

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving music...');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Music
      </Typography>
      
      <Grid container spacing={4}>
        {/* Controls Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Music Settings
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Music Style</InputLabel>
                <Select
                  value={musicStyle}
                  label="Music Style"
                  onChange={(e) => setMusicStyle(e.target.value)}
                >
                  <MenuItem value="pop">Pop</MenuItem>
                  <MenuItem value="rock">Rock</MenuItem>
                  <MenuItem value="classical">Classical</MenuItem>
                  <MenuItem value="electronic">Electronic</MenuItem>
                  <MenuItem value="jazz">Jazz</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Mood</InputLabel>
                <Select
                  value={mood}
                  label="Mood"
                  onChange={(e) => setMood(e.target.value)}
                >
                  <MenuItem value="happy">Happy</MenuItem>
                  <MenuItem value="sad">Sad</MenuItem>
                  <MenuItem value="energetic">Energetic</MenuItem>
                  <MenuItem value="relaxed">Relaxed</MenuItem>
                </Select>
              </FormControl>

              <Typography gutterBottom>Duration (seconds)</Typography>
              <Slider
                value={duration}
                onChange={(e, newValue) => setDuration(newValue)}
                min={15}
                max={120}
                step={15}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the music you want to create..."
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerate}
                disabled={isGenerating}
                sx={{ mb: 2 }}
              >
                {isGenerating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Generate Music'
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                {isGenerating ? (
                  <CircularProgress />
                ) : (
                  <Typography color="text.secondary">
                    Generated music will appear here
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  onClick={handlePlayPause}
                  disabled={isGenerating}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isGenerating}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Create; 