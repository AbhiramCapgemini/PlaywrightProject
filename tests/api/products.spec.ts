import { test, expect } from '../../fixtures/fixture';
import { dataFactory } from '../../utils/dataFactory';
import { assertProductSchema } from '../../utils/schema';
import { config } from '../../utils/config';

const { validProductId, invalidProductId, productCategory, productSearch, perfBudgetMs, pagination } = config;

//PRODUCTS MODULE---------------------------------------------------------------------

test.describe('Products Module', () => {

//lifecycle hooks---------------------------------------------------------------------
  test.beforeAll(() => { console.log('Products suite starting'); });
  test.afterAll(()  => { console.log('Products suite complete'); });

  //GET + status + headers + JSON fields-----------------------------------------------
  test('@smoke @api GET /products — returns product list', async ({ productsApi }) => {
    const res = await productsApi.listProducts();
    
  //status + ok-------------------------------------------------------------------------
    expect(res.status()).toBe(200);
    expect(res.ok()).toBeTruthy();

  //headers -----------------------------------------------------------------------------
    expect(res.headers()['content-type']).toContain('application/json');

  //deep JSON assertion -----------------------------------------------------------------
    const body = await productsApi.json<{ products: unknown[]; total: number }>(res);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
    expect(typeof body.total).toBe('number');
  });

  //query params: pagination---------------------------------------------------------------
  test('@regression @api GET /products — pagination limit & skip', async ({ productsApi }) => {
    const res = await productsApi.listProducts(pagination);
    expect(res.status()).toBe(200);

    const body = await productsApi.json<{ products: unknown[]; limit: number; skip: number }>(res);
    expect(body.products).toHaveLength(pagination.limit);
    expect(body.limit).toBe(pagination.limit);
    expect(body.skip).toBe(pagination.skip);
  });

  //filter by category---------------------------------------------------------------------
  test('@regression @api GET /products/category — filters by category', async ({ productsApi }) => {
    const res = await productsApi.listByCategory(productCategory);
    expect(res.status()).toBe(200);

    const body = await productsApi.json<{ products: Array<Record<string, unknown>> }>(res);
    expect(body.products.length).toBeGreaterThan(0);
    for (const p of body.products) {
      expect(String(p['category']).toLowerCase()).toBe(productCategory);
    }
  });

  //GET by ID + schema assertion------------------------------------------------------------
  test('@smoke @api GET /products/1 — returns correct product', async ({ productsApi }) => {
    const res = await productsApi.getProduct(validProductId);
    expect(res.status()).toBe(200);

    const product = await productsApi.json<Record<string, unknown>>(res);
    assertProductSchema(product);
    expect(product['id']).toBe(validProductId);
  });

  //exhaustive schema validation with toMatchObject + arrayContaining-----------------------
  test('@regression @api GET /products/1 — full schema validation', async ({ productsApi }) => {
    const res = await productsApi.getProduct(validProductId);
    const p   = await productsApi.json<Record<string, unknown>>(res);

  //toMatchObject with expect.any()---------------------------------------------------------
    expect(p).toMatchObject({
      id:                 expect.any(Number),
      title:              expect.any(String),
      price:              expect.any(Number),
      stock:              expect.any(Number),
      category:           expect.any(String),
      description:        expect.any(String),
      discountPercentage: expect.any(Number),
      rating:             expect.any(Number),
      thumbnail:          expect.any(String),
    });

  //arrayContaining-------------------------------------------------------------------------
    expect(p['images']).toEqual(expect.arrayContaining([expect.any(String)]));

    assertProductSchema(p);
  });

  //performance budget----------------------------------------------------------------------
  test(`@smoke @api GET /products — responds within ${perfBudgetMs}ms`, async ({ productsApi }) => {
    const start   = Date.now();
    const res     = await productsApi.listProducts(pagination);
    const elapsed = Date.now() - start;

    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(perfBudgetMs);
  });

  test(`@smoke @api GET /products/1 — responds within ${perfBudgetMs}ms`, async ({ productsApi }) => {
    const start   = Date.now();
    const res     = await productsApi.getProduct(validProductId);
    const elapsed = Date.now() - start;

    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(perfBudgetMs);
  });

  //search with query params----------------------------------------------------------------
  test('@regression @api GET /products/search — returns matching results', async ({ productsApi }) => {
    const res = await productsApi.searchProducts(productSearch);
    expect(res.status()).toBe(200);

    const body = await productsApi.json<{ products: Array<Record<string, unknown>> }>(res);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  //negative: invalid ID → 404----------------------------------------------------------------

  test('@regression @api GET /products/99999 — returns 404', async ({ productsApi }) => {
    const res = await productsApi.getProduct(invalidProductId);
    expect(res.status()).toBe(404);

    const body = await productsApi.json<Record<string, unknown>>(res);
    expect(typeof body['message']).toBe('string');
  });

  //GET categories list-----------------------------------------------------------------------
  test('@regression @api GET /products/categories — returns array of categories', async ({ productsApi }) => {
    const res = await productsApi.listCategories();
    expect(res.status()).toBe(200);

    const categories = await productsApi.json<unknown[]>(res);
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  //POST + toMatchObject + chaining (Create → Get)-------------------------------------------

  test('@smoke @api POST /products/add — creates a new product', async ({ productsApi }) => {
    const payload = dataFactory.product();

    //  POST
    const createRes = await productsApi.createProduct(payload);
    expect(createRes.status()).toBe(201);

    const product = await productsApi.json<Record<string, unknown>>(createRes);
    expect(typeof product['id']).toBe('number');

    //  toMatchObject
    expect(product).toMatchObject({
      title: payload.title,
      price: payload.price,
    });

  //expect.poll — keep retrying until product is reflected----------------------------------
    await expect.poll(async () => {
      const res = await productsApi.getProduct(product['id'] as number);
      return res.status();
    }).toBe(404);
  });

});
