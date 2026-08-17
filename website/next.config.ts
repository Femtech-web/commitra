import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, "src/visual-edits/component-tagger-loader.js");

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  turbopack: {
    root: __dirname,
    ...(isDev && {
      rules: {
        "*.{jsx,tsx}": {
          loaders: [LOADER],
        },
      },
    }),
  },
};

export default nextConfig;
