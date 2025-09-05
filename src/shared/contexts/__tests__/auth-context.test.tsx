import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuthContext } from "../auth-context";
import * as authLib from "@/shared/lib/auth";
import * as useAuthHook from "@/shared/hooks/use-auth";

// Mock dependencies
jest.mock("@/shared/lib/auth");
jest.mock("@/shared/hooks/use-auth");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

const mockAuthLib = authLib as jest.Mocked<typeof authLib>;
const mockUseAuthHook = useAuthHook as jest.Mocked<typeof useAuthHook>;

// Test component to access the context
function TestComponent() {
  const { userAuth, login, logout, refreshUserData } = useAuthContext();

  // Helper to safely render role
  const renderRole = (role: any) => {
    if (typeof role === "string") return role;
    if (typeof role === "object" && role && role.name) return role.name;
    return String(role);
  };

  return (
    <div>
      <div data-testid="is-auth">{userAuth.isAuth.toString()}</div>
      <div data-testid="initialized">{userAuth.initialized.toString()}</div>
      <div data-testid="user-name">{userAuth.userInfo?.name || "null"}</div>
      <div data-testid="user-role">
        {renderRole(userAuth.userInfo?.role) || "null"}
      </div>
      <div data-testid="user-email">{userAuth.userInfo?.email || "null"}</div>
      <div data-testid="error">{userAuth.error || "null"}</div>
      <button
        data-testid="login-btn"
        onClick={() => login("test@example.com", "password")}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button data-testid="refresh-btn" onClick={refreshUserData}>
        Refresh
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  const mockFetchUserData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthHook.useUserData.mockReturnValue({
      fetchUserData: mockFetchUserData,
      isLoading: false,
      error: null,
    });

    // Mock document.cookie
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  describe("extractRoleName function", () => {
    // We need to access the helper function, so let's test it through the context behavior
    it("should handle string role types", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          firstname: "John",
          lastname: "Doe",
          role: "admin", // string role
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-role")).toHaveTextContent("user"); // string roles default to "user"
      });
    });

    it("should handle object role types with name property", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          firstname: "John",
          lastname: "Doe",
          role: { name: "admin", id: "role-1" }, // object role
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-role")).toHaveTextContent("admin");
      });
    });

    it("should handle null/undefined role types", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          firstname: "John",
          lastname: "Doe",
          role: null, // null role
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-role")).toHaveTextContent("user");
      });
    });
  });

  describe("initialization", () => {
    it("should initialize as not authenticated when no token exists", async () => {
      mockAuthLib.authStatus.mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("false");
        expect(screen.getByTestId("initialized")).toHaveTextContent("true");
        expect(screen.getByTestId("user-name")).toHaveTextContent("null");
      });
    });

    it("should initialize with user data when token exists", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "john.doe@example.com",
          firstname: "John",
          lastname: "Doe",
          role: { name: "admin" },
          photo: { url: "https://example.com/avatar.jpg" },
          team: { name: "Engineering" },
        },
        notifications: [
          {
            id: "1",
            title: "Welcome",
            message: "Welcome to the app",
            type: "info",
            read: false,
            createdAt: "2024-01-01",
          },
        ],
        onePages: [
          {
            id: "1",
            Title: "Partners",
            slug: "partners",
          },
        ],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
        expect(screen.getByTestId("initialized")).toHaveTextContent("true");
        expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
        expect(screen.getByTestId("user-role")).toHaveTextContent("admin");
        expect(screen.getByTestId("user-email")).toHaveTextContent(
          "john.doe@example.com"
        );
      });
    });

    it("should handle API fetch failure gracefully", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockRejectedValue(new Error("API Error"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("false");
        expect(screen.getByTestId("initialized")).toHaveTextContent("true");
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Failed to connect to server"
        );
      });
    });

    it("should handle initialization with users-light endpoint structure", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);

      // Mock fetchUserData to return normalized User object (not raw API data)
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          // Return normalized User structure
          id: "607f28a5cd063c35088bf735",
          name: "Bruno de Sousa", // Already normalized
          email: "bruno.sousa@indimortgage.ca",
          role: "user", // Already normalized (string roles become "user")
          avatar:
            "https://indi-strapi-v2.s3.us-east-1.amazonaws.com/public/images/origin/1745278540247_0f8wg-Bruno_Portrait-1_low.jpg",
          company: "Indi IT and Design Team",
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
        expect(screen.getByTestId("user-name")).toHaveTextContent(
          "Bruno de Sousa"
        );
        expect(screen.getByTestId("user-role")).toHaveTextContent("user"); // String roles normalize to "user"
        expect(screen.getByTestId("user-email")).toHaveTextContent(
          "bruno.sousa@indimortgage.ca"
        );
      });
    });
  });

  describe("data normalization", () => {
    it("should normalize user name from firstname and lastname", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          firstname: "John",
          lastname: "Doe",
          role: "user",
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
      });
    });

    it("should fallback to username when firstname/lastname not available", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          username: "johndoe",
          role: "user",
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent("johndoe");
      });
    });

    it("should fallback to email when no name fields available", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          role: "user",
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent(
          "test@example.com"
        );
      });
    });

    it("should handle malformed data arrays safely", async () => {
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          firstname: "John",
          role: "user",
        },
        notifications: null, // malformed data
        onePages: "invalid", // malformed data
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
        expect(screen.getByTestId("initialized")).toHaveTextContent("true");
      });
    });
  });

  describe("login functionality", () => {
    it("should login successfully with valid credentials", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          jwt: "mock-jwt-token",
          cookie_token: "mock-cookie-token",
          user: {
            id: "1",
            email: "test@example.com",
            firstname: "John",
            lastname: "Doe",
            role: { name: "admin" }, // Login endpoint returns role as object
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Mock the fetchUserData that gets called after login (should return normalized User object)
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          // Return normalized User structure (not raw API structure)
          id: "607f28a5cd063c35088bf735",
          name: "John Doe", // Already normalized
          email: "test@example.com",
          role: "user", // Already normalized (string roles become "user")
          avatar: "https://example.com/avatar.jpg",
          company: "Engineering Team",
        },
        notifications: [],
        onePages: [],
      });

      // Start with unauthenticated state
      mockAuthLib.authStatus.mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId("login-btn").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
        expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
        expect(screen.getByTestId("user-role")).toHaveTextContent("user"); // String roles normalize to "user"
      });
    });

    it("should handle login failure", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: async () => "Invalid credentials",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Start with unauthenticated state
      mockAuthLib.authStatus.mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Ensure we start unauthenticated
      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("false");
      });

      await act(async () => {
        screen.getByTestId("login-btn").click();
      });

      // Should remain unauthenticated after failed login
      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("false");
      });
    });
  });

  describe("logout functionality", () => {
    it("should logout and clear user state", async () => {
      // First set up authenticated state
      mockAuthLib.authStatus.mockReturnValue(true);
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          id: "1",
          email: "test@example.com",
          firstname: "John",
          role: "user",
        },
        notifications: [],
        onePages: [],
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
      });

      await act(async () => {
        screen.getByTestId("logout-btn").click();
      });

      expect(mockAuthLib.logout).toHaveBeenCalled();
      expect(screen.getByTestId("is-auth")).toHaveTextContent("false");
      expect(screen.getByTestId("user-name")).toHaveTextContent("null");
    });
  });

  describe("error handling", () => {
    it("should handle context usage outside provider", () => {
      // Temporarily suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAuthContext must be used within an AuthProvider");

      console.error = originalError;
    });
  });

  describe("dual endpoint data handling", () => {
    it("should handle login flow correctly with mixed endpoint structures", async () => {
      // Login returns simpler structure
      const mockLoginResponse = {
        ok: true,
        json: async () => ({
          jwt: "mock-jwt-token",
          cookie_token: "mock-cookie-token",
          user: {
            id: "607f28a5cd063c35088bf735",
            email: "bruno.sousa@indimortgage.ca",
            firstname: "Bruno",
            lastname: "de Sousa",
            role: { name: "admin", id: "role-1" }, // Object role from login
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockLoginResponse);

      // After login, fetchUserData returns normalized User object (not raw API data)
      mockFetchUserData.mockResolvedValue({
        userInfo: {
          // Return normalized User structure
          id: "607f28a5cd063c35088bf735",
          name: "Bruno de Sousa", // Already normalized
          email: "bruno.sousa@indimortgage.ca",
          role: "user", // Already normalized (string roles become "user")
          avatar:
            "https://indi-strapi-v2.s3.us-east-1.amazonaws.com/public/images/origin/1745278540247_0f8wg-Bruno_Portrait-1_low.jpg",
          company: "Indi IT and Design Team",
        },
        notifications: [],
        onePages: [],
      });

      mockAuthLib.authStatus.mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId("login-btn").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
        expect(screen.getByTestId("user-name")).toHaveTextContent(
          "Bruno de Sousa"
        );
        expect(screen.getByTestId("user-role")).toHaveTextContent("user"); // Users-light string role normalizes to "user"
        expect(screen.getByTestId("user-email")).toHaveTextContent(
          "bruno.sousa@indimortgage.ca"
        );
      });
    });

    it("should handle fallback when fetchUserData fails after login", async () => {
      const mockLoginResponse = {
        ok: true,
        json: async () => ({
          jwt: "mock-jwt-token",
          cookie_token: "mock-cookie-token",
          user: {
            id: "1",
            email: "test@example.com",
            firstname: "John",
            lastname: "Doe",
            role: { name: "admin" },
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockLoginResponse);

      // Simulate fetchUserData failure after login
      mockFetchUserData.mockRejectedValue(new Error("API Error"));

      mockAuthLib.authStatus.mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId("login-btn").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
        expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe"); // Should use login data as fallback
        expect(screen.getByTestId("user-role")).toHaveTextContent("admin"); // Should use login role extraction
      });
    });
  });
});
