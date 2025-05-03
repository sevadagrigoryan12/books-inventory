# Kyra Books Inventory System

Book inventory and management system built with Node.js, TypeScript, Express.js, and PostgreSQL.

## Features

- Book inventory management
- User book borrowing and buying
- Wallet management with transaction history
- Email notifications for low stock and wallet milestones
- RESTful API endpoints
- TypeScript support
- PostgreSQL database with Prisma ORM
- Comprehensive test coverage

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sevadagrigoryan12/books-inventory.git
cd books-inventory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kyra_books"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"
SMTP_FROM="noreply@example.com"
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Seed the database with initial books:
```bash
npm run seed
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Start the production server:
```bash
npm start
```

## Running Tests

```bash
npm test
```

## API Documentation

### Books

- `GET /api/books` - Search books
- `GET /api/books/:id` - Get book details
- `GET /api/books/:id/actions` - Get book actions
- `POST /api/books/:id/borrow` - Borrow a book
- `POST /api/books/:id/return` - Return a book
- `POST /api/books/:id/buy` - Buy a book

### Wallet

- `GET /api/wallet` - Get wallet balance
- `GET /api/wallet/movements` - Get wallet movements

### Users

- `GET /api/users/:email/books` - Get user's books


## Docker Support

The application can be run using Docker:

1. Build the Docker image:
```bash
docker build -t kyra-books-inventory .
```

2. Run the container:
```bash
docker run -p 3000:3000 kyra-books-inventory
```