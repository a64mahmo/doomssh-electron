import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
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
};

export default nextConfig;
