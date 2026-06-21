import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Next.js 16 requires localPatterns; a single /** allows all public/ assets
    // (logo.png, /uploads/**, /hero/**, etc.)
    localPatterns: [{ pathname: "/**" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      /* Legacy CMS / frontend assets during migration */
      {
        protocol: "https",
        hostname: "donboscocollege.ac.in",
      },
      {
        protocol: "https",
        hostname: "www.donboscocollege.ac.in",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/sitemap",
        destination: "/site-map",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
