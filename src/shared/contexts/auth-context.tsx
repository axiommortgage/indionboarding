"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authStatus, logout as logoutUtil } from "@/shared/lib/auth";
import { useUserData } from "@/shared/hooks/use-auth";
import type {
  AuthState,
  AuthContextType,
  RawApiUser,
} from "@/shared/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Safely extract role name from user data
 */
function extractRoleName(role: any): string {
  if (typeof role === "string") {
    return "user"; // Default for string roles
  }
  if (typeof role === "object" && role && typeof role.name === "string") {
    return role.name;
  }
  return "user"; // Default fallback
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userAuth, setUserAuth] = useState<AuthState>({
    isAuth: false,
    userInfo: null,
    notifications: [],
    onePages: [],
    initialized: false,
    error: null,
  });

  const { fetchUserData } = useUserData();
  const router = useRouter();

  /**
   * Initialize authentication state on app startup
   */
  const initializeAuth = useCallback(async () => {
    try {
      console.log("Auth initialization started"); // Debug log

      // Set loading state - ensure initialized is false during loading
      setUserAuth((prev) => ({
        ...prev,
        initialized: false,
        error: null,
      }));

      // First check if we have a valid JWT token
      const isAuthenticated = authStatus();
      console.log("Authentication status:", isAuthenticated); // Debug log

      if (!isAuthenticated) {
        console.log(
          "No valid authentication found, setting to unauthenticated state"
        ); // Debug log
        // No valid token, set as not authenticated
        setUserAuth({
          isAuth: false,
          userInfo: null,
          notifications: [],
          onePages: [],
          initialized: true,
          error: null,
        });
        return;
      }

      // We have a valid token, try to fetch user data
      try {
        console.log("Fetching user data..."); // Debug log
        const { userInfo, notifications, onePages } = await fetchUserData();

        console.log("Auth context - Raw onePages data:", onePages); // Debug log
        console.log("Auth context - onePages data type:", typeof onePages); // Debug log
        console.log("Auth context - onePages length:", onePages?.length); // Debug log

        if (userInfo) {
          console.log("Auth context - Setting authenticated state with data"); // Debug log

          // Ensure all data is properly structured before setting state
          const safeUserInfo = {
            id: String(userInfo.id || ""),
            name:
              [userInfo.firstname, userInfo.lastname]
                .filter(Boolean)
                .join(" ") ||
              userInfo.name ||
              userInfo.username ||
              userInfo.email ||
              "Unknown User",
            email: String(userInfo.email || ""),
            role: extractRoleName(userInfo.role),
            avatar: userInfo.photo?.url || userInfo.avatar || undefined,
            company: userInfo.team?.name || userInfo.company || undefined,
            // Include all the additional fields from userInfo
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            middlename: userInfo.middlename,
            photo: userInfo.photo,
            team: userInfo.team,
            position: userInfo.position,
            titles: userInfo.titles,
            license: userInfo.license,
            workEmail: userInfo.workEmail,
            workPhone: userInfo.workPhone,
            phone: userInfo.phone,
            cellPhone: userInfo.cellPhone,
            website: userInfo.website,
            brokerage: userInfo.brokerage,
            bio: userInfo.bio,
            isOnboarding: userInfo.isOnboarding,
            isStaffMember: userInfo.isStaffMember,
            notListed: userInfo.notListed,
            profileComplete: userInfo.profileComplete,
            websiteOptIn: userInfo.websiteOptIn,
            createdAt: userInfo.createdAt,
            updatedAt: userInfo.updatedAt,
            province: userInfo.province,
            documentId: userInfo.documentId,
            // Social media links
            instagram: userInfo.instagram,
            facebook: userInfo.facebook,
            linkedin: userInfo.linkedin,
            twitter: userInfo.twitter,
            youtube: userInfo.youtube,
            // Application links
            applicationLink: userInfo.applicationLink,
            appointmentScheduleLink: userInfo.appointmentScheduleLink,
            // Feature-specific data
            qrCodes: userInfo.qrCodes || [],
            realtors: userInfo.realtors || [],
          };

          const safeNotifications = Array.isArray(notifications)
            ? notifications
            : [];
          const safeOnePages = Array.isArray(onePages) ? onePages : [];

          setUserAuth({
            isAuth: true,
            userInfo: safeUserInfo,
            notifications: safeNotifications,
            onePages: safeOnePages,
            initialized: true,
            error: null,
          });
        } else {
          // API call succeeded but returned no user data
          console.warn("No user data returned from API");
          setUserAuth({
            isAuth: false,
            userInfo: null,
            notifications: [],
            onePages: [],
            initialized: true,
            error: "No user data available",
          });
        }
      } catch (apiError) {
        // API call failed but we have a valid token
        console.error("Failed to fetch user data:", apiError);
        setUserAuth({
          isAuth: false,
          userInfo: null,
          notifications: [],
          onePages: [],
          initialized: true,
          error: "Failed to connect to server",
        });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUserAuth({
        isAuth: false,
        userInfo: null,
        notifications: [],
        onePages: [],
        initialized: true,
        error: "Failed to initialize authentication",
      });
    }
  }, [fetchUserData]);

  /**
   * Login function
   */
  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      try {
        // Updated for Strapi V5: /auth/local -> /api/auth/local
        const API_URL = `${
          process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
        }/api/auth/local`;
        const loginInfo = { identifier, password };

        console.log("Attempting login to:", API_URL); // Debug log

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginInfo),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Login response error:", response.status, errorText);
          throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();
        const { jwt, cookie_token, user, documentId } = data;

        if (!jwt || !user) {
          console.error("Invalid login response:", data);
          throw new Error("Invalid response from server");
        }

        console.log("Login response user data:", user); // Debug log

        // Normalize user data to match our expected structure
        const normalizedUser = {
          id: String(user.id || user._id || ""),
          name:
            [user.firstname, user.lastname].filter(Boolean).join(" ") ||
            user.name ||
            user.username ||
            user.email ||
            "Unknown User",
          email: String(user.email || ""),
          role: extractRoleName(user.role),
          avatar: user.photo?.url || user.avatar || undefined,
          company: user.team?.name || user.company || undefined,
          documentId: user.documentId,
          // Include all the additional fields from user
          firstname: user.firstname,
          lastname: user.lastname,
          middlename: user.middlename,
          photo: user.photo,
          team: user.team,
          position: user.position,
          titles: user.titles,
          license: user.license,
          workEmail: user.workEmail,
          workPhone: user.workPhone,
          phone: user.phone,
          cellPhone: user.cellPhone,
          website: user.website,
          brokerage: user.brokerage,
          bio: user.bio,
          isOnboarding: user.isOnboarding,
          isStaffMember: user.isStaffMember,
          notListed: user.notListed,
          profileComplete: user.profileComplete,
          websiteOptIn: user.websiteOptIn,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          province: user.province,
          // Social media links
          instagram: user.instagram,
          facebook: user.facebook,
          linkedin: user.linkedin,
          twitter: user.twitter,
          youtube: user.youtube,
          // Application links
          applicationLink: user.applicationLink,
          appointmentScheduleLink: user.appointmentScheduleLink,
          // Feature-specific data
          qrCodes: user.qrCodes || [],
          realtors: user.realtors || [],
        };

        console.log("Normalized user data:", normalizedUser); // Debug log

        // Set cookies
        document.cookie = `jwt=${jwt}; path=/; max-age=${30 * 24 * 60 * 60}`;
        document.cookie = `userId=${normalizedUser.id}; path=/; max-age=${
          30 * 24 * 60 * 60
        }`;
        document.cookie = `documentId=${user.documentId}; path=/; max-age=${
          30 * 24 * 60 * 60
        }`;
        document.cookie = `__cld_token__=${cookie_token}; path=/; max-age=${
          30 * 24 * 60 * 60
        }`;

        // After successful login, fetch full user data including onePages
        try {
          console.log("Login successful, fetching complete user data..."); // Debug log
          const { userInfo, notifications, onePages } = await fetchUserData();

          const safeUserInfo = userInfo || normalizedUser;
          const safeNotifications = Array.isArray(notifications)
            ? notifications
            : [];
          const safeOnePages = Array.isArray(onePages) ? onePages : [];

          // Update auth state with complete data
          setUserAuth({
            isAuth: true,
            userInfo: safeUserInfo,
            notifications: safeNotifications,
            onePages: safeOnePages,
            initialized: true,
            error: null,
          });
        } catch (fetchError) {
          console.warn(
            "Failed to fetch complete user data after login, using basic user info:",
            fetchError
          );
          // Fallback to basic user info if fetch fails
          setUserAuth({
            isAuth: true,
            userInfo: normalizedUser,
            notifications: [],
            onePages: [],
            initialized: true,
            error: null,
          });
        }

        console.log("Login successful for user:", normalizedUser.email);
        return true;
      } catch (error) {
        console.error("Login error details:", error);
        return false;
      }
    },
    [fetchUserData]
  );

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    logoutUtil();
    setUserAuth({
      isAuth: false,
      userInfo: null,
      notifications: [],
      onePages: [],
      initialized: true,
      error: null,
    });
  }, []);

  /**
   * Refresh user data
   */
  const refreshUserData = useCallback(async () => {
    // Check auth status at call time instead of in dependencies
    if (!userAuth.isAuth) return;

    try {
      const { userInfo, notifications, onePages } = await fetchUserData();

      setUserAuth((prev) => ({
        ...prev,
        userInfo: userInfo || prev.userInfo,
        notifications,
        onePages,
      }));
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [fetchUserData]);

  /**
   * Update user data directly without API call
   */
  const updateUserData = useCallback((updatedUserData: any) => {
    if (!userAuth.isAuth || !updatedUserData) return;

    try {
      // Normalize the updated user data to match our User type structure
      const normalizedUserInfo = {
        id: String(updatedUserData.id || updatedUserData._id || ""),
        documentId: String(updatedUserData.documentId || ""),
        name:
          [updatedUserData.firstname, updatedUserData.lastname]
            .filter(Boolean)
            .join(" ") ||
          updatedUserData.name ||
          updatedUserData.username ||
          updatedUserData.email ||
          "Unknown User",
        email: String(updatedUserData.email || ""),
        role: extractRoleName(updatedUserData.role),
        avatar: updatedUserData.photo?.url || updatedUserData.avatar || undefined,
        company: updatedUserData.team?.name || updatedUserData.company || undefined,
        firstname: updatedUserData.firstname,
        lastname: updatedUserData.lastname,
        middlename: updatedUserData.middlename,
        photo: updatedUserData.photo,
        team: updatedUserData.team,
        position: updatedUserData.position,
        titles: updatedUserData.titles,
        license: updatedUserData.license,
        workEmail: updatedUserData.workEmail,
        workPhone: updatedUserData.workPhone,
        phone: updatedUserData.phone,
        cellPhone: updatedUserData.cellPhone,
        website: updatedUserData.website,
        brokerage: updatedUserData.brokerage,
        bio: updatedUserData.bio,
        isOnboarding: updatedUserData.isOnboarding,
        isStaffMember: updatedUserData.isStaffMember,
        notListed: updatedUserData.notListed,
        profileComplete: updatedUserData.profileComplete,
        websiteOptIn: updatedUserData.websiteOptIn,
        createdAt: updatedUserData.createdAt,
        updatedAt: updatedUserData.updatedAt,
        province: updatedUserData.province,
        instagram: updatedUserData.instagram,
        facebook: updatedUserData.facebook,
        linkedin: updatedUserData.linkedin,
        twitter: updatedUserData.twitter,
        youtube: updatedUserData.youtube,
        applicationLink: updatedUserData.applicationLink,
        appointmentScheduleLink: updatedUserData.appointmentScheduleLink,
        qrCodes: updatedUserData.qrCodes || [],
        realtors: updatedUserData.realtors || [],
      };

      setUserAuth((prev) => ({
        ...prev,
        userInfo: normalizedUserInfo,
      }));

      console.log('User data updated directly:', normalizedUserInfo);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }, [userAuth.isAuth]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle route changes to check auth status
  useEffect(() => {
    const handleRouteChange = () => {
      const isAuthenticated = authStatus();
      if (!isAuthenticated && userAuth.isAuth) {
        // User was logged out, update state
        setUserAuth((prev) => ({
          ...prev,
          isAuth: false,
          userInfo: null,
        }));
      }
    };

    // Listen for storage events (logout in another tab)
    window.addEventListener("storage", handleRouteChange);

    return () => {
      window.removeEventListener("storage", handleRouteChange);
    };
  }, [userAuth.isAuth]);

  const contextValue: AuthContextType = {
    userAuth,
    setUserAuth,
    login,
    logout,
    refreshUserData,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
