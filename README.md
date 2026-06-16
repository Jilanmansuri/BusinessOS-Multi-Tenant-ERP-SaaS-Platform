# 🏢 BusinessOS: Multi-Tenant ERP SaaS Platform

A modern, high-performance, and feature-rich multi-tenant Enterprise Resource Planning (ERP) Software-as-a-Service (SaaS) platform built to handle employee management, client tracking, sales, invoicing, expenses, task orchestration, and intelligent business analysis.

---

## ⚡ Features

### Core ERP Modules
1. **Multi-Tenant Architecture**: Robust tenant Isolation allowing multiple organizations to run on the same platform with separate data security.
2. **HR & Employee Management**: Organize employees, assign departments, and track roles.
3. **CRM / Customer Management**: Lifecycle tracking and management of clients.
4. **Sales & Orders**: Product catalogs, categories, and client billing/order lifecycle.
5. **Expense Tracking**: Real-time spending reports categorized for tax and audit purposes.
6. **Task Orchestration**: Visual board/list for collaborative task management and assignment.
7. **Gemini AI Business Assistant**: On-demand AI analysis of sales performance, expense trends, and productivity recommendations.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([ERP Users / Admin]) -->|HTTPS| Frontend[React + Vite Frontend]
    Frontend -->|REST APIs + JWT| Backend[Express.js API Server]
    Backend -->|Database Queries| PrismaClient[Prisma ORM]
    PrismaClient -->|Data Persistence| PostgreSQL[(PostgreSQL Database)]
    Backend -->|Intelligent Analysis| GeminiAI[Google Gemini AI API]
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database ORM**: Prisma (v6.4.0)
- **Database**: PostgreSQL (via `pg`)
- **Authentication**: JWT & Bcryptjs
- **AI Integration**: Google `@google/generative-ai`

### Frontend
- **Framework**: React (v19) with Vite
- **State Management**: Zustand
- **Query Handling**: TanStack React Query
- **Styling**: TailwindCSS & Framer Motion (animations)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

---

## 📁 Repository Structure

```
BusinessOS-Multi-Tenant-ERP-SaaS-Platform/
├── backend/                     # Express.js REST API Server (TypeScript)
│   ├── prisma/                  # Database Schema Definitions
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/         # Request Handlers (Auth, Org, Employees, etc.)
│   │   ├── middlewares/         # Authorization and Validation Middlewares
│   │   ├── routes/              # Endpoint definitions (Auth, Sales, AI, etc.)
│   │   ├── index.ts             # Application entry point
│   │   └── prisma.ts            # Prisma client instance
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                    # Vite + React Client App (TypeScript)
│   ├── src/
│   │   ├── assets/              # Static media assets
│   │   ├── components/          # Reusable components & AppLayout
│   │   ├── hooks/               # Custom React Hooks (useAuth)
│   │   ├── lib/                 # Core utils & cn helper
│   │   ├── pages/               # Feature views (Dashboard, Tasks, Sales, etc.)
│   │   ├── App.tsx              # Main routing and provider setup
│   │   └── main.tsx             # DOM entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                    # Root Documentation
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database instance running locally or on a cloud service (e.g., Neon)

### 1. Database & Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file inside the `backend` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/businessos_db?schema=public"
   JWT_SECRET="your_secure_jwt_secret_key"
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```
4. Run Prisma database migrations to create tables:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application opens on `http://localhost:5173`.*

---

## 🔒 Security & Tenant Isolation

This platform implements rigid Multi-Tenant isolation:
- Users register and are associated with one or more **Organizations**.
- All data requests are filtered by the current organization using the `x-organization-id` header.
- The backend validates that the requesting user's token belongs to an employee with valid access to the target organization prior to fulfilling any query.