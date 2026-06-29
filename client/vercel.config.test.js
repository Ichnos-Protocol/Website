/* global process */
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, it, expect } from 'vitest';

const configPath = resolve(process.cwd(), 'vercel.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

describe('vercel.json routing', () => {
  it('redirects /data to /passport with a 301 status', () => {
    const redirect = config.redirects?.find(
      (entry) => entry.source === '/data',
    );
    expect(redirect).toBeDefined();
    expect(redirect.destination).toBe('/passport');
    expect(redirect.statusCode).toBe(301);
  });

  it('redirects /catena-x to /passport with a 301 status', () => {
    const redirect = config.redirects?.find(
      (entry) => entry.source === '/catena-x',
    );
    expect(redirect).toBeDefined();
    expect(redirect.destination).toBe('/passport');
    expect(redirect.statusCode).toBe(301);
  });

  it('preserves the /api proxy route', () => {
    const apiRoute = config.routes?.find((entry) => entry.src === '/api/(.*)');
    expect(apiRoute).toBeDefined();
    // The route must keep proxying to the configured backend host, not just
    // exist. Assert the dest shape and the VITE_API_HOST binding so a removed
    // or retargeted proxy fails the D6/R10 invariant.
    expect(apiRoute.dest).toBe('https://$VITE_API_HOST/api/$1');
    expect(apiRoute.env).toContain('VITE_API_HOST');
  });

  it('preserves the SPA rewrite catch-all', () => {
    const spaRewrite = config.rewrites?.find(
      (entry) => entry.source === '/(.*)',
    );
    expect(spaRewrite).toBeDefined();
    expect(spaRewrite.destination).toBe('/index.html');
  });
});
