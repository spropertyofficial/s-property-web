/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["images.pexels.com", "picsum.photos"],
  },

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  transpilePackages: ["sweetalert2", "notyf", "react-datepicker"],
};

export default nextConfig;
