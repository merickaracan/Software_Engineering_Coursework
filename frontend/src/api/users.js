/**
 * Creates a new user in the database
 * @param {string} email - User's email address
 * @param {string} password - User's password (will be hashed on backend)
 * @param {number} [lecturer=0] - Whether user is a lecturer (0 or 1)
 * @param {number} [points=0] - User's initial points
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const createUser = async (email, password, lecturer=0, points=0) => {
    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                lecturer,
                points
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
 * @param {string|null} [password=null] - New password (optional, will be hashed on backend)
 * @param {number|null} [lecturer=null] - New lecturer status (optional)
 * @param {number|null} [points=null] - New points value (optional)
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const updateUser = async (email, password=null, lecturer=null, points=null) => {
    try{
        const response = await fetch(`/api/users/${email}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password,
                lecturer,
                points
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

export { createUser, getUser, updateUser, deleteUser };