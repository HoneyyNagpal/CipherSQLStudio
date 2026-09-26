# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution, query plan visualization, and intelligent hints.

## Project Overview

CipherSQLStudio is NOT a database creation tool. Assignments and sample data are pre-inserted by administrators. Students write SQL queries, execute them against a sandboxed PostgreSQL instance, inspect how PostgreSQL actually runs their query, and get LLM-powered hints (not solutions) when stuck.

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

## Folder Structure

CipherSQLStudio/
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── AssignmentList/ # Assignment cards listing
│ │ │ ├── AssignmentAttempt/ # Main attempt interface
│ │ │ ├── Editor/ # Monaco SQL editor
│ │ │ ├── Results/ # Query results table + query plan viewer
│ │ │ ├── Hints/ # LLM hint panel
│ │ │ ├── Auth/ # Login / Signup
│ │ │ └── common/ # Navbar, Loader, etc.
│ │ ├── pages/ # Route-level page components
│ │ ├── styles/ # SCSS partials and main entry
│ │ ├── hooks/ # Custom React hooks
│ │ ├── services/ # API call functions
│ │ ├── context/ # React Context (auth, theme)
│ │ └── utils/ # Helper functions
│ └── package.json
│
├── backend/
│ ├── routes/ # Express route definitions
│ ├── controllers/ # Business logic handlers
│ ├── middleware/ # Auth, error, sanitize
│ ├── models/ # Mongoose models
│ ├── config/ # DB connections
│ ├── utils/ # Query sanitizer, helpers
│ └── server.js
│
├── .env.example
└── README.md


## Environment Variables

**Backend (`backend/.env`)**

PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ciphersql
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=yourpassword
PG_DATABASE=ciphersql_sandbox
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000


**Frontend (`frontend/.env`)**

REACT_APP_API_URL=http://localhost:5001/api


## Installation & Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (free at https://aistudio.google.com)

### 1. Clone & Install
```bash
git clone https://github.com/HoneyyNagpal/CipherSQLStudio.git
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
Create a free MongoDB Atlas cluster at https://cloud.mongodb.com. Copy your connection string into `MONGO_URI` in `backend/.env`.

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

App runs at: `http://localhost:3000`
API runs at: `http://localhost:5001`

## Data-Flow Diagram

See `DATA_FLOW.md` for the hand-drawn data flow diagram description.

**Query execution flow:**

User types SQL → Monaco Editor
↓
"Run Query" clicked → React state update
↓
frontend/services/api.js → POST /api/query/execute
↓
backend/middleware/sanitize.js → validates & strips dangerous SQL
↓
backend/controllers/queryController.js → pg.query(sql, [assignmentId])
↓
PostgreSQL sandbox (read-only connection user) → result rows
↓
JSON response { success, columns, rows, rowCount, executionTime }
↓
frontend Results panel renders <table> with data


**Query plan flow:**

User types SQL → Monaco Editor
↓
"Show Query Plan" clicked → React state update
↓
frontend/services/queryService.js → POST /api/query/explain
↓
backend/middleware/sanitize.js → validates & strips dangerous SQL
↓
backend/controllers/queryController.js → EXPLAIN (ANALYZE, FORMAT JSON, BUFFERS) <sql>
↓
PostgreSQL sandbox (read-only connection user) → query plan tree
↓
JSON response { success, plan }
↓
frontend QueryPlanViewer renders the plan as a node tree, with node type,
cost, actual execution time, and row count at each step


## Features

- Assignment listing with difficulty badges and topic tags
- Full attempt interface (question + schema viewer + editor + results)
- Monaco Editor with SQL syntax highlighting
- Real-time query execution against PostgreSQL
- Query plan viewer using `EXPLAIN ANALYZE`, so learners can see how PostgreSQL actually executes their query and spot slow steps like sequential scans
- LLM hints via Gemini (guidance only, not solutions)
- Query error display with helpful messages
- Mobile-first responsive design (320px → 1281px+)

## Security

- Queries run as a read-only PostgreSQL role (`ciphersql_reader`)
- SQL sanitization strips `DROP`, `DELETE`, `INSERT`, `UPDATE`, `CREATE`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`
- Queries are scoped to the assignment's allowed tables only
- The query plan endpoint (`/api/query/explain`) runs through the same sanitizer and read-only role as `/api/query/execute`, since `EXPLAIN ANALYZE` executes the query it inspects
- JWT auth protects attempt-saving endpoints
- Rate limiting on `/api/query`, covering both `/execute` and `/explain` (10 req/min per IP)
- CORS restricted to frontend origin