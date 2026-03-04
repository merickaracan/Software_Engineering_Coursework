# Backend & Frontend Integration Guide

## Overview
This guide explains how the backend and frontend are integrated in the Notebuddy application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React/TypeScript)            │
│                     runs on http://localhost:5173            │
├─────────────────────────────────────────────────────────────┤
│  Pages: Login, Register, Dashboard, CreateNote, MyNotes...  │
│  API Calls: /api/* →  Vite Proxy → http://localhost:3000    │
└─────────────────────────────────────────────────────────────┘
                              ↓ (Vite Proxy)
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                 │
│                     runs on http://localhost:3000            │
├─────────────────────────────────────────────────────────────┤
│  Routes: /api/auth, /api/notes, /api/users, /api/suggestions│
│  Database: MySQL (Cloud) with SQLite fallback (Local)       │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env` file in the `backend/` directory:
```env
JWT_SECRET=your_secret_key_here
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
```

### 3. Start the Application

**Terminal 1 - Start the Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

**Terminal 2 - Start the Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## Integration Details

### Frontend Structure

The frontend uses API client functions located in `src/api/`:
- **[notes.js](frontend/src/api/notes.js)** - Note operations (CRUD)
- **[users.js](frontend/src/api/users.js)** - User operations
- **[suggestions.js](frontend/src/api/suggestions.js)** - Suggestion operations

### Backend API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/register` - Register new user
- `POST /api/login` - Login user (returns JWT in HTTP-only cookie)
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current authenticated user (requires auth)

#### Notes (`/api/notes`)
- `GET /api/notes/:id` - Get note by ID
- `GET /api/notes/module/:module` - Get all notes for a module
- `GET /api/notes/email/:email` - Get all notes by user email
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Users (`/api/users`)
- `GET /api/users/:email` - Get user by email
- `POST /api/users` - Create new user
- `PUT /api/users/:email` - Update user
- `DELETE /api/users/:email` - Delete user

#### Suggestions (`/api/suggestions`)
- `GET /api/suggestions/:id` - Get suggestion by ID
- `GET /api/suggestions/commenter/:commenterId` - Get suggestions by commenter
- `GET /api/suggestions/note/:noteId` - Get all suggestions for a note
- `POST /api/suggestions` - Create new suggestion
- `PUT /api/suggestions/:id` - Update suggestion
- `DELETE /api/suggestions/:id` - Delete suggestion

### Database Schema

The application uses the following main tables:

**user_data**
- `id` (INT PRIMARY KEY)
- `email` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `password_hash` (VARCHAR)
- `is_lecturer` (TINYINT)
- `points` (INT)

**notes**
- `id` (INT PRIMARY KEY)
- `owner_id` (INT FOREIGN KEY)
- `title` (VARCHAR)
- `note_data` (TEXT)
- `module` (VARCHAR)
- `created_at` (TIMESTAMP)
- `is_verified` (TINYINT)

**suggestions**
- `id` (INT PRIMARY KEY)
- `note_id` (INT FOREIGN KEY)
- `commenter_id` (INT FOREIGN KEY)
- `suggestion_text` (TEXT)
- `created_at` (TIMESTAMP)

## How Frontend Pages Use the Backend

### 1. Login Page (`frontend/src/pages/Login.tsx`)
- Calls `POST /api/login` with email and password
- Backend validates credentials and returns JWT (HTTP-only cookie)
- On success, navigates to Dashboard

### 2. Register Page (`frontend/src/pages/Register.tsx`)
- Calls `POST /api/register` with name, email, and password
- Backend validates input and creates user account
- On success, navigates to Login page

### 3. Create Note Page (`frontend/src/pages/CreateNotePage.tsx`)
- **Updated to use Backend API**
- Gets current user from localStorage
- Calls `createNote()` function from `src/api/notes.js`
- This sends `POST /api/notes` request to backend
- Backend creates note and stores in database

### 4. Dashboard (`frontend/src/pages/Dashboard.tsx`)
- **Updated to use Backend API**
- Gets current user email from localStorage
- Calls `getNotesByEmail()` function from `src/api/notes.js`
- This sends `GET /api/notes/email/:email` request to backend
- Displays the last 3 recent notes with loading state

### 5. Other Pages
- **MyNotesPage** - Should be updated to fetch notes from `/api/notes/email/:email`
- **NoteDetailPage** - Should fetch note details from `/api/notes/:id`
- **LeaderboardPage** - Should fetch users sorted by points
- **Profile** - Should fetch user data and update via `/api/users/:email`

## API Request Examples

### Create a Note
```javascript
import { createNote } from "../api/notes";

const response = await createNote(
  "user@bath.ac.uk",
  "Note content here",
  "se"  // module code
);

if (response.ok) {
  console.log("Note created:", response.insertId);
} else {
  console.error("Error:", response.error);
}
```

### Fetch User Notes
```javascript
import { getNotesByEmail } from "../api/notes";

const response = await getNotesByEmail("user@bath.ac.uk");

if (response.ok) {
  const notes = response.data; // Array of notes
  notes.forEach(note => console.log(note.title));
}
```

### Create User
```javascript
import { createUser } from "../api/users";

const response = await createUser(
  "user@bath.ac.uk",
  "hashedPassword",
  0,  // is_lecturer: 0 = student, 1 = lecturer
  0   // initial points
);
```

## Authentication Flow

1. User logs in with email and password
2. Backend validates and creates JWT token
3. JWT is stored in HTTP-only cookie (secure)
4. Cookie is automatically sent with all subsequent requests
5. Middleware validates token on protected routes
6. User can logout by calling `POST /api/logout`

## Important Notes

- **Credentials Mode**: All API requests include `credentials: "include"` to send cookies
- **HTTP-Only Cookies**: JWT tokens are stored securely in HTTP-only cookies
- **Database Fallback**: If cloud database fails, app automatically falls back to local SQLite
- **CORS**: Backend has CORS enabled for localhost development
- **Error Handling**: Always check `response.ok` and `response.error` in API calls

## Updated Files

The following frontend pages have been updated to use the backend API:

1. ✅ **[CreateNotePage.tsx](frontend/src/pages/CreateNotePage.tsx)** - Now calls backend API to create notes
2. ✅ **[Dashboard.tsx](frontend/src/pages/Dashboard.tsx)** - Now fetches notes from backend with loading state
3. ✅ **[Register.tsx](frontend/src/pages/Register.tsx)** - Already configured to use backend API

## Pages That Need Updates

The following pages still need to be updated to use the backend API instead of localStorage:

- [ ] **MyNotesPage.tsx** - Replace localStorage with `getNotesByEmail()` or `getNotesByModule()`
- [ ] **NoteDetailPage.tsx** - Replace with `getNoteById()`
- [ ] **EditNotePage.tsx** - Replace with `updateNote()`
- [ ] **Profile.tsx** - Use `getUser()` and `updateUser()`
- [ ] **LeaderboardPage.tsx** - Should fetch all users via new endpoint
- [ ] **Leaderboard.tsx** - Component should fetch top users
- [ ] **Modules.tsx** - Should fetch available modules and their notes

## Testing the Integration

1. **Test Registration**: Sign up a new account at `/register`
2. **Test Login**: Log in with your credentials
3. **Test Create Note**: Create a note on the Create Note page
4. **Test Dashboard**: Verify notes appear on dashboard (fetched from backend)
5. **Test Notes Persistence**: Refresh the page - notes should still appear (stored in database)

## Troubleshooting

### "Failed to fetch" errors
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify API endpoint paths are correct

### "User not found" errors
- Make sure user is logged in
- Check email format must be `user@bath.ac.uk`

### Database connection errors
- Verify `.env` file with correct database credentials
- Check if cloud database is accessible
- App will fall back to local SQLite automatically

### Cookie not being sent
- Ensure `credentials: "include"` is in fetch options
- Check if cookies are enabled in browser
- Verify same-site cookie policy

## Next Steps

1. ✅ Complete integration of remaining pages
2. ✅ Test all CRUD operations
3. ✅ Implement proper error boundaries
4. ✅ Add loading states to all data-fetching pages
5. ✅ Remove localStorage dependencies where API is available
