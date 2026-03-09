import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getNoteById,
  getNotesByModule,
  getNotesByEmail,
  createNote,
  updateNote,
  verifyNote,
  unverifyNote,
  deleteNote,
  searchNotes,
} from "../api/notes";

// Mock fetch globally
global.fetch = vi.fn();

describe("notes API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNoteById", () => {
    it("should fetch a note by ID successfully", async () => {
      const mockNote = {
        ok: true,
        data: [{ id: 1, ownerEmail: "user@bath.ac.uk", module: "M1", noteData: "Test note" }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockNote,
      });

      const result = await getNoteById(1);

      expect(fetch).toHaveBeenCalledWith("/api/notes/1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockNote);
    });

    it("should handle errors when fetching note", async () => {
      fetch.mockRejectedValueOnce(new Error("Fetch failed"));

      await expect(getNoteById(1)).rejects.toThrow("Fetch failed");
    });
  });

  describe("getNotesByModule", () => {
    it("should fetch notes by module successfully", async () => {
      const mockNotes = {
        ok: true,
        data: [{ id: 1, module: "M1" }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockNotes,
      });

      const result = await getNotesByModule("M1");

      expect(fetch).toHaveBeenCalledWith("/api/notes/module/M1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockNotes);
    });
  });

  describe("getNotesByEmail", () => {
    it("should fetch notes by email successfully", async () => {
      const mockNotes = {
        ok: true,
        data: [{ id: 1, ownerEmail: "user@bath.ac.uk" }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockNotes,
      });

      const result = await getNotesByEmail("user@bath.ac.uk");

      expect(fetch).toHaveBeenCalledWith("/api/notes/email/user@bath.ac.uk", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockNotes);
    });
  });

  describe("createNote", () => {
    it("should create a note successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Note created",
        insertId: 1,
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await createNote("user@bath.ac.uk", "My Note Title", "My note content", "M1", null);

      expect(fetch).toHaveBeenCalledWith("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          owner_email: "user@bath.ac.uk",
          title: "My Note Title",
          note_data: "My note content",
          module: "M1",
          file: null,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle creation errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Creation failed"));

      await expect(createNote("user@bath.ac.uk", "Title", "Note", "M1")).rejects.toThrow("Creation failed");
    });
  });

  describe("updateNote", () => {
    it("should update note successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Note updated",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await updateNote(1, "Updated Title", "Updated content", "M2", null);

      expect(fetch).toHaveBeenCalledWith("/api/notes/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "Updated Title",
          note_data: "Updated content",
          module: "M2",
          file: null,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle partial updates", async () => {
      const mockResponse = { ok: true };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await updateNote(1, "Updated content", null);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/notes/1"),
        expect.objectContaining({
          method: "PUT",
        })
      );
    });
  });

  describe("verifyNote", () => {
    it("should verify note successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Note verified",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await verifyNote(1);

      expect(fetch).toHaveBeenCalledWith("/api/notes/verify/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("unverifyNote", () => {
    it("should unverify note successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Note unverified",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await unverifyNote(1);

      expect(fetch).toHaveBeenCalledWith("/api/notes/unverify/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteNote", () => {
    it("should delete note successfully", async () => {
      const mockResponse = {
        ok: true,
        message: "Note deleted",
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await deleteNote(1);

      expect(fetch).toHaveBeenCalledWith("/api/notes/1", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle deletion errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Delete failed"));

      await expect(deleteNote(1)).rejects.toThrow("Delete failed");
    });
  });

  describe("searchNotes", () => {
    it("should search notes by title successfully", async () => {
      const mockNotes = {
        ok: true,
        data: [{ id: 1, title: "Software Engineering Notes", module: "se" }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockNotes,
      });

      const result = await searchNotes("Software", "");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/search?title=Software"),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      expect(result).toEqual(mockNotes);
    });

    it("should search notes by author successfully", async () => {
      const mockNotes = {
        ok: true,
        data: [{ id: 1, ownerEmail: "user@bath.ac.uk" }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockNotes,
      });

      const result = await searchNotes("", "user@bath.ac.uk");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/search?author=user%40bath.ac.uk"),
        expect.any(Object)
      );
      expect(result).toEqual(mockNotes);
    });

    it("should search notes by both title and author", async () => {
      const mockNotes = {
        ok: true,
        data: [{ id: 1, title: "ML Notes", ownerEmail: "user@bath.ac.uk" }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockNotes,
      });

      const result = await searchNotes("ML", "user@bath.ac.uk");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("title=ML"),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("author=user%40bath.ac.uk"),
        expect.any(Object)
      );
      expect(result).toEqual(mockNotes);
    });

    it("should handle empty search results", async () => {
      const mockResponse = {
        ok: true,
        data: [],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await searchNotes("Nonexistent", "");

      expect(result.data).toEqual([]);
    });

    it("should handle search errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Search failed"));

      await expect(searchNotes("test", "")).rejects.toThrow("Search failed");
    });

    it("should search with empty parameters", async () => {
      const mockNotes = {
        ok: true,
        data: [{ id: 1 }, { id: 2 }],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockNotes,
      });

      const result = await searchNotes("", "");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/search"),
        expect.any(Object)
      );
      expect(result).toEqual(mockNotes);
    });
  });
});
