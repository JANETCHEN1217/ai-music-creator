import React from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  ListItemIcon,
  alpha,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SettingsIcon from '@mui/icons-material/Settings';
import { styled } from '@mui/material/styles';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: 8,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.3),
    },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.01)',
    boxShadow: theme.shadows[4],
  },
}));

const tutorials = {
  'Getting Started': [
    { title: 'Introduction to AI Song Generator', path: '/tutorials/introduction' },
    { title: 'Writing Your First Simple Prompt', path: '/tutorials/simple-prompt' },
    { title: 'Mastering Custom Mode Style Prompts', path: '/tutorials/style-prompt' },
    { title: 'Extending and Recreating Songs', path: '/tutorials/extend-recreate' }
  ],
  'Advanced Features': [
    { title: 'Understanding Music Styles', path: '/tutorials/music-styles' },
    { title: 'Working with Vocals', path: '/tutorials/vocals' },
    { title: 'Instrumental Mode Tips', path: '/tutorials/instrumental' },
    { title: 'Genre Mixing Techniques', path: '/tutorials/genre-mixing' }
  ],
  'Song Structure': [
    { title: 'Verse and Chorus Creation', path: '/tutorials/verse-chorus' },
    { title: 'Pre-chorus and Bridge', path: '/tutorials/pre-chorus-bridge' },
    { title: 'Song Structure Tags', path: '/tutorials/song-structure' },
    { title: 'Instrumental Sections', path: '/tutorials/instrumental-sections' }
  ],
  'Best Practices': [
    { title: 'Writing Effective Prompts', path: '/tutorials/effective-prompts' },
    { title: 'Optimizing Song Quality', path: '/tutorials/quality' },
    { title: 'Common Mistakes to Avoid', path: '/tutorials/mistakes' },
    { title: 'Pro Tips and Tricks', path: '/tutorials/pro-tips' }
  ]
};

const tutorialContent = {
  'introduction': {
    title: 'Introduction to AI Song Generator',
    content: [
      {
        subtitle: 'Welcome to AI Song Generator',
        text: 'Learn how to create professional-quality songs using our AI-powered platform. No musical experience required!'
      },
      {
        subtitle: 'What You\'ll Learn',
        text: '• How to use Simple and Custom modes\n• Writing effective prompts\n• Understanding music styles\n• Creating your first AI song'
      }
    ]
  },
  'style-prompt': {
    title: 'Mastering Custom Mode Style Prompts',
    content: [
      {
        subtitle: 'Understanding Style Prompts',
        text: 'Style prompts are the key to controlling how your AI-generated music sounds. Learn how to craft the perfect prompt for your desired musical style.'
      },
      {
        subtitle: 'Components of a Style Prompt',
        text: '1. Genre (e.g., Pop, Rock, Jazz)\n2. Mood (e.g., Happy, Melancholic)\n3. Instruments\n4. Vocal style\n5. Tempo and rhythm'
      },
      {
        subtitle: 'Example Prompts',
        text: 'Here are some effective style prompt examples:\n\n• "Upbeat pop song with female vocals and acoustic guitar"\n• "Dark electronic beats with heavy bass and atmospheric synths"\n• "Jazz fusion with smooth saxophone and piano solos"'
      },
      {
        subtitle: 'Tips for Better Results',
        text: '• Keep prompts clear and specific\n• Use musical terminology when possible\n• Combine different elements thoughtfully\n• Start simple and iterate'
      }
    ]
  }
  // Add more tutorial content as needed
};

const Tutorials = () => {
  const [selectedTutorial, setSelectedTutorial] = React.useState('introduction');

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      p: 3,
      gap: 3
    }}>
      {/* Left Sidebar */}
      <StyledPaper elevation={3} sx={{ width: 320, p: 2 }}>
        {Object.entries(tutorials).map(([category, items]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              {category}
            </Typography>
            <List dense disablePadding>
              {items.map((item) => (
                <StyledListItem
                  key={item.title}
                  button
                  selected={selectedTutorial === item.path.split('/')[2]}
                  onClick={() => setSelectedTutorial(item.path.split('/')[2])}
                >
                  <ListItemIcon>
                    <PlayArrowIcon color={selectedTutorial === item.path.split('/')[2] ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: selectedTutorial === item.path.split('/')[2] ? 600 : 400
                      }
                    }}
                  />
                </StyledListItem>
              ))}
            </List>
          </Box>
        ))}
      </StyledPaper>

      {/* Main Content */}
      <StyledPaper elevation={3} sx={{ flex: 1, p: 4 }}>
        {tutorialContent[selectedTutorial] && (
          <>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #6C63FF, #FF6584)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 4
              }}
            >
              {tutorialContent[selectedTutorial].title}
            </Typography>
            {tutorialContent[selectedTutorial].content.map((section, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 4,
                  '&:hover': {
                    transform: 'translateX(4px)',
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                {section.subtitle && (
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600
                    }}
                  >
                    {section.subtitle}
                  </Typography>
                )}
                {section.text && (
                  <Typography
                    variant="body1"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      mb: 2,
                      lineHeight: 1.8,
                      color: 'text.secondary'
                    }}
                  >
                    {section.text}
                  </Typography>
                )}
              </Box>
            ))}
          </>
        )}
      </StyledPaper>
    </Box>
  );
};

export default Tutorials; 