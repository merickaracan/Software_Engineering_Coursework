/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import CreateNotePage from "../pages/CreateNotePage";

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

describe("CreateNotePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "user@bath.ac.uk", id: 1 }));
  });

  it("renders create note page", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <CreateNotePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Create Note" })).toBeInTheDocument();
    expect(screen.getByText(/upload file \(optional\)/i)).toBeInTheDocument();
  });

  it("shows validation error when title is empty", async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <CreateNotePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create note/i }));

    const { message } = await import("antd");
    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
  });
});
