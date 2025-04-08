import React from 'react';
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
import GoogleLogin from './GoogleLogin';

const Navbar = () => {
  const { user, login, logout } = useUser();
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

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'background.paper', boxShadow: 1 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          AI Music Creator
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            component={RouterLink}
            to="/create"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Create
          </Button>
          <Button
            component={RouterLink}
            to="/tutorials"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Tutorials
          </Button>
          
          {user ? (
            <>
              <Tooltip title="Account settings">
                <IconButton onClick={handleMenu} size="small">
                  <Avatar
                    alt={user.name}
                    src={user.imageUrl}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{user.email}</Typography>
                </MenuItem>
                <MenuItem component={RouterLink} to="/profile">Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <GoogleLogin
              onSuccess={(userData) => {
                console.log('Login Success:', userData);
                login(userData);
              }}
              onError={(error) => {
                console.error('Login Error:', error);
              }}
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 