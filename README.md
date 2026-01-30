# Free Concert Tickets - Backend (NestJS)

This is the backend service for the **Free Concert Tickets** concert reservation system, built as part of a Full-Stack Developer assignment. It provides a RESTful API for managing concerts and user reservations.

## 🏗 Architecture Overview

The application follows the **NestJS** standard architectural pattern:

- **Controller Layer:** Handles incoming HTTP requests and routes them to the appropriate service.
- **Service Layer:** Contains the business logic, specifically enforcing rules like "1 seat per 1 user" and checking "Seat total" availability.
- **Data Access Layer (Repository Pattern):** Uses **TypeORM** to interact with a **SQLite** database.
- **DTOs & Validation:** Uses `class-validator` to ensure data integrity and provide clear error responses (Task 4).

## 🛠 Libraries & Dependencies

The following key packages were used in this project:

- **@nestjs/typeorm & typeorm:** For Object-Relational Mapping to manage database entities.
- **sqlite3:** A lightweight, zero-configuration database engine used for the demo.
- **class-validator & class-transformer:** To implement server-side validation and handle Task 4 requirements.
- **@nestjs/testing:** For writing unit tests to ensure CRUD operation correctness.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:

   ```bash
   cd free-concert-tickets-be
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Running the App

The database is configured to use **SQLite**. The database file will be **automatically created** upon starting the server for the first time.

```bash
# development
npm run start

# watch mode (recommended for development)
npm run start:dev
```

The server will be available at `http://localhost:3000`.

## 🧪 Running Unit Tests

As required by Task 5, unit tests are provided for the CRUD operation handlers and business logic.

```bash
npm run test
```

## 📡 API Endpoints

### Concerts (Admin)

- `POST /concerts` - Create a new concert (Name, Description, Total Seats)
- `DELETE /concerts/:id` - Remove a concert
- `GET /concerts` - View all concerts (Available for Users)

### Reservations (User)

- `POST /reservations` - Reserve a seat (Limit: 1 per user)
- `GET /reservations?userId={id}` - View own reservation history
- `GET /reservations` - View all reservation history (Admin)
- `DELETE /reservations/:id` - Cancel a reservation

## 🛡 Error Handling

This project implements robust server-side validation. If a request is missing required fields (like concert name or user ID), the server returns a `400 Bad Request` with a descriptive message.