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
        text: 'Welcome to the future of music creation! Our AI Song Generator combines cutting-edge artificial intelligence with intuitive design to help you create professional-quality songs in minutes. Whether you\'re a professional musician or just starting out, our platform makes music creation accessible and enjoyable.'
      },
      {
        subtitle: 'What You\'ll Learn',
        text: '• How to use Simple and Custom modes for different creation needs\n• Writing effective prompts that get the results you want\n• Understanding music styles and genre combinations\n• Creating your first AI-generated song\n• Tips for achieving the best possible results'
      },
      {
        subtitle: 'Getting Started',
        text: 'To begin creating music, simply sign in with your Google account. You\'ll receive free daily credits to generate songs, and you can always upgrade your plan for unlimited access.'
      }
    ]
  },
  'simple-prompt': {
    title: 'Writing Your First Simple Prompt',
    content: [
      {
        subtitle: 'Understanding Simple Mode',
        text: 'Simple Mode is perfect for quick song creation when you have a general idea in mind. It uses natural language processing to understand your description and create a matching song.'
      },
      {
        subtitle: 'Writing Effective Prompts',
        text: 'Good prompts are clear and specific. Include:\n• The mood you want (happy, sad, energetic)\n• The style or genre (pop, rock, jazz)\n• Any specific instruments you want to hear\n• The tempo or energy level'
      },
      {
        subtitle: 'Example Prompts',
        text: 'Here are some effective simple prompts:\n\n"A happy pop song with acoustic guitar for a summer beach party"\n\n"A dramatic orchestral piece with powerful drums for an epic movie scene"\n\n"A soft jazz ballad with piano and saxophone for a romantic dinner"'
      }
    ]
  },
  'style-prompt': {
    title: 'Mastering Custom Mode Style Prompts',
    content: [
      {
        subtitle: 'Custom Mode Overview',
        text: 'Custom Mode gives you precise control over your music creation. It separates your input into two main components: Style and Lyrics. This tutorial focuses on crafting effective style prompts.'
      },
      {
        subtitle: 'Style Prompt Components',
        text: '1. Genre: The primary music style (e.g., Pop, Rock, Jazz)\n2. Sub-genre: More specific style variations\n3. Mood: The emotional quality of the music\n4. Instruments: Specific instruments to include\n5. Vocal style: Type of vocals desired\n6. Tempo: Speed and rhythm preferences'
      },
      {
        subtitle: 'Advanced Techniques',
        text: 'Combine elements effectively:\n\n"Cinematic orchestral rock with electric guitar solos and epic choir vocals"\n\n"Lo-fi hip hop with jazzy piano, vinyl crackle, and mellow beats"\n\n"Progressive metal with complex time signatures, heavy distortion, and clean vocal harmonies"'
      },
      {
        subtitle: 'Pro Tips',
        text: '• Start with the most important elements first\n• Use commas to separate distinct elements\n• Be specific about instrumental elements\n• Consider the overall mood and energy\n• Experiment with genre combinations'
      }
    ]
  },
  'music-styles': {
    title: 'Understanding Music Styles',
    content: [
      {
        subtitle: 'Genre Fundamentals',
        text: 'Each genre has its own characteristics, instruments, and conventions. Understanding these helps you create more authentic-sounding music.'
      },
      {
        subtitle: 'Popular Genres',
        text: 'Pop: Clean production, catchy melodies, verse-chorus structure\nRock: Guitar-driven, energetic, often with strong drums\nJazz: Complex harmonies, improvisation, swing rhythms\nHip Hop: Beat-focused, rhythmic vocals, bass-heavy\nElectronic: Synthesizers, programmed drums, digital effects'
      },
      {
        subtitle: 'Combining Genres',
        text: 'Create unique sounds by mixing genres:\n\n• Pop + Jazz = Smooth, sophisticated pop with complex chords\n• Rock + Electronic = Modern rock with synthesizer elements\n• Classical + Hip Hop = Orchestral hip hop with classical samples'
      }
    ]
  },
  'vocals': {
    title: 'Working with Vocals',
    content: [
      {
        subtitle: 'Vocal Styles',
        text: 'Choose from various vocal styles:\n\n• Clean vocals: Clear, professional singing\n• Distorted vocals: Gritty, aggressive sound\n• Harmonies: Multiple vocal layers\n• Spoken word: Rhythmic speaking\n• Choral: Group vocal arrangements'
      },
      {
        subtitle: 'Language and Lyrics',
        text: 'Our AI can generate vocals in multiple languages and styles. Consider:\n\n• Clarity of pronunciation\n• Emotional delivery\n• Accent and dialect\n• Vocal range and power'
      },
      {
        subtitle: 'Best Practices',
        text: '• Match vocal style to genre\n• Consider the emotional impact\n• Use appropriate vocal effects\n• Balance vocals with instruments\n• Experiment with backing vocals'
      }
    ]
  },
  'instrumental': {
    title: 'Instrumental Mode Tips',
    content: [
      {
        subtitle: 'When to Use Instrumental Mode',
        text: 'Instrumental mode is perfect for:\n\n• Background music\n• Meditation tracks\n• Video soundtracks\n• Podcast intros\n• Dance music'
      },
      {
        subtitle: 'Crafting Instrumental Arrangements',
        text: 'Focus on:\n\n• Melody instruments\n• Rhythm section\n• Bass lines\n• Harmonic progression\n• Sound effects and ambience'
      },
      {
        subtitle: 'Advanced Techniques',
        text: '• Layer multiple instruments\n• Use dynamic changes\n• Create build-ups and breaks\n• Experiment with effects\n• Balance all elements'
      }
    ]
  },
  'quality': {
    title: 'Optimizing Song Quality',
    content: [
      {
        subtitle: 'Quality Factors',
        text: 'Several factors affect the quality of AI-generated music:\n\n• Prompt clarity\n• Style consistency\n• Instrument balance\n• Arrangement complexity\n• Production quality'
      },
      {
        subtitle: 'Common Issues and Solutions',
        text: '1. Muddy mix: Specify instrument roles clearly\n2. Weak melody: Focus on melodic elements\n3. Poor transitions: Request clear section changes\n4. Inconsistent style: Keep genre elements focused\n5. Overcrowded arrangement: Limit instrument combinations'
      },
      {
        subtitle: 'Quality Optimization Tips',
        text: '• Start with simple arrangements\n• Build complexity gradually\n• Test different prompt variations\n• Use reference tracks\n• Review and iterate'
      }
    ]
  }
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