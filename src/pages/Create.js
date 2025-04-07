import React, { useState } from 'react';
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
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Create = () => {
  const [mode, setMode] = useState('custom');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songStyle, setSongStyle] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState('');
  const [activeCategory, setActiveCategory] = useState('Genre');

  const genres = [
    'Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Anticipation', 'Calmness', 'Romantic',
    'Nostalgia', 'Mystery', 'Triumph', 'Despair', 'Soulful and Lively Atmosphere', 'slow sad',
    'emotional', 'soulful', 'breakdown', 'sophisticated', 'sharp', 'crisp', 'Spunky',
    'seductive', 'mysterious', 'relaxed', 'laid-back', 'high tension', 'slow', 'trip-hop', 'tender',
    'melodic', 'trance', 'danceable', 'progressive', 'fast tempo', 'Melancholy', 'ear candy',
    'future', 'syncopation', 'catchy', 'depressive', 'night-lovingscene'
  ];

  const voices = [
    'Male Voice', 'Female Voice', 'Soprano', 'Coloratura Soprano', 'Soubrette', 'Mezzo-Soprano',
    'Coloratura Mezzo-Soprano', 'Caberet Mezzo', 'Alto', 'Dramatic Alto', 'Alto Profondo', 'Tenor',
    'Spinto Tenor', 'Counter-Tenor', 'Baritone', 'Verdi Baritone', 'Baryton-Martin', 'Bass',
    'Lyric Bass', 'Basso Cantante', 'Gospel Choirs', 'Barbershop Quartets', 'Female emotive voice',
    'female voice', 'Jamaican slang', 'robotic vocals', 'very robotic vocals', 'female ai',
    'Clear and melodious voice', 'Rapid-fire rap', 'gentle voice', 'Miku voice', 'Vocaloid',
    'speck fast', 'Male singer', 'Children\'s Spoken Word', 'Circular Breathing', 'Ingressive Phonation',
    'Microtonal Singing', 'Beatboxing', 'Throat Singing', 'Vocal Fry', 'Whistle Register',
    'Shibuya-kei', 'emotional depth vocal', 'vocal add ons', 'muffled voice',
    'Spanish male sensual voice', 'whispering voice'
  ];

  const tempos = [
    '60-80 BPM', '80-120 BPM', '120-160 BPM'
  ];

  const handleTagClick = (tag) => {
    setSongStyle((prevStyle) => {
      const currentTags = prevStyle.split(',').map(t => t.trim()).filter(t => t !== '');
      if (!currentTags.includes(tag)) {
        return prevStyle ? `${prevStyle}, ${tag}` : tag;
      }
      return prevStyle;
    });
  };

  const getTagList = () => {
    switch (activeCategory) {
      case 'Genre':
      case 'Moods':
        return genres;
      case 'Voices':
        return voices;
      case 'Tempos':
        return tempos;
      default:
        return [];
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
                  value={songStyle}
                  onChange={(e) => setSongStyle(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  placeholder="E.g. mexican music, cumbia, male voice"
                  inputProps={{ maxLength: 120 }}
                  helperText={`${songStyle.length}/120`}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Style and Genre List
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  {['Genre', 'Moods', 'Voices', 'Tempos'].map((category) => (
                    <Chip
                      key={category}
                      label={`# ${category}`}
                      onClick={() => setActiveCategory(category)}
                      sx={{
                        bgcolor: activeCategory === category ? 'primary.main' : '#2A2A2A',
                        color: 'white',
                        '&:hover': {
                          bgcolor: activeCategory === category ? 'primary.dark' : '#3A3A3A',
                        },
                      }}
                    />
                  ))}
                </Stack>

                <Box sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto' }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {getTagList().map((tag) => (
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

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<MusicNoteIcon />}
              sx={{
                background: 'linear-gradient(45deg, #8E2DE2, #4A00E0)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7B1FA2, #4A00E0)',
                },
              }}
            >
              Generate with AI
            </Button>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              2 free generations remaining today
              <Button
                color="primary"
                size="small"
                sx={{ ml: 1, textTransform: 'none', fontWeight: 'bold' }}
              >
                Upgrade Now →
              </Button>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Create; 