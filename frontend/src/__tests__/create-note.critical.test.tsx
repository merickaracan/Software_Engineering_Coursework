/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateNotePage from "../pages/CreateNotePage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
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
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

import { message } from "antd";

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("CreateNotePage critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "student@bath.ac.uk" }));
  });

  it("validates missing title", () => {
    render(
      <MemoryRouter>
        <CreateNotePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create note/i }));
    expect(message.error).toHaveBeenCalledWith("Please enter a note title.");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("validates missing module", () => {
    render(
      <MemoryRouter>
        <CreateNotePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter note title/i), {
      target: { value: "My New Note" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create note/i }));
    expect(message.error).toHaveBeenCalledWith("Please select a module.");
  });

  it("creates a note and navigates to module page", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ insertId: 123 }),
    });

    render(
      <MemoryRouter>
        <CreateNotePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter note title/i), {
      target: { value: "Distributed Systems" },
    });
    fireEvent.change(screen.getByPlaceholderText(/add a description or summary/i), {
      target: { value: "Revision notes" },
    });
    fireEvent.change(screen.getByLabelText(/select a module/i), {
      target: { value: "CM22007" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create note/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/notes",
        expect.objectContaining({ method: "POST", credentials: "include" })
      );
    });

    expect(message.success).toHaveBeenCalledWith("Note created successfully!");

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/modules/CM22007");
    }, { timeout: 1500 });
  });
});
