import { useState, useCallback } from "react";
import { apiClient } from "@/shared/lib/api";
import type { ProfileData, ProfileFormData } from "../types";
import { getCookie } from "@/shared/lib/auth";

interface UseProfileResult {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (payload: ProfileFormData) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;
  refetchProfile: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user ID from cookies
      const userId = getCookie("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await apiClient.get<ProfileData>(
        `/users/${userId}?populate=*`
      );

      if (response.success) {
        // Handle Strapi response format: response.data contains { data: {...}, meta: {...} }
        const strapiData = response.data as any;
        const profileData = strapiData?.data || strapiData;
        setProfile(profileData || null);
      } else {
        setError(response.error || "Failed to fetch profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Separate function for refetching without setting loading state
  const refetchProfileSilently = useCallback(async () => {
    try {
      setError(null);

      // Get user ID from cookies
      const userId = getCookie("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      console.log("Refetching profile for userId:", userId);
      const response = await apiClient.get<ProfileData>(
        `/users/${userId}?populate=*`
      );

      console.log("Profile refetch response:", response);

      if (response.success) {
        // Handle Strapi response format: response.data contains { data: {...}, meta: {...} }
        const strapiData = response.data as any;
        const profileData = strapiData?.data || strapiData;
        console.log("Setting new profile data:", profileData);
        setProfile(profileData || null);
      } else {
        console.error("Profile refetch failed:", response.error);
        setError(response.error || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("Profile refetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    }
  }, []);

  const updateProfile = useCallback(async (payload: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user ID from cookies
      const userId = getCookie("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await apiClient.put<ProfileData>(
        `/users/${userId}?populate=*`,
        payload
      );

      if (response.success) {
        // Handle Strapi response format: response.data contains { data: {...}, meta: {...} }
        const strapiData = response.data as any;
        const profileData = strapiData?.data || strapiData;
        setProfile(profileData);
      } else {
        setError(response.error || "Failed to update profile");
        throw new Error(response.error || "Failed to update profile");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadPhoto = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user ID from cookies
        const userId = getCookie("userId");
        if (!userId) {
          throw new Error("User ID not found");
        }

        // Get JWT token from cookies
        const jwt = getCookie("jwt");
        if (!jwt) throw new Error("Not authenticated");

        const formData = new FormData();
        formData.append("files", file); // The file to upload
        formData.append("refId", userId); // The ID of the user entry
        formData.append("ref", "plugin::users-permissions.user"); // The model UID for users
        formData.append("field", "photo"); // The photo field in the user model

        // Upload to Strapi V5 upload endpoint with entry linking
        const uploadResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:1339/api"
          }/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Upload error response:", errorText);
          throw new Error(`HTTP error! status: ${uploadResponse.status}`);
        }

        const uploadData = await uploadResponse.json();
        console.log("Upload successful:", uploadData);
        
        // Refetch profile to get the updated photo
        console.log("About to refetch profile...");
        try {
          await refetchProfile();
          console.log("Profile refetch completed successfully");
        } catch (refetchError) {
          console.error("Profile refetch failed:", refetchError);
          // Don't throw here, as the upload was successful
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload photo";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refetchProfile]
  );

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadPhoto,
    refetchProfile,
  };
}
