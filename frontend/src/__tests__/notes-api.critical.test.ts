import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getNoteById,
  getNotesByModule,
  getNotesByEmail,
  searchNotes,
  createNote,
  updateNote,
  verifyNote,
  unverifyNote,
  deleteNote,
} from "../api/notes";

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("Notes API critical request contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("calls getNotesByEmail with auth credentials", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, data: [] }),
    });

    await getNotesByEmail("student@bath.ac.uk");

    expect(mockFetch).toHaveBeenCalledWith("/api/notes/email/student@bath.ac.uk", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  });

  it("calls getNoteById with expected endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, data: [{ id: 7 }] }),
    });

    await getNoteById(7);

    expect(mockFetch).toHaveBeenCalledWith("/api/notes/7", expect.objectContaining({ method: "GET" }));
  });

  it("calls getNotesByModule with expected endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, data: [] }),
    });

    await getNotesByModule("CM22007");

    expect(mockFetch).toHaveBeenCalledWith("/api/notes/module/CM22007", expect.objectContaining({ method: "GET" }));
  });

  it("calls createNote with expected payload keys", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, data: { id: 10 } }),
    });

    await createNote(
      "student@bath.ac.uk",
      "Lecture 1",
      "Important summary",
      "CS101",
      { name: "lecture.pdf", type: "application/pdf", size: 1200, data: "base64-data" }
    );

    expect(mockFetch).toHaveBeenCalledWith("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        owner_email: "student@bath.ac.uk",
        title: "Lecture 1",
        note_data: "Important summary",
        module: "CS101",
        file: {
          name: "lecture.pdf",
          type: "application/pdf",
          size: 1200,
          data: "base64-data",
        },
      }),
    });
  });

  it("calls update/verify/unverify/delete note endpoints", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) });

    await updateNote(9, "new body", "CM22007", "Updated title");
    await verifyNote(9);
    await unverifyNote(9);
    await deleteNote(9);

    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/notes/9", expect.objectContaining({ method: "PUT" }));
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/notes/verify/9", expect.objectContaining({ method: "PUT" }));
    expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/notes/unverify/9", expect.objectContaining({ method: "PUT" }));
    expect(mockFetch).toHaveBeenNthCalledWith(4, "/api/notes/9", expect.objectContaining({ method: "DELETE" }));
  });

  it("calls searchNotes with query params", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, data: [] }),
    });

    await searchNotes("lecture", "student@bath.ac.uk");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/search?title=lecture&author=student%40bath.ac.uk",
      expect.objectContaining({ method: "GET", credentials: "include" })
    );
  });

  it("rethrows on fetch failures for note API methods", async () => {
    mockFetch.mockRejectedValue(new Error("network issue"));

    await expect(getNoteById(1)).rejects.toThrow("network issue");
    await expect(getNotesByModule("CM22007")).rejects.toThrow("network issue");
    await expect(getNotesByEmail("student@bath.ac.uk")).rejects.toThrow("network issue");
    await expect(createNote("student@bath.ac.uk", "t", "d", "CM22007")).rejects.toThrow("network issue");
    await expect(updateNote(1, "d", "CM22007", "t")).rejects.toThrow("network issue");
    await expect(verifyNote(1)).rejects.toThrow("network issue");
    await expect(unverifyNote(1)).rejects.toThrow("network issue");
    await expect(deleteNote(1)).rejects.toThrow("network issue");
    await expect(searchNotes("x", "y")).rejects.toThrow("network issue");
  });
});
