/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Note from "../pages/Note";

const createChainResult = () => ({
  run: vi.fn(),
});

const chainApi = {
  undo: () => createChainResult(),
  redo: () => createChainResult(),
  toggleBold: () => createChainResult(),
  toggleItalic: () => createChainResult(),
  toggleUnderline: () => createChainResult(),
  toggleStrike: () => createChainResult(),
  setParagraph: () => createChainResult(),
  toggleHeading: () => createChainResult(),
};

const mockEditor = {
  chain: () => ({
    focus: () => chainApi,
  }),
  commands: {
    setFontSize: vi.fn(),
  },
  isActive: vi.fn(() => false),
  getAttributes: vi.fn(() => ({ fontSize: "16px" })),
};

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => mockEditor),
  useEditorState: vi.fn(({ selector }: { selector: (args: { editor: typeof mockEditor }) => unknown }) =>
    selector({ editor: mockEditor })
  ),
  EditorContent: () => <div data-testid="note-editor-content" />,
}));

describe("Note page smoke", () => {
  it("renders without crashing", () => {
    render(<Note />);

    expect(screen.getByTestId("note-editor-content")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("Publish")).toBeInTheDocument();
  });
});
