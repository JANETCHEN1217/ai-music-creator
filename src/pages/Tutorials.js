import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const tutorials = [
  {
    title: 'Getting Started with AI Music Creator',
    description: 'Learn the basics of creating your first AI-generated song',
    image: '/tutorials/getting-started.jpg',
    duration: '5:30',
  },
  {
    title: 'Advanced Music Styles',
    description: 'Explore different music styles and how to combine them',
    image: '/tutorials/styles.jpg',
    duration: '8:45',
  },
  {
    title: 'Mastering Instrumental Mode',
    description: 'Create professional instrumental tracks with AI',
    image: '/tutorials/instrumental.jpg',
    duration: '7:15',
  },
  {
    title: 'Lyrics Writing Tips',
    description: 'Learn how to write effective lyrics for AI music generation',
    image: '/tutorials/lyrics.jpg',
    duration: '6:20',
  },
  {
    title: 'Music Production Techniques',
    description: 'Professional tips for enhancing your AI-generated music',
    image: '/tutorials/production.jpg',
    duration: '10:00',
  },
  {
    title: 'Exporting and Publishing',
    description: 'Learn how to export and share your music with the world',
    image: '/tutorials/export.jpg',
    duration: '4:55',
  },
];

const Tutorials = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Tutorials
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Learn how to create amazing music with our step-by-step tutorials
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {tutorials.map((tutorial, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      pt: '56.25%', // 16:9 aspect ratio
                      bgcolor: 'grey.800',
                    }}
                    image={tutorial.image}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    {tutorial.duration}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {tutorial.title}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {tutorial.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                  >
                    Watch Tutorial
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Tutorials; 