/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import Login from "../pages/Login";

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

import { message } from "antd";

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

describe("Login", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.clearAllMocks();
  });

  it("submits credentials and sets auth on success", async () => {
    const setIsAuthenticated = vi.fn();

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Login setIsAuthenticated={setIsAuthenticated} />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@bath.ac.uk" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    });

    const [submitButton] = screen
      .getAllByRole("button", { name: /login/i })
      .filter((button) => (button as HTMLButtonElement).type === "submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: "user@bath.ac.uk",
          password: "Password123!",
        }),
      });
    });

    expect(setIsAuthenticated).toHaveBeenCalledWith(true);
    expect(message.success).toHaveBeenCalled();
  });

  it("shows error when login fails", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: false, message: "Invalid credentials" }),
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Login setIsAuthenticated={vi.fn()} />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@bath.ac.uk" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    });

    const [submitButton] = screen
      .getAllByRole("button", { name: /login/i })
      .filter((button) => (button as HTMLButtonElement).type === "submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });
});
