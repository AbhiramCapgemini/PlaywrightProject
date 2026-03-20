import type { APIRequestContext, APIResponse } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '..', 'auth.json');

function getAccessToken(): string {
  if (fs.existsSync(AUTH_FILE)) {
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8')) as { accessToken: string };
    return auth.accessToken;
  }
  return '';
}

// Base ApiClient — generic HTTP methods with auto Bearer token---------------

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  private headers(): Record<string, string> {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  get(url: string, params?: Record<string, string | number>) {
    return this.request.get(url, { params, headers: this.headers() });
  }

  post(url: string, body: unknown) {
    return this.request.post(url, { data: body, headers: this.headers() });
  }

  put(url: string, body: unknown) {
    return this.request.put(url, { data: body, headers: this.headers() });
  }

  patch(url: string, body: unknown) {
    return this.request.patch(url, { data: body, headers: this.headers() });
  }

  delete(url: string) {
    return this.request.delete(url, { headers: this.headers() });
  }

  async json<T>(res: APIResponse): Promise<T> {
    return res.json() as Promise<T>;
  }
}

// UsersApi — domain-specific methods for /users endpoints------------------

export class UsersApi extends ApiClient {

  getUser(id: number) {
    return this.get(`/users/${id}`);
  }

  listUsers(params?: Record<string, string | number>) {
    return this.get('/users', params);
  }

  searchUsers(query: string) {
    return this.get('/users/search', { q: query });
  }

  createUser(data: object) {
    return this.post('/users/add', data);
  }

  updateUser(id: number, data: object) {
    return this.put(`/users/${id}`, data);
  }

  deleteUser(id: number) {
    return this.delete(`/users/${id}`);
  }

  getMe() {
    return this.get('/auth/me');
  }
}

// ProductsApi — domain-specific methods for /products endpoints-------------

export class ProductsApi extends ApiClient {

  listProducts(params?: Record<string, string | number>) {
    return this.get('/products', params);
  }

  getProduct(id: number) {
    return this.get(`/products/${id}`);
  }

  searchProducts(query: string) {
    return this.get('/products/search', { q: query });
  }

  listByCategory(category: string) {
    return this.get(`/products/category/${category}`);
  }

  listCategories() {
    return this.get('/products/categories');
  }

  createProduct(data: object) {
    return this.post('/products/add', data);
  }

  updateProduct(id: number, data: object) {
    return this.put(`/products/${id}`, data);
  }

  deleteProduct(id: number) {
    return this.delete(`/products/${id}`);
  }
}
