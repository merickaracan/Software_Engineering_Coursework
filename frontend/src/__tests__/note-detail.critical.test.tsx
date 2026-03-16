/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NoteDetailPage from "../pages/NoteDetailPage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: "77" }),
  };
});

vi.mock("../components/PageHeader", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

import { message } from "antd";

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("NoteDetailPage critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
  });

  it("shows not-found state when note lookup fails", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "student@bath.ac.uk", role: "student" }));

    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/api/users/")) {
        return { json: async () => ({ ok: true, data: [{ lecturer: 0 }] }) };
      }
      if (url === "/api/notes/77") {
        return { json: async () => ({ ok: false, data: [] }) };
      }
      return { json: async () => ({ ok: true, data: [] }) };
    });

    render(
      <MemoryRouter>
        <NoteDetailPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/note not found/i)).toBeInTheDocument();
  });

  it("lets lecturer verify and post a comment", async () => {
    localStorage.setItem("user", JSON.stringify({ id: 5, email: "teacher@bath.ac.uk", role: "teacher", lecturer: 1 }));

    let comments = [
      {
        id: 1,
        note_id: 77,
        commenter_id: 8,
        suggestion_data: "Great structure",
        commenter_name: "Alice",
        lecturer: 0,
      },
    ];

    mockFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url.includes("/api/users/teacher%40bath.ac.uk")) {
        return { json: async () => ({ ok: true, data: [{ lecturer: 1 }] }) };
      }

      if (url === "/api/notes/77") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            data: [
              {
                id: 77,
                note_title: "Distributed Algorithms",
                note_data: "Consensus notes",
                module: "se",
                email: "student@bath.ac.uk",
                verified: 0,
                rating_average: 3.5,
                number_ratings: 2,
              },
            ],
          }),
        };
      }

      if (url === "/api/suggestions/note/77" && (!options || options.method === undefined)) {
        return { json: async () => ({ ok: true, data: comments }) };
      }

      if (url === "/api/notes/77/files") {
        return { json: async () => ({ ok: true, data: [] }) };
      }

      if (url.includes("/api/notes/77/rating/teacher%40bath.ac.uk")) {
        return { json: async () => ({ rated: false }) };
      }

      if (url === "/api/notes/verify/77") {
        return { json: async () => ({ ok: true }) };
      }

      if (url === "/api/suggestions" && options?.method === "POST") {
        comments = [
          ...comments,
          {
            id: 2,
            note_id: 77,
            commenter_id: 5,
            suggestion_data: "Thanks for sharing",
            commenter_name: "Teacher",
            lecturer: 1,
          },
        ];
        return { ok: true, json: async () => ({ ok: true }) };
      }

      return { ok: true, json: async () => ({ ok: true, data: [] }) };
    });

    render(
      <MemoryRouter>
        <NoteDetailPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Distributed Algorithms")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /teacher verify/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/verify/77", {
        method: "PUT",
        credentials: "include",
      });
      expect(message.success).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByPlaceholderText(/write a comment/i), {
      target: { value: "Thanks for sharing" },
    });
    fireEvent.click(screen.getByRole("button", { name: /post/i }));

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith("Comment added");
    });
    expect(await screen.findByText("Thanks for sharing")).toBeInTheDocument();
  });
});
