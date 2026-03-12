import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNotesByEmail, createNote } from "../api/notes";

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
});
