import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      }
    ]
  },

  // Remove HTTP to HTTPS redirect - handle this at deployment level (Vercel/Netlify automatically handle HTTPS)
  // async redirects() {
  //   return [
  //     {
  //       source: '/:path*',
  //       destination: 'https://:host/:path*',
  //       permanent: true,
  //       has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }]
  //     }
  //   ]
  // },

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // React compiler for better performance and security
  reactCompiler: true,

  // Turbopack configuration
  turbopack: {
    root: process.cwd(),
  },

  // Images optimization with security
  images: {
    remotePatterns: (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS || 'hrone-69dz.onrender.com')
      .split(',')
      .map(domain => ({
        protocol: 'https',
        hostname: domain.trim(),
      })),
    dangerouslyAllowSVG: false, // Disable SVG images for security
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance optimizations for Lighthouse
  // swcMinify: true, // Removed: SWC minifier is enabled by default in Next.js
  
  // Bundle analyzer for development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),

  // Optimize CSS and JS loading
  // optimizeFonts: true, // Removed: not a valid Next.js option
  
  // Experimental features for performance
  experimental: {
    // Optimize for production
    optimizeCss: true,
    // Enable modern JavaScript features
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion'],
    // Webpack build worker
    webpackBuildWorker: true,
  },

  // Webpack optimizations for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting in production
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          chunks: 'all',
          priority: 20,
        },
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide',
          chunks: 'all',
          priority: 20,
        },
      };
    }

    // Remove unused code in production
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
    }

    // Security: Prevent source maps in production
    if (!dev) {
      config.devtool = false;
    }

    return config;
  },
};

export default nextConfig;
