import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUserByEmail,
  logout,
} from "../api/auth";
import {
  createUser,
  getUser,
  updateUser,
  updateProfilePicture,
  deleteUser,
} from "../api/users";
import {
  getSuggestionById,
  getSuggestionsByCommenterId,
  getSuggestionsByNoteId,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
} from "../api/suggestions";

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("API clients critical contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("calls auth API endpoints with expected payloads", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [{ email: "u@bath.ac.uk" }] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) });

    await getUserByEmail("u@bath.ac.uk");
    await logout();

    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/users/u@bath.ac.uk", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  });

  it("calls users API endpoints with expected payloads", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) });

    await createUser("u@bath.ac.uk", "User", "hash", 1, 10);
    await getUser("u@bath.ac.uk");
    await updateUser("u@bath.ac.uk", "Name", "newHash", 1, 20);
    await updateProfilePicture("u@bath.ac.uk", "data:image/png;base64,abc");
    await deleteUser("u@bath.ac.uk");

    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/users", expect.objectContaining({ method: "POST" }));
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/users/u@bath.ac.uk", expect.objectContaining({ method: "GET" }));
    expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/users/u@bath.ac.uk", expect.objectContaining({ method: "PUT" }));
    expect(mockFetch).toHaveBeenNthCalledWith(4, "/api/users/u@bath.ac.uk/profile-picture", expect.objectContaining({ method: "PUT" }));
    expect(mockFetch).toHaveBeenNthCalledWith(5, "/api/users/u@bath.ac.uk", expect.objectContaining({ method: "DELETE" }));
  });

  it("calls suggestion API endpoints with expected payloads", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) });

    await getSuggestionById(1);
    await getSuggestionsByCommenterId(10);
    await getSuggestionsByNoteId(5);
    await createSuggestion(10, "Looks good", 5);
    await updateSuggestion(7, 10, "Updated", 9);
    await deleteSuggestion(7);

    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/suggestions/1", expect.objectContaining({ method: "GET" }));
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/suggestions/commenter/10", expect.objectContaining({ method: "GET" }));
    expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/suggestions/note/5", expect.objectContaining({ method: "GET" }));
    expect(mockFetch).toHaveBeenNthCalledWith(4, "/api/suggestions", expect.objectContaining({ method: "POST" }));
    expect(mockFetch).toHaveBeenNthCalledWith(5, "/api/suggestions/7", expect.objectContaining({ method: "PUT" }));
    expect(mockFetch).toHaveBeenNthCalledWith(6, "/api/suggestions/7", expect.objectContaining({ method: "DELETE" }));
  });

  it("rethrows fetch errors for API clients", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    await expect(getUserByEmail("x@bath.ac.uk")).rejects.toThrow("network down");
    await expect(getUser("x@bath.ac.uk")).rejects.toThrow("network down");
    await expect(getSuggestionById(123)).rejects.toThrow("network down");
  });
});
