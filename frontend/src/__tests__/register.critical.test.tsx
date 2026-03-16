/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import Register from "../pages/Register";

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

function submitRegisterForm() {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Register />
      </ThemeProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Student User" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ab1234@bath.ac.uk" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Password123!" },
  });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: "Password123!" },
  });

  const submitButton = screen
    .getAllByRole("button", { name: /create account/i })
    .find((button) => (button as HTMLButtonElement).type === "submit");

  if (!submitButton) {
    throw new Error("Register submit button not found");
  }

  fireEvent.click(submitButton);
}

describe("Register critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("submits expected payload and redirects to login on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    submitRegisterForm();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Student User",
          email: "ab1234@bath.ac.uk",
          password: "Password123!",
          lecturer: undefined,
        }),
      });
    });

    expect(message.success).toHaveBeenCalledWith("Account created!");
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/login");
    }, { timeout: 2500 });
  });

  it("shows backend validation errors when registration fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: ["Email already registered"] }),
    });

    submitRegisterForm();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Failed to create account: Email already registered"
      );
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
