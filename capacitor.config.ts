
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.140dbf6e66ea4ed5bbc32b0669d696a2',
  appName: 'speedy-spoon-mobile-eats',
  webDir: 'dist',
  server: {
    url: 'https://140dbf6e-66ea-4ed5-bbc3-2b0669d696a2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f97316',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;
