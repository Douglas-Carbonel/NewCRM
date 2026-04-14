/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const sapUrl = process.env.SAP_SERVICE_URL || 'http://localhost:3000';
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return [
      {
        source: '/api/sap/:path*',
        destination: `${sapUrl}/api/:path*`,
      },
      {
        source: '/api/strapi/:path*',
        destination: `${strapiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
