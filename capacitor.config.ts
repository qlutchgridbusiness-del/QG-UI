import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amazetech.qlutchgrid',
  appName: 'QlutchGrid',
  webDir: ".next",
  server: {
    url: 'http://98.92.68.89:3000/', // e.g., your deployed Next.js site
    cleartext: true
  }
};

export default config;
