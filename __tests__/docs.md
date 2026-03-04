# Only Integration level tests go here. (A.k.a thoswe that test functionality across the entire stack)

## Frontend functional test plan (no UI styling assertions)

### Priority 1 (core flows)
- App auth guard and routing behavior
	- unauthenticated users cannot access protected routes
	- authenticated users can access protected routes
	- auth check runs on app mount
- Login flow
	- valid credentials trigger `/api/login` and set auth state
	- invalid credentials surface backend error
- Register flow
	- valid form submits `/api/register`
	- backend errors surface to the user
- Profile logout
	- removes stored user and navigates to login

### Priority 2 (local state persistence)
- Theme persistence
	- theme toggle updates `localStorage`
- Modules selection
	- selected module IDs persist in `localStorage`
- Leaderboard data
	- empty state when no data
	- sorts by average rating

### Priority 3 (API helper contracts)
- Keep existing API helper tests for `/notes`, `/suggestions`, `/users`
- Add new tests only when helper behavior changes

---

## Backend functional test plan

### Coverage Summary
**Existing:** auth.login.test.js, auth.register.test.js (comprehensive)  
**New:** notesRoutes, suggestionsRoutes, userRoutes, middleware, userService

### Priority 1 (Auth & Core Flows)
✅ Login validation (missing fields, wrong password, unverified user)  
✅ Login success (token generation, cookie setting)  
✅ Register validation (email format, password strength, duplicate check)  
✅ Register success (user creation, email verification)  
✅ Logout (token clearing)  
✅ Protected endpoint `/me` (token validation, user retrieval)

### Priority 2 (CRUD Operations - Unit Tests)

#### Notes Routes
- GET `/api/notes/:id` - fetch single note
- GET `/api/notes/module/:module` - fetch notes by module
- GET `/api/notes/email/:email` - fetch notes by owner
- POST `/api/notes` - create note
- PUT `/api/notes/:id` - update note
- PUT `/api/notes/verify/:id` - mark note as verified
- PUT `/api/notes/unverify/:id` - mark note as unverified
- PUT `/api/notes/rating` - update note rating
- DELETE `/api/notes/:id` - delete note

#### Suggestions Routes
- GET `/api/suggestions/:id` - fetch single suggestion
- GET `/api/suggestions/commenter/:id` - fetch by commenter
- POST `/api/suggestions` - create suggestion
- PUT `/api/suggestions/:id` - update suggestion
- DELETE `/api/suggestions/:id` - delete suggestion

#### User Routes
- GET `/api/users/:email` - fetch user
- POST `/api/users` - create user (CRUD endpoint, not auth)
- PUT `/api/users/:email` - update user
- DELETE `/api/users/:email` - delete user

### Priority 3 (Middleware & Services)

#### Middleware (requireAuth)
- Rejects requests without token
- Validates JWT signature and expiration
- Attaches decoded user to `req.user`
- Forwards to next handler on valid token

#### User Service (unit tests)
- getUser(email) - query and return user or null
- createUser(email, passkey, lecturer, points) - insert with defaults
- updateUser(email, passkey, lecturer, points) - update with null support
- deleteUser(email) - delete and return affected rows

### Test Strategy
- **Mocking:** db.query mocked with Jest to avoid real DB calls
- **Status Codes:** Assert correct HTTP response codes (200, 201, 400, 401, 404, 500)
- **Error Handling:** Verify error messages and ok: false responses
- **Happy Path:** Verify successful operations return expected data
