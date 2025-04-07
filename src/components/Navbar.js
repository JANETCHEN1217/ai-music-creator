import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [language, setLanguage] = useState('English');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          component={RouterLink}
          to="/"
          sx={{ mr: 2 }}
        >
          <MusicNoteIcon sx={{ color: 'primary.main' }} />
        </IconButton>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 600,
            mr: 4,
          }}
        >
          AI Music Creator
        </Typography>

        {/* Navigation Links */}
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={RouterLink} to="/home">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/create">
            Create
          </Button>
          <Button color="inherit" component={RouterLink} to="/pricing">
            Pricing
          </Button>
          <Button color="inherit" component={RouterLink} to="/my-songs">
            My Songs
          </Button>
          <Button color="inherit" component={RouterLink} to="/tutorials">
            Tutorials
          </Button>
        </Stack>

        {/* Right Side Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Select
            value={language}
            onChange={handleLanguageChange}
            variant="standard"
            sx={{ 
              color: 'text.secondary',
              '&:before': { borderColor: 'transparent' },
              '&:after': { borderColor: 'transparent' },
            }}
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="中文">中文</MenuItem>
          </Select>
          
          <IconButton color="inherit">
            <DarkModeIcon />
          </IconButton>

          <IconButton
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 