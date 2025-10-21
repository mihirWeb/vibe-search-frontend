module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Add your image domains here
  },
  env: {
    API_URL: process.env.API_URL, // Example of using environment variables
  },
};