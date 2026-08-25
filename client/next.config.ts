import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Fallback to Render backend if NEXT_PUBLIC_API_URL not set
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://jira-clone-app.onrender.com",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
