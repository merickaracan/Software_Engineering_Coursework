/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PageLayout from "../components/PageHeader";

vi.mock("../components/SideMenu", () => ({
  default: () => <div>SideMenu stubbed</div>,
}));

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

describe("PageHeader critical render", () => {
  it("renders app title and provided children", () => {
    render(
      <MemoryRouter>
        <PageLayout>
          <div>Child Content</div>
        </PageLayout>
      </MemoryRouter>
    );

    expect(screen.getByText("Notebuddy")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
    expect(screen.getByText("SideMenu stubbed")).toBeInTheDocument();
  });
});
