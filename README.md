# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

---

## Project Overview

CipherSQLStudio is NOT a database creation tool. Assignments and sample data are pre-inserted by administrators. Students write SQL queries, execute them against a sandboxed PostgreSQL instance, and get LLM-powered hints (not solutions) when stuck.

---

## Technology Choices

| Layer | Technology | Why |
|---|---|---|
| Frontend | React.js | Component-based UI, great ecosystem |
| Styling | Vanilla SCSS | Required; evaluates fundamental CSS skills |
| Code Editor | Monaco Editor | Same editor as VS Code, SQL syntax support |
| Backend | Node.js + Express | Fast, lightweight API server |
| Sandbox DB | PostgreSQL | Industry-standard SQL, full query support |
| Persistence DB | MongoDB (Atlas) | Flexible schema for users, attempts, assignments |
| LLM | Google Gemini API | Free tier available, strong reasoning |

---

## Folder Structure

```
CipherSQLStudio/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssignmentList/     # Assignment cards listing
│   │   │   ├── AssignmentAttempt/  # Main attempt interface
│   │   │   ├── Editor/             # Monaco SQL editor
│   │   │   ├── Results/            # Query results table
│   │   │   ├── Hints/              # LLM hint panel
│   │   │   ├── Auth/               # Login / Signup
│   │   │   └── common/             # Navbar, Loader, etc.
│   │   ├── pages/                  # Route-level page components
│   │   ├── styles/                 # SCSS partials and main entry
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API call functions
│   │   ├── context/                # React Context (auth, theme)
│   │   └── utils/                  # Helper functions
│   └── package.json
│
├── backend/
│   ├── routes/                     # Express route definitions
│   ├── controllers/                # Business logic handlers
│   ├── middleware/                 # Auth, error, sanitize
│   ├── models/                     # Mongoose models
│   ├── config/                     # DB connections
│   ├── utils/                      # Query sanitizer, helpers
│   └── server.js
│
├── .env.example
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ciphersql
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=yourpassword
PG_DATABASE=ciphersql_sandbox
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Installation & Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (free at https://aistudio.google.com)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/CipherSQLStudio.git
cd CipherSQLStudio

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure PostgreSQL (Sandbox DB)

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create sandbox database
CREATE DATABASE ciphersql_sandbox;

-- Connect to it
\c ciphersql_sandbox

-- The backend will auto-seed sample assignment tables on startup
-- You can also run: node backend/utils/seedPostgres.js
```

### 3. Configure MongoDB

Create a free MongoDB Atlas cluster at https://cloud.mongodb.com
Copy your connection string into `MONGO_URI` in `backend/.env`

### 4. Set Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values
```

### 5. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

App runs at: http://localhost:3000
API runs at: http://localhost:5000

---

## Data-Flow Diagram

See `DATA_FLOW.md` for the hand-drawn data flow diagram description.

The key flow for query execution:
```
User types SQL → Monaco Editor
     ↓
"Execute" button clicked → React state update
     ↓
frontend/services/queryService.js → POST /api/query/execute
     ↓
backend/middleware/sanitize.js → validates & strips dangerous SQL
     ↓
backend/controllers/queryController.js → pg.query(sql, [assignmentId])
     ↓
PostgreSQL sandbox (read-only connection user) → result rows
     ↓
JSON response { columns, rows, rowCount, executionTime }
     ↓
frontend Results panel renders <table> with data
```

---

## Features

### Core (90%)
- ✅ Assignment listing with difficulty badges
- ✅ Full attempt interface (question + schema viewer + editor + results)
- ✅ Monaco Editor with SQL syntax highlighting
- ✅ Real-time query execution against PostgreSQL
- ✅ LLM hints via Gemini (guidance only, not solutions)
- ✅ Query error display with helpful messages
- ✅ Mobile-first responsive design (320px → 1281px+)

### Optional (10%)
- ✅ User authentication (JWT-based login/signup)
- ✅ Save query attempts per assignment per user

---

## Security

- Queries run as a **read-only** PostgreSQL role (`ciphersql_reader`)
- SQL sanitization strips `DROP`, `DELETE`, `INSERT`, `UPDATE`, `CREATE`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`
- Queries are scoped to the assignment's allowed tables only
- JWT auth protects attempt-saving endpoints
- Rate limiting on `/api/query/execute` (10 req/min per IP)
- CORS restricted to frontend origin
