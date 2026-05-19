# 🔧 Service Request Board

A full-stack mini service request board where homeowners can post jobs
and tradespeople can browse, update, and manage them.

---

## 🌐 Live Demo

|                 | URL                                         |
| --------------- | ------------------------------------------- |
| **Backend**    | https://service-board-backend.onrender.com/ |
| **Frontend** | https://service-board-navy.vercel.app/      |

---

## ⚙️ Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Frontend    | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend     | Node.js + Express                                   |
| Database    | MongoDB + Mongoose                                  |
| Auth        | JWT (JSON Web Tokens) + bcryptjs                    |
| HTTP Client | Axios                                               |

---

## 📁 Project Structure

```
service-board/
├── frontend/                   # Next.js app (TypeScript)
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Navbar + AuthProvider
│   │   ├── page.tsx            # Home - job listings + filters
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # Login page
│   │   │   └── register/
│   │   │       └── page.tsx    # Register page
│   │   └── jobs/
│   │       ├── new/
│   │       │   └── page.tsx    # Create new job (protected)
│   │       └── [id]/
│   │           └── page.tsx    # Job detail + status update + delete
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation with auth state
│   │   ├── JobCard.tsx         # Job card component
│   │   └── StatusBadge.tsx     # Coloured status indicator
│   ├── context/
│   │   └── AuthContext.tsx     # Global auth state
│   ├── lib/
│   │   ├── api.ts              # Axios instance with token interceptor
│   │   └── auth.ts             # Auth helper functions
│   ├── types/
│   │   └── job.ts              # TypeScript types
│   └── .env.local              # Frontend environment variables
│
├── backend/                    # Express API
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── JobRequest.js       # Job mongoose model
│   │   └── User.js             # User mongoose model
│   ├── routes/
│   │   ├── auth.js             # Auth routes (register, login, me)
│   │   └── jobs.js             # Job CRUD routes
│   ├── seed.js                 # Sample data seed script
│   ├── server.js               # Express entry point
│   └── .env                    # Backend environment variables
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- npm v9 or higher

Check your versions:

```bash
node -v
npm -v
mongod --version
```

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/globaltna
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

> For MongoDB Atlas replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/globaltna`

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🛠️ Setup & Run Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/globaltna-service-board.git
cd globaltna-service-board
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file (see environment variables above), then start the server:

```bash
npm run dev
```

You should see:

```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### 3. Seed sample data (optional but recommended)

In a new terminal:

```bash
cd backend
node seed.js
```

You should see:

```
✅ Connected to MongoDB
🗑️  Cleared existing jobs
🌱 Inserted 7 sample jobs
```

### 4. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
```

Create your `.env.local` file (see environment variables above), then start the app:

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### 5. Open the app

```
http://localhost:3000
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth Routes

| Method | Endpoint         | Access | Description                 |
| ------ | ---------------- | ------ | --------------------------- |
| `POST` | `/auth/register` | Public | Register new user           |
| `POST` | `/auth/login`    | Public | Login + get token           |
| `GET`  | `/auth/me`       | Public | Get current user from token |

#### Register

```json
POST /api/auth/register
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Job Routes

| Method   | Endpoint                  | Access       | Description        |
| -------- | ------------------------- | ------------ | ------------------ |
| `GET`    | `/jobs`                   | Public       | List all jobs      |
| `GET`    | `/jobs?category=Plumbing` | Public       | Filter by category |
| `GET`    | `/jobs?status=Open`       | Public       | Filter by status   |
| `GET`    | `/jobs?search=tap`        | Public       | Keyword search     |
| `GET`    | `/jobs/:id`               | Public       | Get single job     |
| `POST`   | `/jobs`                   | 🔐 Protected | Create new job     |
| `PATCH`  | `/jobs/:id`               | 🔐 Protected | Update job status  |
| `DELETE` | `/jobs/:id`               | 🔐 Protected | Delete job         |

#### Protected routes require:

```
Authorization: Bearer <your_jwt_token>
```

#### Create a job

```json
POST /api/jobs
{
  "title": "Leaking kitchen tap",
  "description": "Tap dripping constantly, needs urgent repair",
  "category": "Plumbing",
  "location": "Glasgow",
  "contactName": "John Smith",
  "contactEmail": "john@example.com"
}
```

#### Update status

```json
PATCH /api/jobs/:id
{
  "status": "In Progress"
}
```

---

## ✅ Features

### Core

- [x] Browse all service requests on the home page
- [x] Filter jobs by category and status
- [x] Keyword search across title and description
- [x] Create a new job request with form validation
- [x] View full job details
- [x] Update job status (Open → In Progress → Closed)
- [x] Delete a job

### Bonus

- [x] 🔍 Keyword search across title and description
- [x] 🔐 JWT authentication (register, login, logout)
- [x] 🌱 Seed script with 7 sample jobs
- [ ] 🧪 Unit tests
- [ ] 🚀 Deployed to Vercel + Render

---

## 📦 Scripts

### Backend

| Command        | Description                       |
| -------------- | --------------------------------- |
| `npm run dev`  | Start with nodemon (auto-restart) |
| `npm start`    | Start without nodemon             |
| `node seed.js` | Seed sample data                  |

### Frontend

| Command         | Description             |
| --------------- | ----------------------- |
| `npm run dev`   | Start dev server        |
| `npm run build` | Build for production    |
| `npm start`     | Start production server |

---

## 👤 Author

Kalana Heshan
[LinkedIn](https://linkedin.com/in/kalana-heshan)
