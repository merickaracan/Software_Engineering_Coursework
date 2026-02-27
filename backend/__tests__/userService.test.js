const {
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../services/userService");
const db = require("../db");

jest.mock("../db");

describe("userService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUser", () => {
    it("should fetch a user by email", async () => {
      const email = "user@bath.ac.uk";
      const mockUser = {
        email,
        passkey: "hashed_password",
        lecturer: 0,
        points: 100,
      };

      db.query.mockResolvedValueOnce([[mockUser]]);

      const result = await getUser(email);

      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM user_data WHERE email = ?", [
        email,
      ]);
    });

    it("should return null if user not found", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const result = await getUser("notfound@bath.ac.uk");

      expect(result).toBeNull();
    });

    it("should throw error on database failure", async () => {
      db.query.mockRejectedValueOnce(new Error("DB error"));

      await expect(getUser("user@bath.ac.uk")).rejects.toThrow(
        "Error fetching user: DB error"
      );
    });
  });

  describe("createUser", () => {
    it("should create a user with default values", async () => {
      const email = "newuser@bath.ac.uk";
      const passkey = "hashed_password";

      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await createUser(email, passkey);

      expect(result).toEqual({ insertId: 1 });
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO user_data (email, passkey, lecturer, points) VALUES (?, ?, ?, ?)",
        [email, passkey, 0, 0]
      );
    });

    it("should create a user with custom values", async () => {
      const email = "lecturer@bath.ac.uk";
      const passkey = "hashed_password";

      db.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const result = await createUser(email, passkey, 1, 500);

      expect(result).toEqual({ insertId: 2 });
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO user_data (email, passkey, lecturer, points) VALUES (?, ?, ?, ?)",
        [email, passkey, 1, 500]
      );
    });

    it("should throw error on duplicate email", async () => {
      db.query.mockRejectedValueOnce(new Error("Duplicate entry"));

      await expect(createUser("user@bath.ac.uk", "password")).rejects.toThrow(
        "Error creating user: Duplicate entry"
      );
    });
  });

  describe("updateUser", () => {
    it("should update user with all fields", async () => {
      const email = "user@bath.ac.uk";

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await updateUser(email, "new_password", 1, 200);

      expect(result).toEqual({ affectedRows: 1 });
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE user_data SET passkey = ?, lecturer = ?, points = ? WHERE email = ?",
        ["new_password", 1, 200, email]
      );
    });

    it("should update user with partial fields (null values)", async () => {
      const email = "user@bath.ac.uk";

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await updateUser(email, null, 1, null);

      expect(result).toEqual({ affectedRows: 1 });
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE user_data SET passkey = ?, lecturer = ?, points = ? WHERE email = ?",
        [null, 1, null, email]
      );
    });

    it("should throw error on database failure", async () => {
      db.query.mockRejectedValueOnce(new Error("Update failed"));

      await expect(updateUser("user@bath.ac.uk", "password")).rejects.toThrow(
        "Error updating user: Update failed"
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      const email = "user@bath.ac.uk";

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await deleteUser(email);

      expect(result).toEqual({ affectedRows: 1 });
      expect(db.query).toHaveBeenCalledWith("DELETE FROM user_data WHERE email = ?", [
        email,
      ]);
    });

    it("should return 0 affectedRows if user not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await deleteUser("notfound@bath.ac.uk");

      expect(result).toEqual({ affectedRows: 0 });
    });

    it("should throw error on database failure", async () => {
      db.query.mockRejectedValueOnce(new Error("Delete failed"));

      await expect(deleteUser("user@bath.ac.uk")).rejects.toThrow(
        "Error deleting user: Delete failed"
      );
    });
  });
});
