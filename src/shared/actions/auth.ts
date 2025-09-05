"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/shared/lib/env";

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Server action for user login
 * This runs on the server and can securely handle authentication
 */
export async function loginAction(
  identifier: string,
  password: string
): Promise<LoginResult> {
  try {
    // Updated for Strapi V5: /auth/local -> /api/auth/local
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1339/api'}/auth/local`;
    const loginInfo = { identifier, password };

    console.log("Server login attempt to:", API_URL);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginInfo),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server login error:", response.status, errorData);

      // Parse error message if possible
      try {
        const parsedError = JSON.parse(errorData);
        const errorMessage =
          parsedError.message?.[0]?.messages?.[0]?.message ||
          parsedError.error?.message ||
          "Invalid credentials";
        return { success: false, error: errorMessage };
      } catch {
        return {
          success: false,
          error: "Login failed. Please check your credentials.",
        };
      }
    }

    const data = await response.json();
    const { jwt, cookie_token, user, documentId } = data;

    if (!jwt || !user) {
      console.error("Invalid login response:", data);
      return { success: false, error: "Invalid response from server" };
    }

    // Set secure cookies on the server
    const cookieStore = await cookies();

    // Set JWT cookie (accessible to both client and server)
    cookieStore.set("jwt", jwt, {
      httpOnly: false, // Allow both client and server access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Set user ID cookie (accessible to both client and server)
    cookieStore.set("userId", String(user.id || user._id), {
      httpOnly: false, // Allow both client and server access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Set document ID cookie (accessible to both client and server)
    if (documentId) {
      cookieStore.set("documentId", String(documentId), {
        httpOnly: false, // Allow both client and server access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    // Set Cloudflare token (keep as httpOnly for security)
    cookieStore.set("__cld_token__", cookie_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    console.log("Server login successful for user:", user.email);
    return { success: true };
  } catch (error) {
    console.error("Server login error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during login",
    };
  }
}

/**
 * Server action for logout
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Clear all auth-related cookies
  cookieStore.delete("jwt");
  cookieStore.delete("userId");
  cookieStore.delete("documentId");
  cookieStore.delete("__cld_token__");

  // Redirect to login page
  redirect("/login");
}

/**
 * Get user data from server-side
 * This function can be reused across all features that need server-side user data
 */
export async function getUserDataAction() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;
    const documentId = cookieStore.get("documentId")?.value;

    if (!jwt || !documentId) {
      return { userInfo: null, notifications: [], onePages: [] };
    }

    const headers = {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };

    // Fetch user data, notifications, and one-pages in parallel
    const [userResponse, notificationsResponse, onePagesResponse] =
      await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1339/api'}/users/${documentId}?populate=*`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1339/api'}/notifications`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1339/api'}/one-pages`, { headers }),
      ]);

    // Handle responses with proper error handling
    let userInfo = null;
    let notifications = [];
    let onePages = [];

    if (userResponse.ok) {
      const userData = await userResponse.json();
      userInfo = userData?.data || userData; // Handle both nested and direct response formats
    } else {
      console.error(`Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`);
    }

    if (notificationsResponse.ok) {
      const notificationsData = await notificationsResponse.json();
      notifications = Array.isArray(notificationsData) ? notificationsData : [];
    } else {
      console.error(`Failed to fetch notifications: ${notificationsResponse.status} ${notificationsResponse.statusText}`);
    }

    if (onePagesResponse.ok) {
      const onePagesData = await onePagesResponse.json();
      onePages = Array.isArray(onePagesData) ? onePagesData : [];
    } else {
      console.error(`Failed to fetch one-pages: ${onePagesResponse.status} ${onePagesResponse.statusText}`);
    }

    return {
      userInfo,
      notifications,
      onePages,
    };
  } catch (error) {
    console.error("Error in getUserDataAction:", error);
    return { userInfo: null, notifications: [], onePages: [] };
  }
}

/**
 * Check if user is authenticated (without fetching user data)
 * Use this to protect routes or check authentication status
 */
export async function checkAuthAction(): Promise<{ isAuthenticated: boolean; userId?: string }> {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;
    const documentId = cookieStore.get("documentId")?.value;

    if (!jwt || !documentId) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, userId: documentId };
  } catch (error) {
    console.error("Error in checkAuthAction:", error);
    return { isAuthenticated: false };
  }
}

/**
 * Check if user is authenticated and return token for API calls
 * Use this when you need to make authenticated API requests
 */
