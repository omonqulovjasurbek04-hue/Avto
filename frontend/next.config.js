/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:4000/api/:path*',
      },
      {
        source: '/engine.js',
        destination: 'http://127.0.0.1:4000/engine.js',
      },
    ];
  },
};

module.exports = nextConfig;
