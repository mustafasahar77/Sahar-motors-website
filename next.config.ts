import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — `next build` emits plain HTML/CSS/JS into ./out, hostable on
  // any static web server (Nginx, Apache, Cloudflare Pages, Netlify, S3, etc.).
  output: "export",

  // No Next.js image-optimization server exists in a static export, so images
  // are served as-is. This lets dealer-supplied photos in /public/inventory
  // work without any build step or external service.
  images: {
    unoptimized: true,
  },

  // Emit `/inventory/` -> `/inventory/index.html` so deep links resolve on
  // simple static hosts that don't rewrite extensionless URLs.
  trailingSlash: true,
};

export default nextConfig;
