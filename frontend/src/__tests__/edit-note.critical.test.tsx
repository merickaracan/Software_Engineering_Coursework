/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EditNotePage from "../pages/EditNotePage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: "12" }),
  };
});

vi.mock("../components/PageHeader", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

const modalConfirmMock = vi.fn();

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  const Select = ({ value, onChange, options, placeholder }: { value?: string; onChange?: (v: string) => void; options?: Array<{ value: string; label: string }>; placeholder?: string }) => (
    <select aria-label={placeholder || "Select"} value={value || ""} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">--select--</option>
      {(options || []).map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  return {
    ...actual,
    Select,
    Modal: {
      ...actual.Modal,
      confirm: (...args: unknown[]) => modalConfirmMock(...args),
    },
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

import { message } from "antd";

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("EditNotePage critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "owner@bath.ac.uk" }));
  });

  it("shows access denied for non-owner", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ data: [{ id: 12, email: "other@bath.ac.uk", note_title: "N", note_data: "D", module: "se", verified: 0, rating_average: 0, number_ratings: 0 }] }),
      })
      .mockResolvedValueOnce({ json: async () => ({ data: [] }) });

    render(
      <MemoryRouter>
        <EditNotePage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/access denied/i)).toBeInTheDocument();
  });

  it("saves note updates for owner", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ data: [{ id: 12, email: "owner@bath.ac.uk", note_title: "Old", note_data: "Old body", module: "se", verified: 0, rating_average: 0, number_ratings: 0 }] }),
      })
      .mockResolvedValueOnce({ json: async () => ({ data: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    render(
      <MemoryRouter>
        <EditNotePage />
      </MemoryRouter>
    );

    const titleInput = await screen.findByPlaceholderText(/enter note title/i);
    fireEvent.change(titleInput, { target: { value: "Updated title" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/notes/12",
        expect.objectContaining({ method: "PUT", credentials: "include" })
      );
    });

    expect(message.success).toHaveBeenCalledWith("Note updated successfully!");
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/note/12", { replace: true });
    }, { timeout: 1500 });
  });

  it("shows note not found when note payload is empty", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ data: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ data: [] }) });

    render(
      <MemoryRouter>
        <EditNotePage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/note not found/i)).toBeInTheDocument();
  });

  it("deletes note after confirm", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ data: [{ id: 12, email: "owner@bath.ac.uk", note_title: "Old", note_data: "Old body", module: "se", verified: 0, rating_average: 0, number_ratings: 0 }] }),
      })
      .mockResolvedValueOnce({ json: async () => ({ data: [] }) })
      .mockResolvedValueOnce({ ok: true });

    modalConfirmMock.mockImplementationOnce(({ onOk }: { onOk: () => Promise<void> }) => {
      void onOk();
    });

    render(
      <MemoryRouter>
        <EditNotePage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole("button", { name: /delete note/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/12", {
        method: "DELETE",
        credentials: "include",
      });
      expect(message.success).toHaveBeenCalledWith("Note deleted.");
      expect(navigateMock).toHaveBeenCalledWith("/my-notes");
    });
  });
});
