/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
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
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
          ],
        },
      ];
    },
});

export default nextConfig;
