# CipherSQLStudio – Data Flow Diagram

## Query Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (React Frontend)                        │
│                                                                         │
│  Student types SQL in Monaco Editor                                     │
│       │                                                                 │
│       ▼                                                                 │
│  onClick "Run Query" button / Ctrl+Enter                                │
│       │                                                                 │
│       ▼  State update: setIsExecuting(true), setResult(null)            │
│       │                                                                 │
│       ▼  services/api.js → POST /api/query/execute                      │
│       │  Body: { sql: "SELECT ...", assignmentId: "asgn_001" }          │
│       │  Headers: Authorization: Bearer <JWT token if logged in>        │
└───────┼─────────────────────────────────────────────────────────────────┘
        │
        │  HTTP Request over network
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       NODE.JS / EXPRESS BACKEND                         │
│                                                                         │
│  1. Rate Limiter (express-rate-limit)                                   │
│     └── Allows max 10 requests/minute per IP                            │
│     └── If exceeded → 429 response → error shown in frontend           │
│                                                                         │
│  2. CORS middleware                                                     │
│     └── Allows only FRONTEND_URL origin                                 │
│                                                                         │
│  3. routes/queries.js → optionalAuth middleware                         │
│     └── Reads JWT from Authorization header                             │
│     └── Decodes userId if valid token (doesn't block if no token)       │
│     └── Attaches req.userId = "..." or null                             │
│                                                                         │
│  4. controllers/queryController.js :: executeQuery()                    │
│     │                                                                   │
│     ├─ Validates assignmentId exists in ASSIGNMENTS array               │
│     │  └── 404 if not found                                             │
│     │                                                                   │
│     ├─ utils/sanitizer.js :: sanitizeQuery(sql)                         │
│     │  ├─ Strips -- and /* */ comments                                  │
│     │  ├─ Checks for blocked keywords (DROP, DELETE, INSERT, etc.)      │
│     │  ├─ Detects multiple statements (only 1 allowed)                  │
│     │  ├─ Checks query starts with SELECT or WITH                       │
│     │  └── Returns { safe: false, reason } or { safe: true, cleanedSql }│
│     │     └── If not safe → 400 response with validation error          │
│     │                                                                   │
│     └─ readerPool.query(cleanedSql)                                     │
│        ├── Executes on PostgreSQL (read-only role)                      │
│        ├── statement_timeout = 5000ms (prevent long queries)            │
│        │                                                                │
│        ├── On SUCCESS:                                                  │
│        │   ├── result.fields → column names                             │
│        │   ├── result.rows → data array                                 │
│        │   ├── If req.userId → Attempt.create({wasSuccessful: true})    │
│        │   └── Return: { success: true, columns, rows, rowCount, time } │
│        │                                                                │
│        └── On FAILURE (SQL error):                                      │
│            ├── Catch pg error, clean message                            │
│            ├── If req.userId → Attempt.create({wasSuccessful: false})   │
│            └── Return: { success: false, error, type: QUERY_ERROR }     │
└───────┼─────────────────────────────────────────────────────────────────┘
        │
        │  HTTP Response (JSON)
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (React Frontend)                        │
│                                                                         │
│  services/api.js receives response                                      │
│       │                                                                 │
│       ▼  AssignmentAttempt.jsx :: handleExecute()                       │
│       │  setResult(response)                                            │
│       │  setIsExecuting(false)                                          │
│       │                                                                 │
│       ▼  ResultsPanel.jsx re-renders with result                        │
│       │                                                                 │
│       ├── SUCCESS: Renders <table> with columns + rows                  │
│       │           Shows row count + execution time                      │
│       │                                                                 │
│       └── ERROR: Renders error card with cleaned error message          │
│                  Shows "Error" badge in header                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Hint Generation Flow

```
Student clicks "Get Hint" in HintsPanel
     │
     ▼  State: setIsLoading(true)
     │
     ▼  POST /api/hint
        Body: { assignmentId, currentQuery, errorMessage, questionPart }
     │
     ▼  Rate limiter: max 5 hint requests/minute
     │
     ▼  hintController.js :: getHint()
     │  ├── Look up assignment from ASSIGNMENTS array
     │  ├── Build prompt: buildHintPrompt()
     │  │   ├── Assignment title, difficulty, tables, expected concepts
     │  │   ├── Student's current query (context)
     │  │   ├── Error message (if any)
     │  │   ├── Student's specific question (if any)
     │  │   └── STRICT INSTRUCTIONS: "Never write SQL, give conceptual hints only"
     │  │
     │  └── GoogleGenerativeAI.generateContent(prompt)
     │      └── gemini-1.5-flash model
     │
     ▼  Response: { hint: "Have you thought about using GROUP BY..." }
     │
     ▼  HintsPanel adds hint to hints array
     └── Renders hint card with animation
```

---

## Authentication Flow

```
User clicks "Sign Up" in Navbar
     │
     ▼  AuthModal renders (React state: authModal = 'signup')
     │
     ▼  Form submit → AuthContext.signup()
     │
     ▼  POST /api/auth/signup
        Body: { username, email, password }
     │
     ▼  authController.signup()
     │  ├── Validate with express-validator
     │  ├── Check User.findOne({ email or username })
     │  │   └── 409 if already exists
     │  ├── User.create() → password hashed by bcryptjs pre-save hook
     │  └── jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
     │
     ▼  Response: { token, user: { id, username, email } }
     │
     ▼  AuthContext: localStorage.setItem('token', ...) + setUser(...)
     └── AuthModal closes, Navbar shows username
```

---

## Databases in Use

| Database | Purpose | When Used |
|---|---|---|
| PostgreSQL | Sandbox for student queries | Every "Run Query" click |
| MongoDB | Store users, save query attempts | Signup/login, after each query if logged in |

PostgreSQL has TWO roles:
- `postgres` (admin): Used by backend to read schemas, serve sample data
- Reader role: Used to execute student queries (SELECT only, 5s timeout)

---

## State Management Summary

```
App Level (AuthContext):
  user, token → stored in localStorage + React state

AssignmentAttempt Component:
  assignment, schemas, sampleData → loaded once on mount via API
  sql → controlled by Monaco Editor
  result → set after each query execution
  isExecuting → shows loading state
  lastError → passed to HintsPanel for context
  attempts → loaded from MongoDB if user is logged in

HintsPanel Component:
  hints[] → grows with each hint request (session only)
  isLoading → shows dot animation
  questionPart → textarea for specific question
```
