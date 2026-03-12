/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import Login from "../pages/Login";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

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
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

function renderLogin(setIsAuthenticated = vi.fn()) {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Login setIsAuthenticated={setIsAuthenticated} />
      </ThemeProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "student@bath.ac.uk" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Password123!" },
  });

  const submitButton = screen
    .getAllByRole("button", { name: /login/i })
    .find((button) => (button as HTMLButtonElement).type === "submit");

  if (!submitButton) {
    throw new Error("Login submit button not found");
  }

  fireEvent.click(submitButton);
}

describe("Login critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockReset();
  });

  it("posts credentials and navigates to dashboard on success", async () => {
    const setIsAuthenticated = vi.fn();

    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        user: {
          id: 1,
          name: "Student User",
          email: "student@bath.ac.uk",
          role: "student",
        },
      }),
    });

    renderLogin(setIsAuthenticated);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: "student@bath.ac.uk",
          password: "Password123!",
        }),
      });
    });

    expect(setIsAuthenticated).toHaveBeenCalledWith(true);
    expect(localStorage.getItem("user")).toContain("student@bath.ac.uk");
    expect(message.success).toHaveBeenCalledWith("Logged in successfully");

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
    }, { timeout: 2000 });
  });

  it("shows backend error and does not authenticate when login fails", async () => {
    const setIsAuthenticated = vi.fn();

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: false, message: "Invalid credentials" }),
    });

    renderLogin(setIsAuthenticated);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });
});
