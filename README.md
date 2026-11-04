# Islamic Guidance Platform

A web platform for Islamic guidance where users can ask questions and scholars can provide reviewed answers.

This project is currently in active development and represents the foundation of a role-based Q&A platform for Islamic knowledge, with the backend, database model, authentication flow, and frontend interface already in place.

## Project status

This repository currently includes:

- a Node.js + Express backend
- PostgreSQL database access via Prisma
- user authentication and authorization foundation
- question and answer data models
- a React + Vite frontend
- protected routing and login/session handling
- a design system foundation for the user interface

## What has been built so far

### Backend foundation

The backend is structured around Express and Prisma and includes:

- app configuration and middleware setup
- health and DB ping routes
- authentication routes and services
- question-related services and routes
- scholar-related route/service layer
- EJS page rendering support for server-side screens

### Database model

The Prisma schema defines the core domain model for the platform:

- User model with roles: USER, SCHOLAR, ADMIN
- Question model with lifecycle states such as PENDING, UNDER_REVIEW, NEEDS_CLARIFICATION, ANSWERED, CLOSED
- Answer model linked to a question and scholar
- relations between authors, scholars, and answers

This gives the system the foundation for a moderated Islamic Q&A workflow.

### Authentication system

The platform includes a working auth foundation with:

- user registration
- password hashing using bcrypt
- login validation
- disabled-account handling
- JWT-based authentication support
- session restoration on frontend reload
- route protection for authenticated screens

### Frontend application

The frontend is built with React 19 and Vite, and includes:

- app router and page structure
- public login and register pages
- protected dashboard route
- navbar layout and shell
- API client with centralized auth token handling
- design system components for buttons, cards, inputs, badges, alerts, and spinners

### Current milestone

The current milestone focuses on the platform foundation and early user flow:

- project split into backend and frontend folders
- backend API and database design
- auth experience in frontend
- protected route handling
- initial UI design system

This stage is a strong base for the next set of product features.

## Tech stack

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- CORS
- dotenv

### Frontend

- React
- Vite
- React Router
- Tailwind CSS

## Project structure

```text
islamic-guidance-platform/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── .git/
```

## How to run locally

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Important notes

- The project is not yet a fully complete production-ready platform.
- The current work is focused on architecture, auth, and foundational app flows.
- The next expected phases include question submission, scholar review flow, answer publishing, and richer user dashboards.

## Next planned work

The next development steps are expected to include:

- question submission page for users
- personal question dashboard
- scholar review queue
- answer publishing flow
- question status management
- improved admin and moderation features
- deployment configuration

## Summary

This project has reached a solid foundation stage: backend structure, database schema, authentication layer, frontend shell, and initial design system are all in place. The platform is ready for the next phase of product features and more complete user workflows.

---

This README reflects the project state as of November 2026 and is intended to help collaborators understand the current progress and architecture of the platform.
