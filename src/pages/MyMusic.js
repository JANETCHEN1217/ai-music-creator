import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';

// Mock data for saved compositions
const savedCompositions = [
  {
    id: 1,
    title: 'Summer Vibes',
    style: 'Pop',
    mood: 'Happy',
    duration: '45s',
    date: '2023-06-15',
  },
  {
    id: 2,
    title: 'Night Drive',
    style: 'Electronic',
    mood: 'Energetic',
    duration: '60s',
    date: '2023-06-10',
  },
  {
    id: 3,
    title: 'Peaceful Morning',
    style: 'Classical',
    mood: 'Relaxed',
    duration: '30s',
    date: '2023-06-05',
  },
];

const MyMusic = () => {
  const [playingId, setPlayingId] = React.useState(null);

  const handlePlayPause = (id) => {
    setPlayingId(playingId === id ? null : id);
  };

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log('Deleting composition:', id);
  };

  const handleDownload = (id) => {
    // Implement download functionality
    console.log('Downloading composition:', id);
  };

  const handleShare = (id) => {
    // Implement share functionality
    console.log('Sharing composition:', id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Music
      </Typography>

      <Grid container spacing={3}>
        {savedCompositions.map((composition) => (
          <Grid item xs={12} sm={6} md={4} key={composition.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {composition.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Style: {composition.style}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Mood: {composition.mood}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Duration: {composition.duration}
                </Typography>
                <Typography color="text.secondary">
                  Created: {composition.date}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <IconButton
                  onClick={() => handlePlayPause(composition.id)}
                  color="primary"
                >
                  {playingId === composition.id ? (
                    <PauseIcon />
                  ) : (
                    <PlayArrowIcon />
                  )}
                </IconButton>
                <IconButton
                  onClick={() => handleDownload(composition.id)}
                  color="primary"
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleShare(composition.id)}
                  color="primary"
                >
                  <ShareIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  onClick={() => handleDelete(composition.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MyMusic; 