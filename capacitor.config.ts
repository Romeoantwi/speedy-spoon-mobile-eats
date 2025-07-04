import { CapacitorConfig } from '@capacitor/core';

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
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    }
  }
};

export default config;