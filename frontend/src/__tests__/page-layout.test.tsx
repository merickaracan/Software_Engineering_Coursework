/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import PageLayout from "../components/PageHeader";

describe("PageLayout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders page layout with header", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <PageLayout>
            <div>Test Content</div>
          </PageLayout>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /notebuddy/i })).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders side menu component", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <PageLayout>
            <div>Test Content</div>
          </PageLayout>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Side menu items should be present
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
  });

  it("renders children components", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <PageLayout>
            <div data-testid="child-component">Custom Child Content</div>
          </PageLayout>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText("Custom Child Content")).toBeInTheDocument();
  });

  it("applies dark theme styles when theme is dark", () => {
    localStorage.setItem("theme", "dark");

    render(
      <MemoryRouter>
        <ThemeProvider>
          <PageLayout>
            <div>Test Content</div>
          </PageLayout>
        </ThemeProvider>
      </MemoryRouter>
    );

    const layout = screen.getByText("Test Content").closest(".ant-layout");
    expect(layout).toHaveStyle({ background: "#141414" });
  });

  it("applies light theme styles when theme is light", () => {
    localStorage.setItem("theme", "light");

    render(
      <MemoryRouter>
        <ThemeProvider>
          <PageLayout>
            <div>Test Content</div>
          </PageLayout>
        </ThemeProvider>
      </MemoryRouter>
    );

    const layout = screen.getByText("Test Content").closest(".ant-layout");
    expect(layout).toHaveStyle({ background: "#f0f5ff" });
  });

  it("has sticky header", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <PageLayout>
            <div>Test Content</div>
          </PageLayout>
        </ThemeProvider>
      </MemoryRouter>
    );

    const header = screen.getByRole("heading", { name: /notebuddy/i }).closest("header");
    expect(header).toHaveStyle({ position: "sticky", top: 0, zIndex: 10 });
  });

  it("renders multiple children", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <PageLayout>
            <div>First Child</div>
            <div>Second Child</div>
            <div>Third Child</div>
          </PageLayout>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
    expect(screen.getByText("Third Child")).toBeInTheDocument();
  });
});
