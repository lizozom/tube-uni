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
});

export default nextConfig;
