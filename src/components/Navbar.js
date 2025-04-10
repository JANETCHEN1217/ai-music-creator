import React, { useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MusicService from '../services/musicService';

const Navbar = () => {
  const { user, logout } = useUser();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.error('Google Sign-In was not displayed:', notification.getNotDisplayedReason());
        } else if (notification.isSkippedMoment()) {
          console.error('Google Sign-In was skipped:', notification.getSkippedReason());
        }
      });
    } else {
      console.error('Google Sign-In is not initialized');
    }
    handleClose();
  };

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await MusicService.getTags();
        // 使用标签
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };

    loadTags();
  }, []);

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#111', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 500,
              letterSpacing: 0.5,
              mr: 4,
            }}
          >
            AI Music Creator
          </Typography>

          <Button
            component={RouterLink}
            to="/home"
            sx={{ color: 'white', textTransform: 'none', mr: 2 }}
          >
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/create"
            sx={{ color: 'white', textTransform: 'none', mr: 2 }}
          >
            Create
          </Button>
          <Button
            component={RouterLink}
            to="/pricing"
            sx={{ color: 'white', textTransform: 'none', mr: 2 }}
          >
            Pricing
          </Button>
          <Button
            component={RouterLink}
            to="/my-songs"
            sx={{ color: 'white', textTransform: 'none', mr: 2 }}
          >
            My Songs
          </Button>
          <Button
            component={RouterLink}
            to="/tutorials"
            sx={{ color: 'white', textTransform: 'none' }}
          >
            Tutorials
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={user ? "Account settings" : "Sign in"}>
            <IconButton onClick={handleMenu} size="small" sx={{ color: 'white' }}>
              {user ? (
                <Avatar
                  alt={user.name}
                  src={user.imageUrl}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {user ? (
              [
                <MenuItem key="email" disabled>
                  <Typography variant="body2">{user.email}</Typography>
                </MenuItem>,
                <MenuItem key="profile" component={RouterLink} to="/profile">Profile</MenuItem>,
                <MenuItem key="settings">Settings</MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>Logout</MenuItem>
              ]
            ) : (
              <MenuItem onClick={handleLogin}>
                Sign in with Google
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 