export async function checkAuthWithTokenAction(): Promise<{
  isAuthenticated: boolean;
  userId?: string;
  token?: string;
}> {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;
    const documentId = cookieStore.get("documentId")?.value;

    if (!jwt || !documentId) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, userId: documentId, token: jwt };
  } catch (error) {
    console.error("Error in checkAuthWithTokenAction:", error);
    return { isAuthenticated: false };
  }
}

/**
 * Get only user data from server-side (without notifications/one-pages)
 * Use this when you only need basic user information
 */
export async function getUserAction() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;
    const documentId = cookieStore.get("documentId")?.value;

    if (!jwt || !documentId) {
      return { userInfo: null };
    }

    const headers = {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };

    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1339/api'}/users/${documentId}?populate=*`, {
      headers,
    });

    if (!userResponse.ok) {
      console.error(`Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`);
      return { userInfo: null };
    }

    const userData = await userResponse.json();
    const userInfo = userData?.data || userData; // Handle both nested and direct response formats

    return { userInfo };
  } catch (error) {
    console.error("Error in getUserAction:", error);
    return { userInfo: null };
  }
}

// Company Directory Types
export interface DirectoryUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  position?: string;
  photo?: {
    url?: string;
    formats?: {
      thumbnail?: {
        url?: string;
      };
    };
  };
  province?: string;
  isStaffMember?: boolean;
}

export interface DirectoryFilters {
  province?: string;
  search?: string;
  isStaffMember?: boolean;
  page?: number;
  limit?: number;
}

export interface DirectoryResult {
  users: DirectoryUser[];
  count: number;
  error?: string;
}

/**
 * Build query parameters for directory API calls using Strapi v4/v5 pagination format
 */
function buildDirectoryQueryParams({
  start = 0,
  limit = 30,
  sort = 'firstname:ASC',
  province,
  search,
  isStaffMember
}: {
  start?: number;
  limit?: number;
  sort?: string;
  province?: string;
  search?: string;
  isStaffMember?: boolean;
} = {}): URLSearchParams {
  const queryParams = new URLSearchParams();

  // Strapi v4/v5 pagination format
  queryParams.append('pagination[start]', start.toString());
  queryParams.append('pagination[limit]', limit.toString());
  queryParams.append('pagination[withCount]', 'true');

  // Strapi v4/v5 sort format
  queryParams.append('sort[0]', sort);

  if (province && province !== 'all') {
    queryParams.append('province', province);
  }

  if (search) {
    queryParams.append('search', search);
  }

  // Add staffFilter parameter if isStaffMember is true
  if (isStaffMember === true) {
    queryParams.append('staffFilter', 'only');
  }

  return queryParams;
}

/**
 * Fetch company directory data with server-side authentication
 * This enables SSR for the company directory feature
 */
export async function getDirectoryDataAction({
  start = 0,
  limit = 30,
  sort = 'firstname:ASC',
  province,
  search,
  isStaffMember
}: {
  start?: number;
  limit?: number;
  sort?: string;
  province?: string;
  search?: string;
  isStaffMember?: boolean;
} = {}): Promise<DirectoryResult> {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return { users: [], count: 0, error: "Authentication required" };
    }

    const headers = {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };

    const queryParams = buildDirectoryQueryParams({ start, limit, sort, province, search, isStaffMember });

    try {
      // Try to fetch from the real API first
      // With Strapi v4/v5 and withCount=true, we get both data and count in one request
      const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1339/api'}/users-permissions/directory?${queryParams}`, { headers });

      if (usersResponse.ok) {
        const response = await usersResponse.json();

        // Strapi v4/v5 response format: { data: [...], meta: { pagination: { total: number } } }
        const users = response.data || response;
        const count = response.meta?.pagination?.total || response.length || 0;

        return {
          users: Array.isArray(users) ? users : [],
          count: typeof count === 'number' ? count : 0,
        };
      }
    } catch (apiError) {
      console.log("API not available, falling back to mock data");
    }

    // Fallback to mock data if API is not available
    const { getMockDirectoryData } = await import("@/features/company-directory/lib/mock-data");
    const mockResult = getMockDirectoryData({ start, limit, province, search, isStaffMember });

    return {
      users: mockResult.users,
      count: mockResult.count,
    };
  } catch (error) {
    console.error("Error in getDirectoryDataAction:", error);
    return {
      users: [],
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
