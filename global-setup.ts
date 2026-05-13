import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_FILE = path.resolve(__dirname, 'auth.json');

async function globalSetup() {
  const baseURL   = process.env['BASE_URL']       ?? 'https://dummyjson.com';
  const username  = process.env['AUTH_USERNAME']  ?? 'emilys';
  const password  = process.env['AUTH_PASSWORD']  ?? 'emilyspass';

  const context = await request.newContext({ baseURL });

  try {
    // ── 1. Health check ───────────────────────────────────────────────────────
    const health = await context.get('/products/1');
    if (!health.ok()) {
      throw new Error(`API health check failed — status: ${health.status()}`);
    }
    console.log(` API is reachable at ${baseURL}`);

    // ── 2. Login and save token ───────────────────────────────────────────────
    const loginRes = await context.post('/auth/login', {
      data: { username, password, expiresInMins: 60 },
    });

    if (!loginRes.ok()) {
      throw new Error(`Login failed — status: ${loginRes.status()}`);
    }

    const body = await loginRes.json() as { accessToken: string; refreshToken: string };

    fs.writeFileSync(AUTH_FILE, JSON.stringify({
      accessToken:  body.accessToken,
      refreshToken: body.refreshToken,
    }, null, 2));

    console.log(`✅ Login successful — token saved to auth.json`);
  } finally {
    await context.dispose();
  }
}

export default globalSetup;
