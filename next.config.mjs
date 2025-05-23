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
    domains: ["images.pexels.com", "picsum.photos", "res.cloudinary.com"],
  },

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
