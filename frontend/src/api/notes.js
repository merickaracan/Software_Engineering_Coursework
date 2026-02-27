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
 * @param {string} noteData - Note content
 * @param {string} module - Module code
 * @param {number} [isVerified=0] - Verification status (0 or 1)
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const createNote = async (ownerEmail, noteData, module, isVerified = 0) => {
    try {
        const response = await fetch("/api/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                ownerEmail,
                noteData,
                module,
                isVerified
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
 * @param {string|null} [noteData=null] - New note content (optional)
 * @param {string|null} [module=null] - New module code (optional)
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const updateNote = async (id, noteData = null, module = null) => {
    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                noteData,
                module
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

export {
    getNoteById,
    getNotesByModule,
    getNotesByEmail,
    createNote,
    updateNote,
    verifyNote,
    unverifyNote,
    deleteNote
};
