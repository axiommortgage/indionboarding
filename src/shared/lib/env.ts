/**
 * Environment configuration utility
 * Provides type-safe access to environment variables
 */

export const env = {
  // API Configuration
  API_URL:
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:1339",
  BASE_URL:
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://127.0.0.1:3003",
  BASE_URL_INDI: process.env.BASE_URL_INDI || "http://127.0.0.1:3003",

  // AWS Configuration
  AWS_BUCKET: process.env.AWS_BUCKET || "indi-strapi-v2",
  AWS_BUCKET_URL:
    process.env.AWS_BUCKET_URL ||
    "https://indi-strapi-v2.s3.us-east-1.amazonaws.com",

  // Cloudflare Configuration
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,

  // Maintenance Mode
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === "true",
  MAINTENANCE_END_TIME:
    process.env.MAINTENANCE_END_TIME || "Monday February 24th, 8:00AM (MST)",

  // Build Information
  BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID,
  BUILD_TIME: process.env.BUILD_TIME,

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
} as const;

/**
 * Validates that required environment variables are set
 */
export function validateEnv() {
  const requiredEnvVars = [
    "API_URL",
    "BASE_URL",
    "AWS_BUCKET",
    "AWS_BUCKET_URL",
  ] as const;

  const missing = requiredEnvVars.filter(
    (envVar) => !env[envVar as keyof typeof env]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export default env;
