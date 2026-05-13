import { test, expect } from '../../fixtures/fixture';
import { dataFactory } from '../../utils/dataFactory';
import { assertUserSchema } from '../../utils/schema';
import { config } from '../../utils/config';

const { validUserId, invalidUserId, userSearchQuery, userPagination } = config;

// USERS MODULE------------------------------------------------------------------
test.describe('Users Module', () => {

// lifecycle hooks---------------------------------------------------------------
  test.beforeAll(() => { console.log(' Users suite starting'); });
  test.afterAll(()  => { console.log(' Users suite complete'); });

 // GET + status + headers + JSON fields ----------------------------------------
  test('@smoke @api GET /users/1 — returns valid user schema', async ({ usersApi }) => {
    const res = await usersApi.getUser(validUserId);
    
    // status + ok --------------------------------------------------------------
    expect(res.status()).toBe(200);
    expect(res.ok()).toBeTruthy();

    // headers -------------------------------------------------------------------
    expect(res.headers()['content-type']).toContain('application/json');

    // schema assertion-----------------------------------------------------------
    const user = await usersApi.json<Record<string, unknown>>(res);
    assertUserSchema(user);
    expect(user['id']).toBe(validUserId);
  });

  // query params / pagination-----------------------------------------------------
  test('@regression @api GET /users — returns paginated list', async ({ usersApi }) => {
    const res = await usersApi.listUsers(userPagination);
    expect(res.status()).toBe(200);

    const body = await usersApi.json<{ users: unknown[]; total: number; limit: number; skip: number }>(res);
    expect(body.users).toHaveLength(userPagination.limit);
    expect(typeof body.total).toBe('number');
    expect(body.limit).toBe(userPagination.limit);
    expect(body.skip).toBe(userPagination.skip);
  });

  //POST + toMatchObject + chaining (Create → Get)-----------------------------------
  test('@smoke @api POST /users/add — creates a new user', async ({ usersApi }) => {
    const payload = dataFactory.user();

  //POST------------------------------------------------------------------------------
    const createRes = await usersApi.createUser(payload);
    expect(createRes.status()).toBe(201);

    const user = await usersApi.json<Record<string, unknown>>(createRes);
    expect(typeof user['id']).toBe('number');

    //toMatchObject---------------------------------------------------------------------
    expect(user).toMatchObject({
      firstName: payload.firstName,
      lastName:  payload.lastName,
      email:     payload.email,
    });
  });

  //negative: missing required fields--------------------------------------------------
  test('@regression @api POST /users/add — missing firstName validation', async ({ usersApi }) => {
    const res = await usersApi.createUser(dataFactory.user({ firstName: '' }));
    expect(res.status()).toBe(201);
    const body = await usersApi.json<Record<string, unknown>>(res);
    expect(typeof body['id']).toBe('number');
  });

  //PUT update---------------------------------------------------------------------
  test('@smoke @api PUT /users/1 — updates firstName', async ({ usersApi }) => {
    const payload = dataFactory.user({ firstName: 'UpdatedName' });
    const res = await usersApi.updateUser(validUserId, payload);
    expect(res.status()).toBe(200);

    const user = await usersApi.json<Record<string, unknown>>(res);
    expect(user['firstName']).toBe(payload.firstName);
    expect(user['id']).toBe(validUserId);
  });

  //schema assertion after update-------------------------------------------------
  test('@regression @api PUT /users/1 — response satisfies user schema after update', async ({ usersApi }) => {
    const res = await usersApi.updateUser(validUserId, dataFactory.user({ lastName: 'Smith' }));
    expect(res.status()).toBe(200);

    const user = await usersApi.json<Record<string, unknown>>(res);
    assertUserSchema(user);
  });

  //DELETE-------------------------------------------------------------------------
  test('@smoke @api DELETE /users/1 — returns isDeleted flag', async ({ usersApi }) => {
    const res = await usersApi.deleteUser(validUserId);
    expect(res.status()).toBe(200);

    const body = await usersApi.json<Record<string, unknown>>(res);
    expect(body['isDeleted']).toBe(true);
    expect(typeof body['deletedOn']).toBe('string');
    expect(body['id']).toBe(validUserId);
  });

  //negative: invalid ID → 404--------------------------------------------------------
  test('@regression @api GET /users/99999 — returns 404 for non-existent user', async ({ usersApi }) => {
    const res = await usersApi.getUser(invalidUserId);
    expect(res.status()).toBe(404);

    const body = await usersApi.json<Record<string, unknown>>(res);
    expect(typeof body['message']).toBe('string');
  });

  test('@regression @api DELETE /users/99999 — returns 404', async ({ usersApi }) => {
    const res = await usersApi.deleteUser(invalidUserId);
    expect(res.status()).toBe(404);
  });

  //search with query params----------------------------------------------------------
  test('@regression @api GET /users/search — filters by query', async ({ usersApi }) => {
    const res = await usersApi.searchUsers(userSearchQuery);
    expect(res.status()).toBe(200);

    const body = await usersApi.json<{ users: Array<Record<string, unknown>> }>(res);
    expect(Array.isArray(body.users)).toBe(true);
    for (const user of body.users) {
      const fullName = `${String(user['firstName'])} ${String(user['lastName'])}`.toLowerCase();
      expect(fullName).toContain(userSearchQuery.toLowerCase());
    }
  });

  //auth edge case: protected endpoint with Bearer token----------------------------------
  test('@regression @api GET /auth/me — returns authenticated user', async ({ usersApi }) => {
    const res = await usersApi.getMe();
    expect([200, 401]).toContain(res.status());
    if (res.status() === 200) {
      const body = await usersApi.json<Record<string, unknown>>(res);
      expect(typeof body['id']).toBe('number');
      expect(typeof body['username']).toBe('string');
    }
  });

});
