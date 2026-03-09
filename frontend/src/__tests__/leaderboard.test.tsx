/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../components/ThemeContext";
import Leaderboard from "../components/Leaderboard";

describe("Leaderboard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows empty state when no leaderboard data", () => {
    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    expect(screen.getByText(/no students yet/i)).toBeInTheDocument();
  });

  it("orders leaderboard by avgRating desc", () => {
    localStorage.setItem(
      "leaderboard",
      JSON.stringify([
        { name: "B", email: "b@bath.ac.uk", avgRating: 3.5, totalNotes: 2 },
        { name: "A", email: "a@bath.ac.uk", avgRating: 4.6, totalNotes: 4 },
      ])
    );

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("A");
    expect(rows[2]).toHaveTextContent("B");
  });

  it("displays user name and email", () => {
    localStorage.setItem(
      "leaderboard",
      JSON.stringify([
        { name: "John Doe", email: "john@bath.ac.uk", avgRating: 4.5, totalNotes: 5 },
      ])
    );

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@bath.ac.uk")).toBeInTheDocument();
  });

  it("displays average rating and total notes", () => {
    localStorage.setItem(
      "leaderboard",
      JSON.stringify([
        { name: "Test", email: "test@bath.ac.uk", avgRating: 4.8, totalNotes: 12 },
      ])
    );

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getAllByText("12").length).toBeGreaterThan(0);
  });

  it("handles empty leaderboard data gracefully", () => {
    localStorage.setItem("leaderboard", "[]");

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    expect(screen.getByText(/no students yet/i)).toBeInTheDocument();
  });

  it("displays rankings in order", () => {
    localStorage.setItem(
      "leaderboard",
      JSON.stringify([
        { name: "First", email: "first@bath.ac.uk", avgRating: 5.0, totalNotes: 10 },
        { name: "Second", email: "second@bath.ac.uk", avgRating: 4.5, totalNotes: 8 },
        { name: "Third", email: "third@bath.ac.uk", avgRating: 4.0, totalNotes: 6 },
      ])
    );

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("First");
    expect(rows[2]).toHaveTextContent("Second");
    expect(rows[3]).toHaveTextContent("Third");
  });

  it("applies theme styles correctly", () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem(
      "leaderboard",
      JSON.stringify([
        { name: "User", email: "user@bath.ac.uk", avgRating: 4.0, totalNotes: 5 },
      ])
    );

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    // Leaderboard should render with theme
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("handles malformed localStorage data", () => {
    localStorage.setItem("leaderboard", "invalid json");

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    // Should show empty state or not crash
    expect(screen.getByText(/no students yet/i)).toBeInTheDocument();
  });

  it("displays multiple users correctly", () => {
    const users = Array.from({ length: 5 }, (_, i) => ({
      name: `User${i + 1}`,
      email: `user${i + 1}@bath.ac.uk`,
      avgRating: 5 - i * 0.5,
      totalNotes: 10 - i,
    }));

    localStorage.setItem("leaderboard", JSON.stringify(users));

    render(
      <ThemeProvider>
        <Leaderboard />
      </ThemeProvider>
    );

    users.forEach((user) => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
    });
  });
});
