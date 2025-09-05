import type { NextConfig } from "next";
import { execSync } from "child_process";

const isDev = process.env.NODE_ENV === "development";

const getGitHash = (): string => {
  try {
    return execSync("git rev-parse HEAD").toString().trim().slice(0, 7);
  } catch (error) {
    console.warn("Failed to get git hash:", error);
    return "unknown";
  }
};

const gitHash = getGitHash();
const timestamp = Date.now();

const nextConfig: NextConfig = {
  env: {
    API_URL: isDev
      ? process.env.API_URL || "http://127.0.0.1:1339"
      : process.env.API_URL || "https://axiomapi.herokuapp.com",
    NEXT_PUBLIC_API_URL: isDev
      ? process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:1339"
      : process.env.NEXT_PUBLIC_API_URL || "https://axiomapi.herokuapp.com",
    BASE_URL: isDev
      ? process.env.BASE_URL || "http://127.0.0.1:3003"
      : process.env.BASE_URL || "https://indicentral.ca",
    BASE_URL_INDI: isDev
      ? process.env.BASE_URL_INDI || "http://127.0.0.1:3003"
      : process.env.BASE_URL_INDI || "https://indicentral.ca",
    AWS_BUCKET: process.env.AWS_BUCKET || "indi-strapi-v2",
    AWS_BUCKET_URL:
      process.env.AWS_BUCKET_URL ||
      "https://indi-strapi-v2.s3.us-east-1.amazonaws.com",
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE || "false",
    MAINTENANCE_END_TIME:
      process.env.MAINTENANCE_END_TIME || "Monday February 24th, 8:00AM (MST)",
    NEXT_PUBLIC_BUILD_ID: `build-${gitHash}-${timestamp}`,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    BUILD_TIME: new Date().toISOString(),
  },

  generateBuildId: async () => {
    return `build-${gitHash}-${timestamp}`;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "indi-strapi.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    largePageDataBytes: 128 * 100000,
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.pdf$/i,
      type: "asset/source",
    });
    return config;
  },

  async redirects() {
    if (process.env.MAINTENANCE_MODE === "true") {
      return [
        {
          source: "/:path((?!maintenance|_next|images|fonts|favicon.ico).*)",
          destination: "/maintenance",
          permanent: false,
        },
      ];
    }
    return [];
  },

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Apply stricter rules to JavaScript files
        source: "/_next/static/chunks/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/resources/document/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/compliance/document/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/printables/document/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
