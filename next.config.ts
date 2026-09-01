import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.teamup.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        // Kurzlink für Newsletter/Flyer — Ziel jährlich anpassbar.
        // permanent: false, damit Browser das Ziel nicht dauerhaft cachen.
        source: '/flohmarkt',
        destination:
          'https://docs.google.com/forms/d/e/1FAIpQLSc6Dw5L3hKh3E6baKsjFqHn2jF97orbmERH8qtMLULjNVxasQ/viewform',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
