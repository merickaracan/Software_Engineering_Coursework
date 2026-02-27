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

    expect(
      screen.getByText("No leaderboard data yet. Ratings will appear as notes get reviewed.")
    ).toBeInTheDocument();
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
});
