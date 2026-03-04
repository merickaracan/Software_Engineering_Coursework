/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import Register from "../pages/Register";

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

describe("Register", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.clearAllMocks();
  });

  it("submits registration details on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Register />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@bath.ac.uk" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Password123!" },
    });

    const [submitButton] = screen
      .getAllByRole("button", { name: /create account/i })
      .filter((button) => (button as HTMLButtonElement).type === "submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "user@bath.ac.uk",
          password: "Password123!",
        }),
      });
    });

    expect(message.success).toHaveBeenCalledWith("Account created!");
  });

  it("shows error when registration fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: ["Email already registered"] }),
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Register />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@bath.ac.uk" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Password123!" },
    });

    const [submitButton] = screen
      .getAllByRole("button", { name: /create account/i })
      .filter((button) => (button as HTMLButtonElement).type === "submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
  });
});
