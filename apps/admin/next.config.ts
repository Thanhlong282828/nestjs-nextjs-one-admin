import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  ...(process.env.AURUM_NEXT_TEST_DIST_DIR === '1' ? { distDir: '.next-e2e' } : {}),
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default config;
