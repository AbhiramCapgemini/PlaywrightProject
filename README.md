# Playwright API Test Suite — DummyJSON

API test suite built with Playwright targeting the [DummyJSON](https://dummyjson.com) API. Covers Users and Products modules with 22 tests across authentication, CRUD, pagination, schema validation, and performance.

---

## Project Structure

```
├── tests/api/
│   ├── users.spec.ts        # 11 tests — Users module
│   └── products.spec.ts     # 11 tests — Products module
├── utils/
│   ├── apiClient.ts         # ApiClient (base), UsersApi, ProductsApi
│   ├── config.ts            # Centralized test constants + env vars
│   ├── dataFactory.ts       # Generates unique test data
│   └── schema.ts            # assertUserSchema, assertProductSchema
├── fixtures/
│   └── fixture.ts           # api, usersApi, productsApi fixtures
├── .github/workflows/
│   └── ci.yml               # GitHub Actions CI pipeline
├── global-setup.ts          # Health check + login → saves auth.json
├── playwright.config.ts
├── kill-port.js             # Kills port 9323 before test run
└── .env                     # Sensitive values only (not committed)
```

---

## Setup

**Prerequisites:** Node.js 20+

```bash
npm install
npx playwright install --with-deps
```

Create a `.env` file in the project root:

```env
BASE_URL=https://dummyjson.com
AUTH_USERNAME=emilys
AUTH_PASSWORD=emilyspass
```

---

## Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all 22 tests |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:regression` | Tests tagged `@regression` |
| `npm run test:api` | Tests tagged `@api` |
| `npm run report` | Open HTML report |

> `pretest` automatically kills any leftover process on port 9323 before each run.

---

## Test Coverage

**Users Module** (`users.spec.ts`)
- GET user by ID, list users, search users
- POST create user, PUT update user, DELETE user
- GET /auth/me (authenticated request)
- 404 handling for invalid user ID

**Products Module** (`products.spec.ts`)
- List products with pagination
- GET product by ID, search products
- Filter by category, list categories
- Schema validation, performance budget (< 3000ms)
- POST create product
- 404 handling for invalid product ID

---

## Configuration

All test constants live in `utils/config.ts`. Only sensitive/environment-specific values go in `.env`:

| Source | Values |
|---|---|
| `.env` | `BASE_URL`, `AUTH_USERNAME`, `AUTH_PASSWORD` |
| `utils/config.ts` | IDs, search queries, pagination, perf budget |

---

## CI — GitHub Actions

The pipeline runs on push and pull requests to `main`/`master`.

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `BASE_URL` | API base URL |
| `AUTH_USERNAME` | Login username |
| `AUTH_PASSWORD` | Login password |

On each run the pipeline installs dependencies, runs all tests, and uploads the HTML/JSON/JUnit report as an artifact (retained 7 days).

---

## Architecture

- `ApiClient` — base class handling HTTP requests with Bearer token auto-attached from `auth.json`
- `UsersApi` / `ProductsApi` — extend `ApiClient` with domain-specific methods
- `global-setup.ts` — runs once before all tests; performs health check and login, writes tokens to `auth.json`
- `dataFactory` — generates unique payloads using `Date.now()` to avoid conflicts across runs
