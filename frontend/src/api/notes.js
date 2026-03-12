/**
 * Retrieves a single note by ID
 * @param {number} id - Note ID
 * @returns {Promise<Object>} Note object
 * @throws {Error} If the request fails
 */
const getNoteById = async (id) => {
    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching note:", err);
        throw err;
    }
};

/**
 * Retrieves all notes for a specific module
 * @param {string} module - Module code
 * @returns {Promise<Object>} Response data with array of notes
 * @throws {Error} If the request fails
 */
const getNotesByModule = async (module) => {
    try {
        const response = await fetch(`/api/notes/module/${module}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching notes by module:", err);
        throw err;
    }
};

/**
 * Retrieves all notes created by a specific user
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response data with array of notes
 * @throws {Error} If the request fails
 */
const getNotesByEmail = async (email) => {
    try {
        const response = await fetch(`/api/notes/email/${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching notes by email:", err);
        throw err;
    }
};

/**
 * Creates a new note
 * @param {string} ownerEmail - Note creator's email
 * @param {string} title - Note title
 * @param {string} noteData - Note content
 * @param {string} module - Module code
 * @param {Object} [file=null] - Optional file object with {name, type, size, data}
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const createNote = async (ownerEmail, title, noteData, module, file = null) => {
    try {
        const response = await fetch("/api/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                owner_email: ownerEmail,
                title: title,
                note_data: noteData,
                module: module,
                file: file
            })
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error creating note:", err);
        throw err;
    }
};

/**
 * Updates an existing note
 * @param {number} id - Note ID
 * @param {string|null} [title=null] - New note title (optional)
 * @param {string|null} [noteData=null] - New note content (optional)
 * @param {string|null} [module=null] - New module code (optional)
 * @param {string|null} [noteTitle=null] - New note title (optional)
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const updateNote = async (id, noteData = null, module = null, noteTitle = null) => {
    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                note_data: noteData,
                module,
                note_title: noteTitle,
            })
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error updating note:", err);
        throw err;
    }
};

/**
 * Verifies a note
 * @param {number} id - Note ID
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const verifyNote = async (id) => {
    try {
        const response = await fetch(`/api/notes/verify/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error verifying note:", err);
        throw err;
    }
};

/**
 * Unverifies a note
 * @param {number} id - Note ID
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const unverifyNote = async (id) => {
    try {
        const response = await fetch(`/api/notes/unverify/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error unverifying note:", err);
        throw err;
    }
};

/**
 * Deletes a note
 * @param {number} id - Note ID
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const deleteNote = async (id) => {
    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error deleting note:", err);
        throw err;
    }
};

/**
 * Searches for notes by title and/or author
 * @param {string} [title] - Search term for note title
 * @param {string} [author] - Search term for author email
 * @returns {Promise<Object>} Response data with array of matching notes
 * @throws {Error} If the request fails
 */
const searchNotes = async (title = "", author = "") => {
    try {
        const params = new URLSearchParams();
        if (title) params.append("title", title);
        if (author) params.append("author", author);
        
        const response = await fetch(`/api/search?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error searching notes:", err);
        throw err;
    }
};

export {
    getNoteById,
    getNotesByModule,
    getNotesByEmail,
    searchNotes,
    createNote,
    updateNote,
    verifyNote,
    unverifyNote,
    deleteNote
};
