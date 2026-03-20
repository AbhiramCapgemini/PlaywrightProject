import { test as base } from '@playwright/test';
import { ApiClient, UsersApi, ProductsApi } from '../utils/apiClient';

type Fixtures = {
  api:         ApiClient;
  usersApi:    UsersApi;
  productsApi: ProductsApi;
};

export const test = base.extend<Fixtures>({

  // base client — generic HTTP methods
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  // domain-specific users client
  usersApi: async ({ request }, use) => {
    await use(new UsersApi(request));
  },

  // domain-specific products client
  productsApi: async ({ request }, use) => {
    await use(new ProductsApi(request));
  },

});

export { expect } from '@playwright/test';
