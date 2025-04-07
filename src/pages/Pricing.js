import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const pricingTiers = [
  {
    title: 'Free',
    price: '0',
    description: 'Perfect for trying out our service',
    features: [
      '5 songs per month',
      'Basic music styles',
      'Standard quality export',
      'Community support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
  },
  {
    title: 'Pro',
    subheader: 'Most Popular',
    price: '19.99',
    description: 'For serious music creators',
    features: [
      'Unlimited songs',
      'All music styles',
      'High quality export',
      'Priority support',
      'Advanced customization',
      'No watermark',
    ],
    buttonText: 'Start Pro',
    buttonVariant: 'contained',
  },
  {
    title: 'Enterprise',
    price: '99.99',
    description: 'For professional studios and teams',
    features: [
      'Everything in Pro',
      'API access',
      'Custom branding',
      'Dedicated support',
      'Team collaboration',
      'Advanced analytics',
    ],
    buttonText: 'Contact Us',
    buttonVariant: 'outlined',
  },
];

const Pricing = () => {
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
          Pricing Plans
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Choose the perfect plan for your music creation needs
        </Typography>

        <Grid container spacing={4} alignItems="flex-end" sx={{ mt: 4 }}>
          {pricingTiers.map((tier) => (
            <Grid
              item
              key={tier.title}
              xs={12}
              sm={tier.title === 'Pro' ? 12 : 6}
              md={4}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(tier.title === 'Pro' && {
                    transform: 'scale(1.05)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }),
                }}
              >
                <CardHeader
                  title={tier.title}
                  subheader={tier.subheader}
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  sx={{
                    backgroundColor: tier.title === 'Pro' ? 'primary.main' : 'transparent',
                    color: tier.title === 'Pro' ? 'white' : 'text.primary',
                  }}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      mb: 2,
                    }}
                  >
                    <Typography component="h2" variant="h3" color="text.primary">
                      ${tier.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      /month
                    </Typography>
                  </Box>
                  <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{ mb: 3 }}
                  >
                    {tier.description}
                  </Typography>
                  <List>
                    {tier.features.map((feature) => (
                      <ListItem key={feature} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <CheckIcon sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant}
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    {tier.buttonText}
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

export default Pricing; 