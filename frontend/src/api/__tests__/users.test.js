import { describe, it, expect, beforeEach, vi } from "vitest";
import { createUser, getUser, updateUser, deleteUser } from "../users";

// Mock fetch globally
global.fetch = vi.fn();

describe("users API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Account created successfully",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await createUser("user@bath.ac.uk", "password123", 0, 0);

      expect(fetch).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@bath.ac.uk",
          password: "password123",
          lecturer: 0,
          points: 0,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle creation errors", async () => {
      const mockError = new Error("Network error");
      fetch.mockRejectedValueOnce(mockError);

      await expect(createUser("user@bath.ac.uk", "password123")).rejects.toThrow("Network error");
    });
  });

  describe("getUser", () => {
    it("should fetch user data successfully", async () => {
      const mockUser = {
        ok: true,
        data: [{ email: "user@bath.ac.uk", lecturer: 0, points: 100 }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockUser,
      });

      const result = await getUser("user@bath.ac.uk");

      expect(fetch).toHaveBeenCalledWith("/api/users/user@bath.ac.uk", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      expect(result).toEqual(mockUser);
    });

    it("should handle fetch errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Fetch failed"));

      await expect(getUser("user@bath.ac.uk")).rejects.toThrow("Fetch failed");
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "User updated",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await updateUser("user@bath.ac.uk", "newpass123", 1, 150);

      expect(fetch).toHaveBeenCalledWith("/api/users/user@bath.ac.uk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          password: "newpass123",
          lecturer: 1,
          points: 150,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should update with partial fields", async () => {
      const mockResponse = { ok: true };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await updateUser("user@bath.ac.uk", null, 1, null);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/user@bath.ac.uk"),
        expect.objectContaining({
          method: "PUT",
        })
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "User deleted",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await deleteUser("user@bath.ac.uk");

      expect(fetch).toHaveBeenCalledWith("/api/users/user@bath.ac.uk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle deletion errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Delete failed"));

      await expect(deleteUser("user@bath.ac.uk")).rejects.toThrow("Delete failed");
    });
  });
});
