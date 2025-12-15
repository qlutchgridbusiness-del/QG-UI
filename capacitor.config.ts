import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amazetech.qlutchgrid',
  appName: 'QlutchGrid',
  webDir: ".next",
  server: {
    url: 'http://13.223.188.185:3000/', // e.g., your deployed Next.js site
    cleartext: true
  }
};

export default config;
