# API Alignment Summary

## Changes Made to Match Backend Architecture

### 1. **Frontend API Functions Updated** (`frontend/src/api/notes.js`)

#### `createNote()` Function
**Before:**
```javascript
createNote(ownerEmail, noteData, module, isVerified)
// Sent: { ownerEmail, noteData, module, isVerified }
```

**After:**
```javascript
createNote(ownerEmail, title, noteData, module)
// Sends: { owner_email, title, note_data, module }
```

**Changes:**
- ✅ Added `title` parameter (required by backend)
- ✅ Changed `ownerEmail` → `owner_email`
- ✅ Changed `noteData` → `note_data`
- ✅ Removed `isVerified` (not expected by backend POST route)

#### `updateNote()` Function
**Before:**
```javascript
updateNote(id, noteData, module)
// Sent: { noteData, module }
```

**After:**
```javascript
updateNote(id, title, noteData, module)
// Sends: { title, note_data, module }
```

**Changes:**
- ✅ Added `title` parameter (required by backend)
- ✅ Changed `noteData` → `note_data`

---

### 2. **Frontend API Functions Updated** (`frontend/src/api/users.js`)

#### `createUser()` Function
**Before:**
```javascript
createUser(email, password, lecturer, points)
// Sent: { email, password, lecturer, points }
```

**After:**
```javascript
createUser(email, name, passwordHash, isLecturer, points)
// Sends: { email, name, password_hash, is_lecturer, points }
```

**Changes:**
- ✅ Added `name` parameter (required by backend)
- ✅ Changed `password` → `password_hash`
- ✅ Changed `lecturer` → `is_lecturer`

#### `updateUser()` Function
**Before:**
```javascript
updateUser(email, password, lecturer, points)
// Sent: { password, lecturer, points }
```

**After:**
```javascript
updateUser(email, name, passwordHash, isLecturer, points)
// Sends: { name, password_hash, is_lecturer, points }
```

**Changes:**
- ✅ Added `name` parameter (required by backend)
- ✅ Changed `password` → `password_hash`
- ✅ Changed `lecturer` → `is_lecturer`

---

### 3. **Backend Routes Updated** (`backend/routes/notesRoutes.js`)

Added JOIN with `user_data` table to include owner information in responses:

**Before:**
```sql
SELECT * FROM notes WHERE id = ?
```

**After:**
```sql
SELECT notes.*, user_data.email as owner_email 
FROM notes 
LEFT JOIN user_data ON notes.owner_id = user_data.id 
WHERE notes.id = ?
```

**Updated Routes:**
- ✅ `GET /notes/:id` - Now includes `owner_email`
- ✅ `GET /notes/module/:module` - Now includes `owner_email`
- ✅ `GET /notes/email/:email` - Now includes `owner_email`

This ensures the frontend can identify note ownership for edit/delete permissions.

---

### 4. **Frontend Pages Updated**

#### `CreateNotePage.tsx`
**Before:**
```typescript
createNote(currentUser.email, description.trim() || title.trim(), module)
```

**After:**
```typescript
createNote(currentUser.email, title.trim(), description.trim(), module)
```

**Changes:**
- ✅ Now passes `title` as separate parameter
- ✅ Passes `description` (note_data) correctly

#### TypeScript Interfaces
Updated Note interface in all pages to match database schema:

**Before:**
```typescript
interface Note {
  id: string;
  title: string;
  description: string;
  module: string;
  files: string[];
  createdAt: string;
  ownerEmail: string;
}
```

**After:**
```typescript
interface Note {
  id: string;
  owner_id: number;
  owner_email: string;
  title: string;
  note_data: string;
  module: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
}
```

**Changes:**
- ✅ Added `owner_id` and `owner_email` (from database)
- ✅ Changed `description` → `note_data`
- ✅ Changed `ownerEmail` → `owner_email`
- ✅ Changed `createdAt` → `created_at`
- ✅ Added `updated_at` and `is_verified`
- ✅ Removed `files` array (not in database)

#### Field Reference Updates
**Files Updated:**
- `Dashboard.tsx`: `note.description` → `note.note_data`
- `MyNotesPage.tsx`: `note.description` → `note.note_data`
- `NoteDetailPage.tsx`: 
  - `note.description` → `note.note_data`
  - `note.createdAt` → `note.created_at`
  - Removed files section (not in database)

---

## Database Schema (Reference)

### `user_data` Table
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT UNIQUE)
- is_lecturer (INTEGER 0/1)
- points (INTEGER)
- password_hash (TEXT)
```

### `notes` Table
```sql
- id (INTEGER PRIMARY KEY)
- owner_id (INTEGER FOREIGN KEY)
- title (TEXT)
- is_verified (INTEGER 0/1)
- note_data (TEXT)
- module (TEXT)
- created_at (TEXT/DATETIME)
- updated_at (TEXT/DATETIME)
```

---

## Testing Checklist

✅ **Create Note**: Test with title and content  
✅ **View Notes**: Verify owner_email is displayed  
✅ **Update Note**: Include title when updating  
✅ **Delete Note**: Verify ownership check works  
✅ **User Operations**: Use correct field names (name, password_hash, is_lecturer)

---

## Key Improvements

1. **Consistent Naming**: All snake_case fields from database match API calls
2. **Ownership Tracking**: Backend now returns `owner_email` for proper permission checks
3. **Required Fields**: All required fields (title, name) now included in API calls
4. **Type Safety**: TypeScript interfaces match actual database structure
5. **No More localStorage**: All data properly fetched from backend database

---

## Notes

- The TypeScript warnings about importing `.js` files are expected and won't affect functionality
- All field names now use snake_case to match SQL database conventions
- Frontend properly handles all database fields returned by backend
