# Elite Wholesalers API

Backend API for the Elite Wholesalers commerce platform, built with NestJS, TypeORM, and PostgreSQL.

## Setup

```bash
npm install
```

Create a `.env` file with the database, authentication, email, and frontend configuration required by the application. The branding-related values can be overridden with:

```env
ELITE_WHOLESALERS_URL=https://elitewholesalers.com
SUPPORT_URL=https://elitewholesalers.com/support
DOCUMENTATION_IMAGE_URL=https://elitewholesalers.com/og-image.png
EMAIL_FROM="Elite Wholesalers <support@elitewholesalers.com>"
```

## Run

```bash
npm run start:dev
```

The API uses the `/api` global prefix. Product catalog routes are available under `/api/products`; cart, wishlist, and order routes require authentication.

## Test

```bash
npm test
npm run test:e2e
npm run test:cov
```

## Build

```bash
npm run build
npm run start:prod
```
