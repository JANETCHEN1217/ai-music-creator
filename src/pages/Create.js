import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Create = () => {
  const [mode, setMode] = useState('custom');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songStyle, setSongStyle] = useState('');

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleInstrumentalChange = (event) => {
    setIsInstrumental(event.target.checked);
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
                onChange={handleModeChange}
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
                  onChange={handleInstrumentalChange}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Instrumental Mode</span>
                  <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
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
              sx={{ mb: 2 }}
              placeholder="E.g. mexican music, cumbia, male voice"
              inputProps={{ maxLength: 120 }}
              helperText={`${songStyle.length}/120`}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Style and Genre List
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Genre" onClick={() => {}} />
              <Chip label="Moods" onClick={() => {}} />
              <Chip label="Voices" onClick={() => {}} />
              <Chip label="Tempos" onClick={() => {}} />
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Enter song lyrics"
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<MusicNoteIcon />}
            >
              Generate Music
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Create; 