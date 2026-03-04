/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../components/ThemeContext";

const ThemeProbe = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>{isDark ? "dark" : "light"}</button>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists theme changes to localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: "light" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "light" }));

    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
