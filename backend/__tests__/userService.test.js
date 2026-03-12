const {
  getUser,
  getUserPublic,
  getUserByEmail,
  createUser,
  updateUser,
  updateUserProfile,
  deleteUser,
} = require("../services/userService");
const db = require("../database/db");

jest.mock("../database/db");

describe("userService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUser", () => {
    it("fetches a user by email", async () => {
      const email = "user@bath.ac.uk";
      const mockUser = {
        email,
        name: "Test User",
        passkey: "hashed_password",
        lecturer: 0,
        points: 100,
      };

      db.query.mockResolvedValueOnce([[mockUser]]);

      await expect(getUser(email)).resolves.toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM user_data WHERE email = ?", [email]);
    });
  });

  describe("getUserPublic", () => {
    it("returns public user fields", async () => {
      const email = "user@bath.ac.uk";
      const mockUser = { email, name: "Test User", lecturer: 0, points: 100 };

      db.query.mockResolvedValueOnce([[mockUser]]);

      await expect(getUserPublic(email)).resolves.toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT email, name, lecturer, points FROM user_data WHERE email = ?",
        [email]
      );
    });
  });

  describe("getUserByEmail", () => {
    it("returns extended public user fields", async () => {
      const email = "user@bath.ac.uk";
      const mockUser = { email, name: "Test User", lecturer: 0, points: 100, profile_picture: null };

      db.query.mockResolvedValueOnce([[mockUser]]);

      await expect(getUserByEmail(email)).resolves.toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT email, name, lecturer, points, profile_picture FROM user_data WHERE email = ?",
        [email]
      );
    });
  });

  describe("createUser", () => {
    it("creates a user with default values", async () => {
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      await expect(createUser("newuser@bath.ac.uk", "hashed_password", "New User")).resolves.toEqual({ insertId: 1 });
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO user_data (email, passkey, name, lecturer, points) VALUES (?, ?, ?, ?, ?)",
        ["newuser@bath.ac.uk", "hashed_password", "New User", 0, 0]
      );
    });
  });

  describe("updateUser", () => {
    it("updates passkey, lecturer, and points", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await expect(updateUser("user@bath.ac.uk", "new_hash", 1, 200)).resolves.toEqual({ affectedRows: 1 });
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE user_data SET passkey = ?, lecturer = ?, points = ? WHERE email = ?",
        ["new_hash", 1, 200, "user@bath.ac.uk"]
      );
    });
  });

  describe("updateUserProfile", () => {
    it("updates only provided fields", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await expect(updateUserProfile("user@bath.ac.uk", { name: "Updated Name" })).resolves.toEqual({ affectedRows: 1 });
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE user_data SET name = ? WHERE email = ?",
        ["Updated Name", "user@bath.ac.uk"]
      );
    });

    it("returns zero affected rows when no updates are provided", async () => {
      await expect(updateUserProfile("user@bath.ac.uk", {})).resolves.toEqual({ affectedRows: 0 });
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("deletes a user", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await expect(deleteUser("user@bath.ac.uk")).resolves.toEqual({ affectedRows: 1 });
      expect(db.query).toHaveBeenCalledWith("DELETE FROM user_data WHERE email = ?", ["user@bath.ac.uk"]);
    });
  });
});
