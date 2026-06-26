import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, it, expect } from 'vitest';

const configPath = resolve(process.cwd(), 'vercel.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

describe('vercel.json routing', () => {
  it('redirects /passport to /data with a 301 status', () => {
    const redirect = config.redirects?.find(
      (entry) => entry.source === '/passport',
    );
    expect(redirect).toBeDefined();
    expect(redirect.destination).toBe('/data');
    expect(redirect.statusCode).toBe(301);
  });

  it('preserves the /api proxy route', () => {
    const apiRoute = config.routes?.find((entry) => entry.src === '/api/(.*)');
    expect(apiRoute).toBeDefined();
  });

  it('preserves the SPA rewrite catch-all', () => {
    const spaRewrite = config.rewrites?.find(
      (entry) => entry.source === '/(.*)',
    );
    expect(spaRewrite).toBeDefined();
    expect(spaRewrite.destination).toBe('/index.html');
  });
});
