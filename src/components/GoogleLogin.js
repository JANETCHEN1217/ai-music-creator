import React, { useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { styled } from '@mui/material/styles';

const StyledGoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#fff',
  color: '#757575',
  textTransform: 'none',
  padding: '12px 24px',
  borderRadius: 12,
  border: '1px solid #dadce0',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#f8f9fa',
    boxShadow: theme.shadows[2],
  },
  '& .MuiButton-startIcon': {
    marginRight: 12,
  },
}));

const GoogleLogin = ({ onSuccess, onError }) => {
  useEffect(() => {
    // Load the Google API Script
    const loadGoogleScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        
        return new Promise((resolve) => {
          script.onload = () => resolve();
        });
      }
      return Promise.resolve();
    };

    // Initialize Google Sign-In
    const initializeGoogleSignIn = async () => {
      try {
        await loadGoogleScript();
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        onError && onError(error);
      }
    };

    initializeGoogleSignIn();
  }, [onError]);

  const handleGoogleResponse = (response) => {
    if (response.credential) {
      // Decode the JWT token
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const { name, email, picture, sub } = JSON.parse(jsonPayload);
      
      const userData = {
        id: sub,
        name: name,
        email: email,
        imageUrl: picture,
        token: response.credential
      };

      onSuccess && onSuccess(userData);
    }
  };

  const handleGoogleLogin = () => {
    window.google?.accounts.id.prompt();
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <StyledGoogleButton
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        fullWidth
      >
        Sign in with Google
      </StyledGoogleButton>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        To start creating AI music and access your saved songs
      </Typography>
    </Box>
  );
};

export default GoogleLogin; 