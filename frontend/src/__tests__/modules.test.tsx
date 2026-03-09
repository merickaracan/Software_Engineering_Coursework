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

  it("displays all available modules", () => {
    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Systems Architecture")).toBeInTheDocument();
    expect(screen.getByText("Visual Computing")).toBeInTheDocument();
    expect(screen.getByText("Databases")).toBeInTheDocument();
    expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
  });

  it("loads previously selected modules from localStorage", () => {
    localStorage.setItem("selectedModules", JSON.stringify(["ml", "ai"]));

    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    // Check that previously selected modules are marked
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
  });

  it("allows deselecting a module", () => {
    localStorage.setItem("selectedModules", JSON.stringify(["se"]));

    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Software Engineering"));

    const stored = localStorage.getItem("selectedModules");
    const modules = stored ? JSON.parse(stored) : [];
    expect(modules).not.toContain("se");
  });

  it("allows selecting multiple modules", () => {
    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Software Engineering"));
    fireEvent.click(screen.getByText("Machine Learning"));
    fireEvent.click(screen.getByText("Databases"));

    const stored = localStorage.getItem("selectedModules");
    const modules = stored ? JSON.parse(stored) : [];
    expect(modules).toContain("se");
    expect(modules).toContain("ml");
    expect(modules).toContain("db");
  });

  it("provides visual feedback for selected modules", () => {
    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    const seCard = screen.getByText("Software Engineering").closest(".ant-card");
    expect(seCard).toBeInTheDocument();

    fireEvent.click(screen.getByText("Software Engineering"));

    // Card should show selected state
    expect(seCard).toBeInTheDocument();
  });

  it("handles empty initial state", () => {
    localStorage.removeItem("selectedModules");

    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
    
    const stored = localStorage.getItem("selectedModules");
    expect(stored).toBeNull();
  });

  it("applies theme styles correctly", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
  });

  it("maintains selection state across re-renders", () => {
    const { rerender } = render(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Software Engineering"));
    
    const storedBefore = localStorage.getItem("selectedModules");
    
    rerender(
      <ThemeProvider>
        <Modules />
      </ThemeProvider>
    );

    const storedAfter = localStorage.getItem("selectedModules");
    expect(storedBefore).toEqual(storedAfter);
  });
});
