import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth, useUserData } from "../use-auth";
import { AuthProvider } from "@/shared/contexts/auth-context";
import React from "react";

// Mock environment
jest.mock("@/shared/lib/env", () => ({
  env: {
    API_URL: "http://localhost:1339",
  },
}));

// Mock auth utilities
jest.mock("@/shared/lib/auth", () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer mock-jwt-token",
    "Content-Type": "application/json",
  })),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/",
  }),
}));

const { setCookie, getCookie } = require("@/shared/lib/auth");

// Create wrapper component for AuthProvider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(AuthProvider, null, children);
};

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should login successfully with valid credentials", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        jwt: "mock-jwt-token",
        cookie_token: "mock-cookie-token",
        user: {
          id: "1",
          email: "test@example.com",
          firstname: "John",
          lastname: "Doe",
        },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("test@example.com", "password");
    });

    expect(loginResult!).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:1339/auth/local",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "test@example.com",
          password: "password",
        }),
      }
    );
  });

  it("should handle login failure with proper error message", async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: [
          {
            messages: [
              {
                message: "Invalid credentials",
              },
            ],
          },
        ],
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("test@example.com", "wrongpass");
    });

    expect(loginResult!).toBe(false);
    expect(result.current.error).toBe("Invalid credentials");
  });

  it("should handle network errors during login", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("test@example.com", "password");
    });

    expect(loginResult!).toBe(false);
    expect(result.current.error).toBe("Network error");
  });
});

describe("useUserData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    getCookie.mockReturnValue("123");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch user data successfully", async () => {
    const mockUserResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: "123",
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
      }),
    };

    const mockNotificationsResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    };

    const mockOnePagesResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockUserResponse)
      .mockResolvedValueOnce(mockNotificationsResponse)
      .mockResolvedValueOnce(mockOnePagesResponse);

    const { result } = renderHook(() => useUserData(), { wrapper: createWrapper() });

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchUserData();
    });

    expect(fetchResult.userInfo).toEqual({
      id: "123",
      name: "John Doe",
      email: "test@example.com",
      role: "user",
      avatar: undefined,
      company: undefined,
      documentId: "",
      firstname: "John",
      lastname: "Doe",
      middlename: undefined,
      bio: undefined,
      brokerage: undefined,
      cellPhone: undefined,
      createdAt: undefined,
      isOnboarding: undefined,
      isStaffMember: undefined,
      notListed: undefined,
      phone: undefined,
      photo: undefined,
      position: undefined,
      titles: undefined,
      license: undefined,
      profileComplete: undefined,
      province: undefined,
      team: undefined,
      updatedAt: undefined,
      website: undefined,
      websiteOptIn: undefined,
      workEmail: undefined,
      workPhone: undefined,
      // Social media links
      instagram: undefined,
      facebook: undefined,
      linkedin: undefined,
      twitter: undefined,
      youtube: undefined,
      // Application links
      applicationLink: undefined,
      appointmentScheduleLink: undefined,
      // Feature-specific data
      qrCodes: [],
      realtors: [],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:1339/api/users/123",
      {
        headers: {
          Authorization: "Bearer mock-jwt-token",
          "Content-Type": "application/json",
        },
      }
    );
  });

  it("should handle API errors gracefully", async () => {
    const mockUserResponse = {
      ok: false,
      json: jest.fn(),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockUserResponse);

    const { result } = renderHook(() => useUserData(), { wrapper: createWrapper() });

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchUserData();
    });

    expect(fetchResult.userInfo).toBe(null);
    expect(result.current.error).toBe("Failed to fetch user data");
  });

  it("should handle missing user ID", async () => {
    getCookie.mockReturnValue(null);

    const { result } = renderHook(() => useUserData(), { wrapper: createWrapper() });

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchUserData();
    });

    expect(fetchResult.userInfo).toBe(null);
    expect(result.current.error).toBe("No user ID found");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should normalize complex API response data", async () => {
    const mockComplexUserResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        _id: { $oid: "507f1f77bcf86cd799439011" },
        id: "123",
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        role: "615729ce1026f27e0f34ea5f",
        photo: {
          url: "/uploads/avatar.jpg",
        },
        team: {
          name: "Development Team",
        },
      }),
    };

    const mockNotificationsResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    };

    const mockOnePagesResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          id: "1",
          Title: "Test Page",
          slug: "test-page",
        },
      ]),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockComplexUserResponse)
      .mockResolvedValueOnce(mockNotificationsResponse)
      .mockResolvedValueOnce(mockOnePagesResponse);

    const { result } = renderHook(() => useUserData(), { wrapper: createWrapper() });

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchUserData();
    });

    expect(fetchResult.userInfo).toEqual({
      id: "123",
      name: "John Doe",
      email: "test@example.com",
      role: "user",
      avatar: "/uploads/avatar.jpg",
      company: "Development Team",
      documentId: "",
      firstname: "John",
      lastname: "Doe",
      middlename: undefined,
      bio: undefined,
      brokerage: undefined,
      cellPhone: undefined,
      createdAt: undefined,
      isOnboarding: undefined,
      isStaffMember: undefined,
      notListed: undefined,
      phone: undefined,
      photo: {
        url: "/uploads/avatar.jpg",
      },
      position: undefined,
      titles: undefined,
      license: undefined,
      profileComplete: undefined,
      province: undefined,
      team: {
        name: "Development Team",
      },
      updatedAt: undefined,
      website: undefined,
      websiteOptIn: undefined,
      workEmail: undefined,
      workPhone: undefined,
      // Social media links
      instagram: undefined,
      facebook: undefined,
      linkedin: undefined,
      twitter: undefined,
      youtube: undefined,
      // Application links
      applicationLink: undefined,
      appointmentScheduleLink: undefined,
      // Feature-specific data
      qrCodes: [],
      realtors: [],
    });

    expect(fetchResult.onePages).toEqual([
      {
        id: "1",
        _id: undefined,
        Title: "Test Page",
        slug: "test-page",
      },
    ]);
  });

  it("should handle malformed onePages data", async () => {
    const mockUserResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: "123",
        email: "test@example.com",
      }),
    };

    const mockNotificationsResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    };

    const mockOnePagesResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        { id: "1", Title: "Valid Page", slug: "valid-page" },
        { id: "2" }, // Missing required fields
        null, // Null item
        { id: "3", Title: "Another Valid", slug: "another-valid" },
      ]),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockUserResponse)
      .mockResolvedValueOnce(mockNotificationsResponse)
      .mockResolvedValueOnce(mockOnePagesResponse);

    const { result } = renderHook(() => useUserData(), { wrapper: createWrapper() });

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchUserData();
    });

    // Should filter out invalid items
    expect(fetchResult.onePages).toHaveLength(2);
    expect(fetchResult.onePages[0].Title).toBe("Valid Page");
    expect(fetchResult.onePages[1].Title).toBe("Another Valid");
  });

  it("should handle network errors during data fetch", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useUserData(), { wrapper: createWrapper() });

    let fetchResult: any;
    await act(async () => {
      fetchResult = await result.current.fetchUserData();
    });

    expect(fetchResult.userInfo).toBe(null);
    expect(result.current.error).toBe("Network error");
  });
});
