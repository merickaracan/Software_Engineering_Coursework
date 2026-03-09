import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Ant Design relies on matchMedia for responsive hooks.
if (!window.matchMedia) {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
}

// Ant Design resize hooks require ResizeObserver in the environment.
if (!globalThis.ResizeObserver) {
	class ResizeObserver {
		observe() {
			// no-op for jsdom tests
		}

		unobserve() {
			// no-op for jsdom tests
		}

		disconnect() {
			// no-op for jsdom tests
		}
	}

	Object.defineProperty(globalThis, "ResizeObserver", {
		writable: true,
		value: ResizeObserver,
	});
}

// Shared test setup for Vitest + React Testing Library.
// Add global mocks/providers here when needed.
afterEach(() => {
	cleanup();
});
