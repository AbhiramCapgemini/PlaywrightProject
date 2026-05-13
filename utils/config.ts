import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // --- from .env (environment specific) -------------------------------------
  baseURL:      process.env['BASE_URL']       ?? 'https://dummyjson.com',
  authUsername: process.env['AUTH_USERNAME']  ?? 'emilys',
  authPassword: process.env['AUTH_PASSWORD']  ?? 'emilyspass',

  // --- test constants (fixed values) ----------------------------------------
  validUserId:      1,
  invalidUserId:    99999,
  userSearchQuery:  'John',
  userPagination:   { limit: 5, skip: 0 },

  validProductId:   1,
  invalidProductId: 99999,
  productCategory:  'smartphones',
  productSearch:    'phone',
  perfBudgetMs:     3000,
  pagination:       { limit: 5, skip: 10 },
};
