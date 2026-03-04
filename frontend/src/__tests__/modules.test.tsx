/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../components/ThemeContext";
import Modules from "../components/Modules";

describe("Modules", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists selected modules to localStorage", () => {
    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Software Engineering"));

    const stored = localStorage.getItem("selectedModules");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored as string)).toContain("se");
  });
});
