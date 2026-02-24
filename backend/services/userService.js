const db = require("../db");

/**
 * Retrieves a user from the database by email
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} User record matching the email or null if not found
 * @throws {Error} If the database query fails
 */
const getUser = async (email) => {
    try {
        const [rows] = await db.query("SELECT * FROM user_data WHERE email = ?", [email]);
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        throw new Error(`Error fetching user: ${err.message}`);
    }
};

/**
 * Creates a new user in the database
 * @param {string} email - User's email address
 * @param {string} passkey - User's hashed password
 * @param {number} [lecturer=0] - Whether user is a lecturer (0 or 1)
 * @param {number} [points=0] - User's initial points
 * @returns {Promise<Object>} Insert result with insertId
 * @throws {Error} If the database query fails
 */
const createUser = async (email, passkey, lecturer = 0, points = 0) => {
    try {
        const [result] = await db.query(
            "INSERT INTO user_data (email, passkey, lecturer, points) VALUES (?, ?, ?, ?)",
            [email, passkey, lecturer, points]
        );
        return result;
    } catch (err) {
        throw new Error(`Error creating user: ${err.message}`);
    }
};

/**
 * Updates an existing user's information in the database
 * @param {string} email - User's email address (used as identifier)
 * @param {string|null} [passkey=null] - New hashed password (optional)
 * @param {number|null} [lecturer=null] - New lecturer status (optional)
 * @param {number|null} [points=null] - New points value (optional)
 * @returns {Promise<Object>} Update result with affectedRows
 * @throws {Error} If the database query fails
 */
const updateUser = async (email, passkey = null, lecturer = null, points = null) => {
    try {
        const [result] = await db.query(
            "UPDATE user_data SET passkey = ?, lecturer = ?, points = ? WHERE email = ?",
            [passkey, lecturer, points, email]
        );
        return result;
    } catch (err) {
        throw new Error(`Error updating user: ${err.message}`);
    }
};

/**
 * Deletes a user from the database
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Delete result with affectedRows
 * @throws {Error} If the database query fails
 */
const deleteUser = async (email) => {
    try {
        const [result] = await db.query("DELETE FROM user_data WHERE email = ?", [email]);
        return result;
    } catch (err) {
        throw new Error(`Error deleting user: ${err.message}`);
    }
};

module.exports = {
    getUser,
    createUser,
    updateUser,
    deleteUser
};