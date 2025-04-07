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
} from '@mui/material';

const tutorials = {
  'Getting Started': [
    { title: 'Introduction', path: '/tutorials/introduction' },
    { title: 'How do I write a simple prompt?', path: '/tutorials/simple-prompt' },
    { title: 'Custom Mode: How do I write a Style Prompt?', path: '/tutorials/style-prompt' },
    { title: 'How to Extend and Recreate Music', path: '/tutorials/extend-recreate' }
  ],
  'Metatags': [
    { title: 'Verse and Chorus', path: '/tutorials/verse-chorus' },
    { title: 'Pre-chorus and Bridge', path: '/tutorials/pre-chorus-bridge' },
    { title: 'Song Structure Tags', path: '/tutorials/song-structure' },
    { title: 'Instrumental Tags', path: '/tutorials/instrumental-tags' }
  ],
  'Style and Lyrics': [
    { title: 'Styles and genres', path: '/tutorials/styles-genres' },
    { title: 'Should my Style Prompt use commas?', path: '/tutorials/style-prompt-commas' }
  ]
};

const TutorialContent = {
  'style-prompt': {
    title: 'Custom Mode: How do I write a Style Prompt?',
    content: [
      {
        subtitle: 'Custom Mode',
        text: 'Custom Mode splits the text prompts into 2 panels, a Lyric and a Style of Music prompt.'
      },
      {
        subtitle: 'The Lyrics box will hold around 2000 characters.',
        text: ''
      },
      {
        subtitle: 'How do I control the style of music?',
        text: 'Style of Music isn\'t just the music\'s genre, it also includes the mood and sub-genre descriptions, instruments, and vocal tags. It might be very simple, or a comma-separated list.'
      },
      {
        subtitle: 'Examples:',
        text: [
          'Sultry RnB',
          'Upbeat Country, Female vocal',
          'Mississippi Blues, sparse harmonica, acoustic guitar, stomp',
          'bittersweet Hindustani Electro-pop, melodic sarad, ornamental singing'
        ].join('\n')
      },
      {
        subtitle: 'The Style of Music box will hold around 120 characters.',
        text: ''
      },
      {
        subtitle: 'Less Is More:',
        text: 'As a general rule, very short prompts seem to create the cleanest audio quality, when the creative details are left up to the AI.\n\nIn contrast, mashing-up genres and long detailed prompts of specific instruments and styles are more likely to suffer from poor audio quality.'
      }
    ]
  }
};

const Tutorials = () => {
  const [selectedTutorial, setSelectedTutorial] = React.useState('style-prompt');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Left Sidebar */}
      <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', p: 2 }}>
        {Object.entries(tutorials).map(([category, items]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {category}
            </Typography>
            <List dense disablePadding>
              {items.map((item) => (
                <ListItem
                  key={item.title}
                  button
                  selected={selectedTutorial === item.path.split('/').pop()}
                  onClick={() => setSelectedTutorial(item.path.split('/').pop())}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemText primary={item.title} />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>
        {TutorialContent[selectedTutorial] && (
          <>
            <Typography variant="h4" gutterBottom>
              {TutorialContent[selectedTutorial].title}
            </Typography>
            {TutorialContent[selectedTutorial].content.map((section, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                {section.subtitle && (
                  <Typography variant="h6" gutterBottom>
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
                    }}
                  >
                    {section.text}
                  </Typography>
                )}
              </Box>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Tutorials; 