# Elite Wholesalers API

Backend API for the Elite Wholesalers commerce platform, built with NestJS, TypeORM, and PostgreSQL.

## Setup

```bash
npm install
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
