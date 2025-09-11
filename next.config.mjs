// next.config.mjs
import createNextPWA from "next-pwa";

const withPWA = createNextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  sw: "/serviceWorker.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.twilio.com",
        pathname: "/**",
      },
    ],
  },
  env: {},

  webpack: (config) => {
    config.optimization.splitChunks = false;
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  transpilePackages: ["sweetalert2", "notyf", "react-datepicker"],
};

export default withPWA(nextConfig);
