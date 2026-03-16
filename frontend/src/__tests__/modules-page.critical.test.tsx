/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ModulesPage from "../pages/ModulesPage";

vi.mock("../components/PageHeader", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../components/Modules", () => ({
  default: () => <div>Modules Stubbed Content</div>,
}));

describe("ModulesPage critical render", () => {
  it("renders modules wrapper content", () => {
    render(
      <MemoryRouter>
        <ModulesPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Modules Stubbed Content")).toBeInTheDocument();
  });
});
