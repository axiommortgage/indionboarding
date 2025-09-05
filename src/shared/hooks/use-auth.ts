"use client";

import { useState, useCallback } from "react";
import { env } from "@/shared/lib/env";
import { setCookie, getAuthHeaders, getCookie } from "@/shared/lib/auth";
import { useAuthContext } from "@/shared/contexts/auth-context";
import type {
  LoginResponse,
  User,
  Notification,
  OnePage,
} from "@/shared/types/auth";

/**
 * Hook for handling user authentication
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userAuth } = useAuthContext();

  /**
   * Login user with email and password
   */
  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Updated for Strapi V5: /auth/local -> /api/auth/local
        const API_URL = `${env.API_URL}/auth/local`;
        const loginInfo = { identifier, password };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginInfo),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message?.[0]?.messages?.[0]?.message ||
              "Login failed. Please check your credentials."
          );
        }

        const data: LoginResponse = await response.json();
        const { jwt, cookie_token, user, documentId } = data;

        console.log('login response', data);

        // Set cookies
        setCookie("jwt", jwt);
        setCookie("userId", user.id);
        setCookie("documentId", documentId);
        setCookie("__cld_token__", cookie_token);

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred during login";
        setError(errorMessage);
        console.error("Login error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    login,
    isLoading: isLoading || !userAuth.initialized,
    error,
    user: userAuth.userInfo,
  };
}

/**
 * Hook for fetching user data
 */
export function useUserData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user data from API
   */
  const fetchUserData = useCallback(async (): Promise<{
    userInfo: User | null;
    notifications: Notification[];
    onePages: OnePage[];
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getCookie("userId");
      if (!userId) {
        throw new Error("No user ID found");
      }

      console.log('userData From USE AUTH - userId:', userId);

      const headers = getAuthHeaders();
      console.log('userData From USE AUTH - headers:', headers);

      // Fetch directly from Strapi API
      const [userResponse, notificationsResponse, onePagesResponse] =
        await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}?populate=*`, {
            headers,
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/one-pages`, { headers }),
        ]);

      // Check if all requests were successful
      if (!userResponse.ok) {
        console.error('User API error:', userResponse.status, userResponse.statusText);
        throw new Error(`Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`);
      }
      if (!notificationsResponse.ok) {
        console.error('Notifications API error:', notificationsResponse.status, notificationsResponse.statusText);
        throw new Error(`Failed to fetch notifications: ${notificationsResponse.status} ${notificationsResponse.statusText}`);
      }
      if (!onePagesResponse.ok) {
        console.error('OnePages API error:', onePagesResponse.status, onePagesResponse.statusText);
        throw new Error(`Failed to fetch one pages: ${onePagesResponse.status} ${onePagesResponse.statusText}`);
      }

      console.log('USER RESPONNNSE', userResponse);

      const [userInfo, notifications, onePagesRaw] = await Promise.all([
        userResponse.json(),
        notificationsResponse.json(),
        onePagesResponse.json(),
      ]);

      console.log('USER INNNNFO', userInfo);

      // Extract the data array from onePages response
      const onePages = onePagesRaw?.data || [];


      // FIX: Extract user from .data
      const userData = userInfo?.data || userInfo; // fallback for old API

      console.log('userData From USE AUTH', userData);

      const normalizedUserInfo: User | null = userData
        ? {
            id: String(userData.id || userData._id || ""),
            documentId: String(userData.documentId || ""),
            name:
              [userData.firstname, userData.lastname]
                .filter(Boolean)
                .join(" ") ||
              userData.name ||
              userData.username ||
              userData.email ||
              "Unknown User",
            email: String(userData.email || ""),
            role:
              typeof userData.role === "string"
                ? "user"
                : userData.role?.name || "user",
            avatar: userData.photo?.url || userData.avatar || undefined,
            company: userData.team?.name || userData.company || undefined,
            firstname: userData.firstname,
            lastname: userData.lastname,
            middlename: userData.middlename,
            photo: userData.photo,
            team: userData.team,
            // Additional fields required by the PDF generator
            position: userData.position,
            titles: userData.titles,
            license: userData.license,
            workEmail: userData.workEmail,
            workPhone: userData.workPhone,
            phone: userData.phone,
            cellPhone: userData.cellPhone,
            website: userData.website,
            brokerage: userData.brokerage,
            bio: userData.bio,
            isOnboarding: userData.isOnboarding,
            isStaffMember: userData.isStaffMember,
            notListed: userData.notListed,
            profileComplete: userData.profileComplete,
            websiteOptIn: userData.websiteOptIn,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            province: userData.province,
            // Social media links
            instagram: userData.instagram,
            facebook: userData.facebook,
            linkedin: userData.linkedin,
            twitter: userData.twitter,
            youtube: userData.youtube,
            // Application links
            applicationLink: userData.applicationLink,
            appointmentScheduleLink: userData.appointmentScheduleLink,
            // Feature-specific data
            qrCodes: userData.qrCodes || [],
            realtors: userData.realtors || [],
          }
        : null;

      console.log('normalizedUserInfo', normalizedUserInfo);

      // Normalize onePages data to prevent React child errors
      const normalizedOnePages = Array.isArray(onePages)
        ? onePages
            .filter((page: any) => {
              // Strict validation to ensure we have usable data
              return (
                page &&
                typeof page === "object" &&
                (page.Title || page.title || page.name) &&
                page.slug &&
                typeof page.slug === "string"
              );
            })
            .map((page: any) => {
              // Extract title from various possible fields
              const title = page.Title || page.title || page.name || "Untitled";

              return {
                id: String(page.id || page._id || Math.random()),
                _id: page._id,
                Title: String(title),
                slug: String(page.slug),
              };
            })
        : [];

      console.log("Normalized API user data:", normalizedUserInfo); // Debug log
      console.log("Normalized onePages:", normalizedOnePages); // Debug log

      return {
        userInfo: normalizedUserInfo,
        notifications: notifications || [],
        onePages: normalizedOnePages,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user data";
      setError(errorMessage);
      console.error("Error fetching user data:", error);

      return {
        userInfo: null,
        notifications: [],
        onePages: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchUserData,
    isLoading,
    error,
  };
}
