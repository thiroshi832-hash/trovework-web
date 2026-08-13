import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the Docker image ships only what it needs.
  output: "standalone",
  // Trace from the monorepo root so workspace deps are included.
  // Output lands at .next/standalone/apps/web/server.js — see apps/web/Dockerfile.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  poweredByHeader: false,
  reactStrictMode: true,
  // /signup shipped publicly before the rename; keep those links (and common
  // guesses) working rather than 404ing.
  async redirects() {
    return [
      { source: "/signup", destination: "/register", permanent: true },
      { source: "/sign-up", destination: "/register", permanent: true },
      { source: "/join", destination: "/register", permanent: true },
      { source: "/signin", destination: "/login", permanent: true },
      { source: "/sign-in", destination: "/login", permanent: true },
    ];
  },
};

export default nextConfig;
