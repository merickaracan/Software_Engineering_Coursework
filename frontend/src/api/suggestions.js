/**
 * Retrieves a single suggestion by ID
 * @param {number} id - Suggestion ID
 * @returns {Promise<Object>} Suggestion object
 * @throws {Error} If the request fails
 */
const getSuggestionById = async (id) => {
    try {
        const response = await fetch(`/api/suggestions/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching suggestion:", err);
        throw err;
    }
};

/**
 * Retrieves all suggestions made by a specific commenter
 * @param {number} commenterId - Commenter ID (user ID)
 * @returns {Promise<Object>} Response data with array of suggestions
 * @throws {Error} If the request fails
 */
const getSuggestionsByCommenterId = async (commenterId) => {
    try {
        const response = await fetch(`/api/suggestions/commenter/${commenterId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching suggestions by commenter:", err);
        throw err;
    }
};

/**
 * Retrieves all suggestions on a specific note
 * @param {number} noteId - Note ID
 * @returns {Promise<Object>} Response data with array of suggestions
 * @throws {Error} If the request fails
 */
const getSuggestionsByNoteId = async (noteId) => {
    try {
        const response = await fetch(`/api/suggestions/note/${noteId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching suggestions by note:", err);
        throw err;
    }
};

/**
 * Creates a new suggestion on a note
 * @param {number} commenterId - ID of the commenter (user who made suggestion)
 * @param {string} suggestionData - Suggestion content/comment
 * @param {number} noteId - ID of the note being commented on
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const createSuggestion = async (commenterId, suggestionData, noteId) => {
    try {
        const response = await fetch("/api/suggestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                note_id: noteId,
                commenter_id: commenterId,
                suggestion_data: suggestionData
            })
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error creating suggestion:", err);
        throw err;
    }
};

/**
 * Updates an existing suggestion
 * @param {number} id - Suggestion ID
 * @param {number} [commenterId=null] - New commenter ID (optional)
 * @param {string|null} [suggestionData=null] - New suggestion content (optional)
 * @param {number|null} [noteOwnerId=null] - New note owner ID (optional)
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const updateSuggestion = async (id, commenterId = null, suggestionData = null, noteOwnerId = null) => {
    try {
        const response = await fetch(`/api/suggestions/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                commenterId,
                suggestionData,
                noteOwnerId
            })
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error updating suggestion:", err);
        throw err;
    }
};

/**
 * Deletes a suggestion
 * @param {number} id - Suggestion ID
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const deleteSuggestion = async (id) => {
    try {
        const response = await fetch(`/api/suggestions/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error deleting suggestion:", err);
        throw err;
    }
};

export {
    getSuggestionById,
    getSuggestionsByCommenterId,
    getSuggestionsByNoteId,
    createSuggestion,
    updateSuggestion,
    deleteSuggestion
};
