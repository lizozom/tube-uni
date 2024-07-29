/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
});

const nextConfig = withPWA({
    experimental: {
        serverMinification: false,
    },
    images: {
      domains: ['tubeuni.app'],
    },
    async headers() {
      return [
        {
          source: '/manifest.json',
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
          ]
        },
      ];
    },
});

export default nextConfig;
