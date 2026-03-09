const db = require("../db");

/**
 * Retrieves a user from the database by email (includes password hash)
 * Internal use only - for authentication
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
 * Retrieves a user's public profile (excludes password hash)
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} User record without password_hash or null if not found
 * @throws {Error} If the database query fails
 */
const getUserPublic = async (email) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, is_lecturer, points, profile_picture FROM user_data WHERE email = ?",
            [email]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        throw new Error(`Error fetching user: ${err.message}`);
    }
};

/**
 * Retrieves a user by ID (excludes password hash)
 * @param {number} id - User's ID
 * @returns {Promise<Object|null>} User record without password_hash or null if not found
 * @throws {Error} If the database query fails
 */
const getUserById = async (id) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, is_lecturer, points, profile_picture FROM user_data WHERE id = ?",
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        throw new Error(`Error fetching user: ${err.message}`);
    }
};

/**
 * Creates a new user in the database
 * @param {string} email - User's email address
 * @param {string} name - User's full name
 * @param {string} password_hash - User's hashed password
 * @param {number} [is_lecturer=0] - Whether user is a lecturer (0 or 1)
 * @param {number} [points=0] - User's initial points
 * @returns {Promise<Object>} Insert result with insertId
 * @throws {Error} If the database query fails
 */
const createUser = async (email, name, password_hash, is_lecturer = 0, points = 0) => {
    try {
        const [result] = await db.query(
            "INSERT INTO user_data (email, name, password_hash, is_lecturer, points) VALUES (?, ?, ?, ?, ?)",
            [email, name, password_hash, is_lecturer, points]
        );
        return result;
    } catch (err) {
        throw new Error(`Error creating user: ${err.message}`);
    }
};

/**
 * Updates an existing user's information in the database
 * @param {string} email - User's email address (used as identifier)
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - User's full name
 * @param {string} [updates.password_hash] - New hashed password
 * @param {number} [updates.is_lecturer] - New lecturer status (0 or 1)
 * @param {number} [updates.points] - New points value
 * @returns {Promise<Object>} Update result with affectedRows
 * @throws {Error} If the database query fails
 */
const updateUser = async (email, updates = {}) => {
    try {
        const { name, password_hash, is_lecturer, points } = updates;
        const [result] = await db.query(
            "UPDATE user_data SET name = ?, password_hash = ?, is_lecturer = ?, points = ? WHERE email = ?",
            [name, password_hash, is_lecturer, points, email]
        );
        return result;
    } catch (err) {
        throw new Error(`Error updating user: ${err.message}`);
    }
};

/**
 * Updates user profile information (non-sensitive fields)
 * @param {string} email - User's email address
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - User's full name
 * @param {string} [updates.profile_picture] - User's profile picture (base64)
 * @returns {Promise<Object>} Update result with affectedRows
 * @throws {Error} If the database query fails
 */
const updateUserProfile = async (email, updates = {}) => {
    try {
        const { name, profile_picture } = updates;
        const fields = [];
        const values = [];
        
        if (name !== undefined) {
            fields.push("name = ?");
            values.push(name);
        }
        if (profile_picture !== undefined) {
            fields.push("profile_picture = ?");
            values.push(profile_picture || null);
        }
        
        if (fields.length === 0) {
            return { affectedRows: 0 };
        }
        
        values.push(email);
        const query = `UPDATE user_data SET ${fields.join(", ")} WHERE email = ?`;
        const [result] = await db.query(query, values);
        return result;
    } catch (err) {
        throw new Error(`Error updating user profile: ${err.message}`);
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
    getUserPublic,
    getUserById,
    createUser,
    updateUser,
    updateUserProfile,
    deleteUser
};