// src/lib/utils/getBaseUrl.js

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.VERCEL_URL) {
    return `https://$\{process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT || 4004}`;
};
