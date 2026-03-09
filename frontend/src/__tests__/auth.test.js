import { describe, it, expect, beforeEach, vi } from "vitest";
import { getUserByEmail, logout } from "../api/auth";

// Mock fetch globally
global.fetch = vi.fn();

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserByEmail", () => {
    it("should fetch user by email successfully", async () => {
      const mockUser = {
        ok: true,
        data: [{ name: "Test User", email: "user@bath.ac.uk", id: 1, is_lecturer: 0 }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockUser,
      });

      const result = await getUserByEmail("user@bath.ac.uk");

      expect(fetch).toHaveBeenCalledWith("/api/users/user@bath.ac.uk", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockUser);
    });

    it("should handle errors when fetching user", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(getUserByEmail("user@bath.ac.uk")).rejects.toThrow("Network error");
    });

    it("should handle user not found", async () => {
      const mockResponse = {
        ok: false,
        error: "User not found",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await getUserByEmail("nonexistent@bath.ac.uk");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("User not found");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Logged out successfully",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await logout();

      expect(fetch).toHaveBeenCalledWith("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle logout errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Logout failed"));

      await expect(logout()).rejects.toThrow("Logout failed");
    });

    it("should handle server errors during logout", async () => {
      const mockResponse = {
        ok: false,
        error: "Server error",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await logout();

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Server error");
    });
  });
});
