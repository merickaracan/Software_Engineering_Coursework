/**
 * Fetches user details by email
 * @param {string} email - User's email
 * @returns {Promise<Object>} User object with name, email, etc.
 * @throws {Error} If the request fails
 */
const getUserByEmail = async (email) => {
    try {
        const response = await fetch(`/api/users/${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching user details:", err);
        throw err;
    }
};

/**
 * Logs out the current user
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If the request fails
 */
const logout = async () => {
    try {
        const response = await fetch("/api/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error logging out:", err);
        throw err;
    }
};

export { getUserByEmail, logout };
