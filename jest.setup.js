import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:1339";
process.env.API_URL = "http://localhost:1339";

// Mock fetch
global.fetch = jest.fn();

// Mock document.cookie
Object.defineProperty(document, "cookie", {
  writable: true,
  value: "",
});

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
