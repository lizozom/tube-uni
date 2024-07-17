/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverMinification: false,
    },
    images: {
      domains: ['tubeuni.app'],
    },
};

export default nextConfig;
