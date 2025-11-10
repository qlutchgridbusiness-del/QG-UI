import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amazetech.qlutchgrid',
  appName: 'QlutchGrid',
  webDir: 'out', // or 'dist', but you can also use a live URL
  server: {
    url: 'https://your-production-domain.com', // e.g., your deployed Next.js site
    cleartext: true
  }
};

export default config;
