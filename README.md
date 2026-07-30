# My NestJS API

A RESTful API built with NestJS, TypeORM, and PostgreSQL for managing users, products, and orders.

## Tech Stack

- **NestJS** v11 — Node.js framework
- **TypeORM** v0.3 — ORM for PostgreSQL
- **PostgreSQL** — Database
- **class-validator** / **class-transformer** — Request validation
- **Jest** — Unit & E2E testing

## Project Structure

```
src/
├── users/        # User CRUD (name, email)
├── products/     # Product CRUD (name, description, price)
├── orders/       # Order CRUD with OrderItems
├── auth/         # Authentication module
└── main.ts       # Application entry point
```

## Database Schema

- **User** — `id`, `name`, `email` (unique)
- **Product** — `id`, `name`, `description`, `price`
- **Order** — `id`, `userId`, `status` (enum: PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED), `totalAmount`
- **OrderItem** — `id`, `orderId`, `productId`, `quantity`, `price`

### Relationships

- User → Orders (one-to-many)
- Order → OrderItems (one-to-many, cascade)
- Product → OrderItems (one-to-many)

## Setup

### Prerequisites

- Node.js v20+
- PostgreSQL
- pnpm

### Installation

```bash
pnpm install
```

### Database

Create the PostgreSQL database:

```bash
createdb nestjs_db
```

Configure connection in `src/app.module.ts` via environment variables:

| Variable | Default |
|----------|---------|
| `DB_HOST` | localhost |
| `DB_PORT` | 5432 |
| `DB_USERNAME` | durgesh.tambe |
| `DB_PASSWORD` | (empty) |
| `DB_NAME` | nestjs_db |

The app uses `synchronize: true` so tables are auto-created on startup.

## Running the App

```bash
# development (watch mode)
pnpm start:dev

# production build
pnpm build
pnpm start:prod
```

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create user |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order (auto-fetches product prices) |
| GET | `/orders` | Get all orders with relations |
| GET | `/orders/:id` | Get order by ID with relations |
| PATCH | `/orders/:id` | Update order |
| PATCH | `/orders/:id/status` | Update order status |
| DELETE | `/orders/:id` | Delete order |

#### Create Order Example

```json
POST /orders
{
  "userId": 1,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

Product prices are fetched from the database and `totalAmount` is auto-calculated.

## Testing

```bash
# unit tests
pnpm test

# e2e tests (uses nestjs_test_db, cleaned up after run)
pnpm test:e2e

# test coverage
pnpm test:cov
```

E2E tests use a dedicated `nestjs_test_db` database. Create it before running:

```bash
createdb nestjs_test_db
```

## License

UNLICENSED

## Stay in touch

- Author - [Durgesh Tambe](https://www.linkedin.com/in/durgesh-tambe-b7aba380/)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
