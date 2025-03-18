/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_FRONTEND_URI + '/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig