import { expect } from '@playwright/test';

//---UserSchema---------------------------------------------------
export function assertUserSchema(user: Record<string, unknown>) {
  expect(typeof user['id']).toBe('number');
  expect(typeof user['firstName']).toBe('string');
  expect(typeof user['lastName']).toBe('string');
  expect(typeof user['email']).toBe('string');
  expect(typeof user['username']).toBe('string');
}

//---ProductSchema---------------------------------------------------
export function assertProductSchema(p: Record<string, unknown>) {
  expect(typeof p['id']).toBe('number');
  expect(typeof p['title']).toBe('string');
  expect(typeof p['price']).toBe('number');
  expect(typeof p['stock']).toBe('number');
  expect(typeof p['category']).toBe('string');
}
