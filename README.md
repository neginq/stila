# Stila — Personal Style & Outfit Recommendation System

Stila is a web-based personal style and outfit recommendation system developed as a Bachelor's Project in Computer Engineering at Shahid Beheshti University.

The system provides personalized outfit recommendations based on the user's style profile and the context of the current request. Instead of relying on machine learning models, Stila uses a deterministic rule-based recommendation engine that applies filtering, scoring, outfit assembly, color selection, and compatibility evaluation to generate suitable outfit suggestions.

## Features

- User registration and authentication
- Personal style profile creation and editing
- Profile-based preferences, including:
  - Gender
  - Age group
  - Skin tone and undertone
  - Body shape
  - Favorite styles
  - Preferred color palettes
  - Disliked colors
- Contextual outfit questionnaire
- Rule-based outfit recommendation engine
- Clothing item filtering and scoring
- Outfit compatibility evaluation
- Color-family selection
- Multiple ranked outfit recommendations
- Recommendation explanations
- Recommendation history
- Protected user routes
- Persistent user and recommendation data

## System Architecture

Stila follows a client-server architecture consisting of a frontend, backend, recommendation engine, and PostgreSQL database.

### Frontend

The frontend provides the user interface for authentication, profile management, questionnaire completion, and recommendation presentation.

**Main technologies:**

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

The backend provides authentication, profile management, recommendation APIs, recommendation history, and communication with the database.

**Main technologies:**

- Node.js
- Express.js
- TypeScript
- Prisma ORM

### Database

PostgreSQL is used to store:

- User accounts
- Style profiles
- Clothing catalog items
- Recommendation requests
- Generated outfits
- Recommendation history

## Recommendation Engine

The core of Stila is a deterministic rule-based recommendation engine.

The general recommendation flow is:

1. Receive the user's style profile and current request.
2. Build the recommendation context.
3. Select the appropriate clothing catalog.
4. Apply eligibility filters and constraints.
5. Score candidate clothing items according to user preferences and request context.
6. Assemble candidate outfits using predefined outfit templates.
7. Assign suitable color families.
8. Evaluate outfit compatibility.
9. Rank the generated candidates.
10. Return the final outfit recommendations with explanations.

The main implementation is located in:

```text
backend/src/rule-engine/
```

The engine is divided into modules responsible for context construction, filtering, scoring, weighting, color handling, outfit assembly, templates, compatibility evaluation, and final recommendation generation.

## Repository Structure

```text
stila/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── public/
│   ├── types/
│   └── utils/
│
├── backend/
│   ├── prisma/
│   ├── scripts/
│   └── src/
│       ├── data_access/
│       ├── rule-engine/
│       ├── swagger/
│       └── utils/
│
└── README.md
```

## Running the Project

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL

A PostgreSQL database must also be created before starting the backend.

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory and configure the required environment variables:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database>?schema=<schema>"
PORT=<backend_port>
JWT_SECRET=<your_secret>
```

Apply the database migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Seed the clothing catalog:

```bash
npm run db:seed
```

Start the backend development server:

```bash
npm run dev
```

### 2. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Then open the local address displayed by Next.js in your browser.

> The frontend API configuration must point to the port used by the backend.

## API Documentation

The backend includes Swagger/OpenAPI documentation.

When the backend is running, the API documentation is available through the `/docs` route on the configured backend server.

The API includes functionality for:

- Authentication
- User profile management
- Outfit recommendation generation
- Recommendation history

## Database and Clothing Catalog

The database schema is defined in:

```text
backend/prisma/schema.prisma
```

Database migrations are stored in:

```text
backend/prisma/migrations/
```

The clothing catalog seed data is located in:

```text
backend/prisma/seed-data/
```

The seed process uses clothing item slugs for upsert operations, allowing the catalog to be seeded repeatedly without creating duplicate entries.

## Project Scope

Stila was designed as an end-to-end personal styling system that combines user profile information, contextual preferences, a structured clothing catalog, and a deterministic rule-based recommendation process.

The project focuses on transparent and reproducible recommendation logic rather than machine-learning-based prediction.

## Author

**Negin Ghorbani**  
Bachelor's Project — Computer Engineering  
Shahid Beheshti University
