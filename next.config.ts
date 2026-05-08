import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Opt @google/generative-ai out of bundling — use native Node.js require
  // (was `experimental.serverComponentsExternalPackages` in Next.js 14)
  serverExternalPackages: ['@google/generative-ai', 'pdf-parse'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
