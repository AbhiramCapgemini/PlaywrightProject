import { test as base } from '@playwright/test';
import { ApiClient, UsersApi, ProductsApi } from '../utils/apiClient';
import * as fs from 'fs';
import * as path from 'path';

type Fixtures = {
  api:         ApiClient;
  usersApi:    UsersApi;
  productsApi: ProductsApi;
};

function readToken(): string {
  const authFile = path.resolve(__dirname, '..', 'auth.json');
  if (fs.existsSync(authFile)) {
    const auth = JSON.parse(fs.readFileSync(authFile, 'utf-8')) as { accessToken: string };
    return auth.accessToken;
  }
  return '';
}

export const test = base.extend<Fixtures>({

  // base client — generic HTTP methods
  api: async ({ request }, use) => {
    const token = readToken();
    await use(new ApiClient(request, token));
  },

  // domain-specific users client
  usersApi: async ({ request }, use) => {
    const token = readToken();
    await use(new UsersApi(request, token));
  },

  // domain-specific products client
  productsApi: async ({ request }, use) => {
    const token = readToken();
    await use(new ProductsApi(request, token));
  },

});

export { expect } from '@playwright/test';
