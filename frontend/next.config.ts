import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@tabler/icons-react",
    ],
  },
  // Explicitly set the root to the frontend directory to avoid
  // resolution issues when nested inside another package.json
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "127.0.0.1",
  ],
};

export default nextConfig;
