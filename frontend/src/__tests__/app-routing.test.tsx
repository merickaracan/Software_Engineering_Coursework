/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

const setPath = (path: string) => {
  window.history.pushState({}, "", path);
};

describe("App routing and auth guard", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("redirects unauthenticated users to login", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    setPath("/dashboard");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    });
  });

  it("allows authenticated users to view dashboard", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    setPath("/dashboard");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    });
  });

  it("checks auth on mount", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    render(<App />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/me", {
        method: "GET",
        credentials: "include",
      });
    });
  });
});
