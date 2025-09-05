"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/shared/hooks/use-auth";
import { useProfile } from "@/features/user-profile/hooks/use-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Loading } from "@/shared/ui/loading";
import { UserInfoForm } from "@/features/user-profile/components/user-info-form";
import { ContactInfoForm } from "@/features/user-profile/components/contact-info-form";
import { SocialLinksForm } from "@/features/user-profile/components/social-links-form";
import { AddressesForm } from "@/features/user-profile/components/addresses-form";
import { AwardsForm } from "@/features/user-profile/components/awards-form";
import type {
  UserInfoFormData,
  ContactInfoFormData,
  SocialLinksFormData,
  OfficeAddressFormData,
  PersonalAddressFormData,
  AwardsFormData,
} from "@/features/user-profile/lib/validation";
import type {
  FlatUserProfile,
  PersonalAddress,
} from "@/features/user-profile/types";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    profile,
    isLoading: profileLoading,
    error,
    updateProfile,
    uploadPhoto,
    refetchProfile,
  } = useProfile();
  const [selectedTab, setSelectedTab] = useState("your-info");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  console.log("profile", profile);

  // Load profile data when component mounts
  useEffect(() => {
    if (user && !profile && !profileLoading) {
      refetchProfile();
    }
  }, [user, profile, profileLoading, refetchProfile]);

  // Handle user info form submission
  const handleUserInfoSubmit = async (data: UserInfoFormData) => {
    try {
      await updateProfile(data);
    } catch (error) {
      // Error is handled by the hook
      throw error;
    }
  };

  // Handle contact info form submission
  const handleContactInfoSubmit = async (data: ContactInfoFormData) => {
    try {
      await updateProfile(data);
    } catch (error) {
      // Error is handled by the hook
      throw error;
    }
  };

  // Handle social links form submission
  const handleSocialLinksSubmit = async (data: SocialLinksFormData) => {
    try {
      await updateProfile(data);
    } catch (error) {
      throw error;
    }
  };

  // Handle addresses form submission
  const handleAddressesSubmit = async (data: {
    officeAddress: OfficeAddressFormData;
    personalAddress: PersonalAddressFormData;
  }) => {
    try {
      // Merge office and personal address data into a single object
      const mergedData = {
        ...data.officeAddress,
        ...data.personalAddress,
      };
      await updateProfile(mergedData);
    } catch (error) {
      throw error;
    }
  };

  // Handle awards form submission
  const handleAwardsSubmit = async (data: AwardsFormData) => {
    try {
      await updateProfile(data);
    } catch (error) {
      throw error;
    }
  };

  // Handle photo upload from file input (legacy - not used anymore)
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      await uploadPhoto(file);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle photo upload from cropped image (base64 blob URL)
  const handlePhotoUploadFromCropper = async (croppedImageUrl: string, filename?: string) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Convert blob URL to File object
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Use original filename if provided, otherwise fallback to default
      const finalFilename = filename || "profile-photo.jpg";
      const file = new File([blob], finalFilename, { type: "image/jpeg" });
      
      await uploadPhoto(file);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
      throw error; // Re-throw to let the form handle it
    } finally {
      setIsUploading(false);
    }
  };

  // Memoize form data to prevent unnecessary re-renders
  // Map flat profile data to nested structure expected by forms
  const userInfoData = useMemo(() => {
    console.log("userInfoData useMemo called with profile:", profile);
    if (!profile) return undefined;

    // Handle both nested and flat structures
    if ("userInfo" in profile && profile.userInfo) {
      console.log("Using nested userInfo structure");
      return profile.userInfo;
    }

    // Map flat structure to nested structure
    const flatProfile = profile as FlatUserProfile;
    console.log("Using flat profile structure, photo:", flatProfile.photo);
    const result = {
      id: flatProfile.id?.toString(),
      firstname: flatProfile.firstname || "",
      middlename: flatProfile.middlename || "",
      lastname: flatProfile.lastname || "",
      legalName: flatProfile.legalName || "",
      preferredName: flatProfile.preferredName || "",
      titles: flatProfile.titles || "",
      position: flatProfile.position || "",
      license: flatProfile.license || "",
      tshirtSize: flatProfile.tshirtSize,
      bio: flatProfile.bio || "",
      additionalNotes: flatProfile.additionalNotes || "",
      photo: flatProfile.photo,
    };
    console.log("userInfoData result:", result);
    return result;
  }, [profile]);

  const contactInfoData = useMemo(() => {
    if (!profile) return undefined;

    // Handle both nested and flat structures
    if ("contactInfo" in profile && profile.contactInfo) {
      return profile.contactInfo;
    }

    // Map flat structure to nested structure
    const flatProfile = profile as FlatUserProfile;
    return {
      email: flatProfile.email || "",
      workEmail: flatProfile.workEmail || "",
      phone: flatProfile.phone || "",
      ext: flatProfile.ext || "",
      homePhone: flatProfile.homePhone || "",
      cellPhone: flatProfile.cellPhone || "",
      emergencyContact: flatProfile.emergencyContact || "",
      emergencyPhone: flatProfile.emergencyPhone || "",
      dietRestriction: flatProfile.dietRestriction || "",
    };
  }, [profile]);

  const socialLinksData = useMemo(() => {
    if (!profile) return undefined;

    // Handle both nested and flat structures
    if ("socialLinks" in profile && profile.socialLinks) {
      return profile.socialLinks;
    }

    // Map flat structure to nested structure
    const flatProfile = profile as FlatUserProfile;
    return {
      website: flatProfile.website || "",
      secondaryWebsite: flatProfile.secondaryWebsite || "",
      instagram: flatProfile.instagram || "",
      facebook: flatProfile.facebook || "",
      linkedin: flatProfile.linkedin || "",
      twitter: flatProfile.twitter || "",
      youtube: flatProfile.youtube || "",
      applicationLink: flatProfile.applicationLink || "",
      appointmentScheduleLink: flatProfile.appointmentScheduleLink || "",
      googleReviewsLink: flatProfile.googleReviewsLink || "",
    };
  }, [profile]);

  const officeAddressData = useMemo(() => {
    if (!profile) return undefined;

    // Handle both nested and flat structures
    if ("officeAddress" in profile && profile.officeAddress) {
      return profile.officeAddress;
    }

    // Map flat structure to nested structure
    const flatProfile = profile as FlatUserProfile;
    return {
      address: flatProfile.address || "",
      suiteUnit: flatProfile.suiteUnit || "",
      city: flatProfile.city || "",
      province: flatProfile.province || "",
      postalCode: flatProfile.postalCode || "",
      provinceLicenseNumber: flatProfile.provinceLicenseNumber || "",
      branch: flatProfile.branch,
    };
  }, [profile]);

  const personalAddressData = useMemo(() => {
    if (!profile) return undefined;

    // Handle both nested and flat structures
    if (
      "personalAddress" in profile &&
      typeof profile.personalAddress === "object" &&
      profile.personalAddress
    ) {
      return profile.personalAddress as PersonalAddress;
    }

    // Map flat structure to nested structure
    const flatProfile = profile as FlatUserProfile;
    return {
      personalAddress: flatProfile.personalAddress || "",
      personalSuiteUnit: flatProfile.personalSuiteUnit || "",
      personalCity: flatProfile.personalCity || "",
      personalProvince: flatProfile.personalProvince || "",
      personalPostalCode: flatProfile.personalPostalCode || "",
    } as PersonalAddress;
  }, [profile]);

  const awardsData = useMemo(() => {
    if (!profile) return undefined;

    // Handle both nested and flat structures
    if ("awards" in profile && profile.awards) {
      return profile.awards;
    }

    // Map flat structure to nested structure
    const flatProfile = profile as FlatUserProfile;
    return {
      badges: flatProfile.badges || [],
      showBadges: flatProfile.showBadges || {
        website: false,
        emailSignature: false,
      },
    };
  }, [profile]);

  // Debug logging after all memoized data is created
  console.log("userInfoData", userInfoData);
  console.log("contactInfoData", contactInfoData);
  console.log("socialLinksData", socialLinksData);
  console.log("officeAddressData", officeAddressData);
  console.log("personalAddressData", personalAddressData);
  console.log("awardsData", awardsData);
  console.log("Raw profile badges:", (profile as any)?.badges);

  // Show loading state
  if (authLoading || !user) {
    return <Loading />;
  }

  // Get user photo URL
  const getUserPhotoUrl = () => {
    if (!profile) return undefined;

    // Handle both nested structure (UserProfile) and flat structure (direct user object)
    let photo;
    if ("userInfo" in profile && profile.userInfo?.photo) {
      photo = profile.userInfo.photo;
    } else if ("photo" in profile) {
      photo = (profile as FlatUserProfile).photo;
    }

    if (photo?.formats?.squared?.url) {
      return photo.formats.squared.url;
    }
    if (photo?.formats?.medium?.url) {
      return photo.formats.medium.url;
    }
    return photo?.url;
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!profile) {
      const firstName = user?.firstname || "";
      const lastName = user?.lastname || "";
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    // Handle both nested structure (UserProfile) and flat structure (direct user object)
    let firstName = "";
    let lastName = "";

    if ("userInfo" in profile && profile.userInfo) {
      firstName = profile.userInfo.firstname || "";
      lastName = profile.userInfo.lastname || "";
    } else if ("firstname" in profile) {
      const flatProfile = profile as FlatUserProfile;
      firstName = flatProfile.firstname || "";
      lastName = flatProfile.lastname || "";
    }

    if (!firstName && !lastName) {
      firstName = user?.firstname || "";
      lastName = user?.lastname || "";
    }

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="your-info">Your Info</TabsTrigger>
            <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
            <TabsTrigger value="social-links">Social & Links</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="awards">Your Awards</TabsTrigger>
          </TabsList>

          {/* Your Info Tab */}
          <TabsContent value="your-info" className="space-y-6">
            <UserInfoForm
              data={userInfoData}
              onSubmit={handleUserInfoSubmit}
              onPhotoUpload={handlePhotoUploadFromCropper}
              isLoading={profileLoading}
              error={error}
            />
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact-info" className="space-y-6">
            <ContactInfoForm
              data={contactInfoData}
              onSubmit={handleContactInfoSubmit}
              isLoading={profileLoading}
              error={error}
            />
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social-links" className="space-y-6">
            <SocialLinksForm
              data={socialLinksData}
              onSubmit={handleSocialLinksSubmit}
              isLoading={profileLoading}
              error={error}
            />
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <AddressesForm
              officeData={officeAddressData}
              personalData={personalAddressData}
              onSubmit={handleAddressesSubmit}
              isLoading={profileLoading}
              error={error}
            />
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards" className="space-y-6">
            <AwardsForm
              data={awardsData}
              onSubmit={handleAwardsSubmit}
              isLoading={profileLoading}
              error={error}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
