/**
 * Creates a new user in the database
 * @param {string} email - User's email address
 * @param {string} name - User's full name
 * @param {string} passwordHash - User's hashed password
 * @param {number} [isLecturer=0] - Whether user is a lecturer (0 or 1)
 * @param {number} [points=0] - User's initial points
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const createUser = async (email, name, passwordHash, isLecturer=0, points=0) => {
    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                name: name,
                password_hash: passwordHash,
                is_lecturer: isLecturer,
                points: points
            })
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error creating user:", err);
        throw err;
    }
};

/**
 * Retrieves a user from the database by email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} User object containing email, lecturer status, and points
 * @throws {Error} If the request fails or user not found
 */
const getUser = async (email) => {
    try {
        const response = await fetch(`/api/users/${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"});
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching user:", err);
        throw err;
    }
};

/**
 * Updates an existing user's information
 * @param {string} email - User's email address (used as identifier)
 * @param {string|null} [name=null] - User's full name (optional)
 * @param {string|null} [passwordHash=null] - New hashed password (optional)
 * @param {number|null} [isLecturer=null] - New lecturer status (optional)
 * @param {number|null} [points=null] - New points value (optional)
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const updateUser = async (email, name=null, passwordHash=null, isLecturer=null, points=null) => {
    try{
        const response = await fetch(`/api/users/${email}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                password_hash: passwordHash,
                is_lecturer: isLecturer,
                points: points
            }),
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err){
        console.error("Error updating user:", err);
        throw err;
    }
}

/**
 * Updates a user's profile picture
 * @param {string} email - User's email address
 * @param {string|null} profilePicture - Base64 data URL for image (or null to clear)
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const updateProfilePicture = async (email, profilePicture = null) => {
    try {
        const response = await fetch(`/api/users/${email}/profile-picture`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                profile_picture: profilePicture,
            }),
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error updating profile picture:", err);
        throw err;
    }
};

/**
 * Deletes a user from the database
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const deleteUser = async (email) => {
    try { 
        const response = await fetch(`/api/users/${email}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error deleting user:", err);
        throw err;
    }
}

export { createUser, getUser, updateUser, updateProfilePicture, deleteUser };