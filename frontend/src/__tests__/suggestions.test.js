import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSuggestionById,
  getSuggestionsByCommenterId,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
} from "../api/suggestions";

// Mock fetch globally
global.fetch = vi.fn();

describe("suggestions API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSuggestionById", () => {
    it("should fetch a suggestion by ID successfully", async () => {
      const mockSuggestion = {
        ok: true,
        data: [{ id: 1, commenterId: 10, suggestionData: "Great note!" }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockSuggestion,
      });

      const result = await getSuggestionById(1);

      expect(fetch).toHaveBeenCalledWith("/api/suggestions/1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockSuggestion);
    });

    it("should handle errors when fetching suggestion", async () => {
      fetch.mockRejectedValueOnce(new Error("Fetch failed"));

      await expect(getSuggestionById(1)).rejects.toThrow("Fetch failed");
    });
  });

  describe("getSuggestionsByCommenterId", () => {
    it("should fetch suggestions by commenter ID successfully", async () => {
      const mockSuggestions = {
        ok: true,
        data: [
          { id: 1, commenterId: 10, suggestionData: "Good suggestion" },
          { id: 2, commenterId: 10, suggestionData: "Another suggestion" },
        ],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      const result = await getSuggestionsByCommenterId(10);

      expect(fetch).toHaveBeenCalledWith("/api/suggestions/commenter/10", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockSuggestions);
    });

    it("should return empty array for user with no suggestions", async () => {
      const mockSuggestions = {
        ok: true,
        data: [],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      const result = await getSuggestionsByCommenterId(999);

      expect(result.data).toEqual([]);
    });
  });

  describe("createSuggestion", () => {
    it("should create a suggestion successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Suggestion created",
        insertId: 5,
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await createSuggestion(10, "Consider adding more examples", 5);

      expect(fetch).toHaveBeenCalledWith("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          commenterId: 10,
          suggestionData: "Consider adding more examples",
          noteOwnerId: 5,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle creation errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Creation failed"));

      await expect(createSuggestion(10, "Suggestion", 5)).rejects.toThrow("Creation failed");
    });

    it("should handle invalid parameters", async () => {
      const mockError = { ok: false, error: "Invalid data" };

      fetch.mockResolvedValueOnce({
        json: async () => mockError,
      });

      const result = await createSuggestion(null, "", null);

      expect(result).toEqual(mockError);
    });
  });

  describe("updateSuggestion", () => {
    it("should update suggestion successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Suggestion updated",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await updateSuggestion(1, 10, "Updated suggestion text", 5);

      expect(fetch).toHaveBeenCalledWith("/api/suggestions/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          commenterId: 10,
          suggestionData: "Updated suggestion text",
          noteOwnerId: 5,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle partial updates", async () => {
      const mockResponse = { ok: true };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await updateSuggestion(1, null, "Updated text only", null);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/suggestions/1"),
        expect.objectContaining({
          method: "PUT",
        })
      );
    });

    it("should handle update errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Update failed"));

      await expect(updateSuggestion(1, 10, "Text")).rejects.toThrow("Update failed");
    });
  });

  describe("deleteSuggestion", () => {
    it("should delete suggestion successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Suggestion deleted",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await deleteSuggestion(1);

      expect(fetch).toHaveBeenCalledWith("/api/suggestions/1", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle deletion errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Delete failed"));

      await expect(deleteSuggestion(1)).rejects.toThrow("Delete failed");
    });

    it("should handle not found errors", async () => {
      const mockError = { ok: false, error: "Suggestion not found" };

      fetch.mockResolvedValueOnce({
        json: async () => mockError,
      });

      const result = await deleteSuggestion(999);

      expect(result).toEqual(mockError);
    });
  });
});
