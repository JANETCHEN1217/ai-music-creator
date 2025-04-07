import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
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
            sx={{ fontWeight: 'bold' }}
          >
            Create Unique Music with AI
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            Transform your ideas into beautiful music compositions using
            artificial intelligence. No musical experience required.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <Button
              component={RouterLink}
              to="/create"
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Start Creating
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <MusicNoteIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  AI-Powered Composition
                </Typography>
                <Typography align="center">
                  Our advanced AI algorithms help you create unique and professional
                  music compositions in minutes.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Customizable Styles
                </Typography>
                <Typography align="center">
                  Choose from various music styles and customize your composition
                  to match your vision.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Fast & Easy
                </Typography>
                <Typography align="center">
                  Generate high-quality music in seconds with our intuitive
                  interface and powerful AI technology.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 