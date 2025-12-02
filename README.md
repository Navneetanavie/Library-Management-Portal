# Library Management System

A full-stack application for managing books, authors, users, and book borrowing operations with JWT authentication.

## Tech Stack

- **Backend**: NestJS (TypeScript)
- **Frontend**: React.js (TypeScript) with Vite
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: REST

## Project Structure

```
Assignment_ONI/
├── server/          # NestJS backend
│   ├── src/
│   │   ├── auth/    # Authentication module (JWT)
│   │   ├── users/    # User CRUD
│   │   ├── authors/  # Author CRUD
│   │   ├── books/    # Book CRUD with filters
│   │   ├── borrow/   # Borrowing operations
│   │   └── prisma/   # Prisma service
│   └── prisma/       # Prisma schema and migrations
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Page components
│       ├── contexts/ # Auth context
│       └── lib/      # API client
└── docker-compose.yml
```

## Database Schema

### Models

- **User**: `id`, `email` (unique), `name`, `passwordHash`, `createdAt`
- **Author**: `id`, `name`, `bio` (optional), `createdAt`
- **Book**: `id`, `title`, `description` (optional), `publishedYear` (optional), `authorId`, `createdAt`
- **BorrowRecord**: `id`, `userId`, `bookId`, `borrowedAt`, `returnedAt` (nullable)

### Relationships

- User → BorrowRecord (one-to-many)
- Author → Book (one-to-many)
- Book → BorrowRecord (one-to-many)

A book is considered "borrowed" when it has a `BorrowRecord` with `returnedAt = null`.

## API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication

- `POST /auth/register` - Register new user
  ```json
  { "email": "user@example.com", "name": "John Doe", "password": "password123" }
  ```
  Returns: `{ accessToken, user }`

- `POST /auth/login` - Login
  ```json
  { "email": "user@example.com", "password": "password123" }
  ```
  Returns: `{ accessToken, user }`

### Books (Protected)

- `GET /books?authorId=&isBorrowed=true|false` - List books with optional filters
- `GET /books/:id` - Get book by ID
- `POST /books` - Create book (requires auth)
  ```json
  { "title": "Book Title", "description": "...", "authorId": "...", "publishedYear": 2024 }
  ```
- `PATCH /books/:id` - Update book (requires auth)
- `DELETE /books/:id` - Delete book (requires auth)

### Authors (Protected)

- `GET /authors` - List all authors (public)
- `GET /authors/:id` - Get author by ID (public)
- `POST /authors` - Create author (requires auth)
  ```json
  { "name": "Author Name", "bio": "..." }
  ```
- `PATCH /authors/:id` - Update author (requires auth)
- `DELETE /authors/:id` - Delete author (requires auth)

### Users (Protected)

- `GET /users` - List all users (requires auth)
- `POST /users` - Create user (requires auth)
  ```json
  { "email": "user@example.com", "name": "John Doe", "password": "password123" }
  ```

### Borrowing (Protected)

- `POST /borrow` - Mark book as borrowed
  ```json
  { "userId": "...", "bookId": "..." }
  ```
- `POST /borrow/:id/return` - Return a borrowed book
- `GET /users/:id/borrowed?active=true|false` - List borrowed books for a user

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

## Setup & Running

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker Compose)
- npm or yarn

### Local Development

#### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db
# JWT_SECRET=your-strong-jwt-secret
# PORT=3000
# FRONTEND_URL=http://localhost:5173

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

Backend runs on `http://localhost:3000`

#### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# VITE_API_BASE_URL=http://localhost:3000/api

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### Docker Setup

```bash
# Build and start all services (postgres, server, client)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

Services:
- **PostgreSQL**: `localhost:5432`
- **Backend API**: `http://localhost:3000/api`
- **Frontend**: `http://localhost:5173`

## Frontend Features

### Pages

1. **Login/Register** (`/login`)
   - Toggle between login and register
   - JWT token stored in localStorage
   - Auto-redirect to `/books` on success

2. **Books** (`/books`)
   - List all books with author info and borrow status
   - Filters: by author, by borrowed status (all/borrowed/available)
   - CRUD operations (create, edit, delete)
   - Borrow/Return actions

3. **Authors** (`/authors`)
   - List all authors
   - CRUD operations (create, edit, delete)

4. **Users** (`/users`)
   - List all users
   - Create new users
   - Link to view user's borrowed books

5. **User Borrowed Books** (`/users/:id/borrowed`)
   - View all borrowed books for a specific user
   - Filter: active only or all history
   - Return borrowed books

### Authentication Flow

1. User registers/logs in via `/login`
2. JWT token stored in `localStorage`
3. Token automatically attached to all API requests via axios interceptor
4. Protected routes redirect to `/login` if not authenticated
5. 401 responses trigger automatic logout and redirect

## Environment Variables

### Server (`server/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db
JWT_SECRET=your-strong-jwt-secret-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development Notes

### Prisma Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

### API Testing

You can test the API using:
- Postman/Insomnia
- curl commands
- The React frontend

Example curl for login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Example curl for protected endpoint:
```bash
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer <your-token>"
```

## Architecture Decisions

1. **Prisma ORM**: Type-safe database access with migrations
2. **JWT Authentication**: Stateless auth suitable for REST APIs
3. **REST API**: Simple, standard API design
4. **React Context**: Global auth state management
5. **Axios Interceptors**: Automatic token attachment and 401 handling
6. **Protected Routes**: Route-level authentication checks

## License

MIT

