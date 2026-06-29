// CricMax Branding Configuration
export const BRANDING = {
  APP_NAME: 'CricMax',
  TAGLINE: 'Master the Game',
  LOGO_PATH: '/logo.svg',
  COLORS: {
    PRIMARY: '#003D82', // Deep Blue
    SECONDARY: '#D4AF37', // Gold
    ACCENT: '#0052A3', // Lighter Blue
    DARK: '#001F47',
    LIGHT: '#F8F9FA',
  },
  SOCIAL: {
    TWITTER: 'https://twitter.com/cricmax',
    FACEBOOK: 'https://facebook.com/cricmax',
    INSTAGRAM: 'https://instagram.com/cricmax',
  },
};

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL ?? '',
  VERSION: 'v1',
  TIMEOUT: 30000,
};
