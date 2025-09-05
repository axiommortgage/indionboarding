"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert } from "@/shared/ui/alert";
import { ImageCropper } from "@/shared/components/image-cropper";
import { showSuccess, showError } from "@/shared/lib/toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Expand, Trash2, Upload } from "lucide-react";
import {
  userInfoSchema,
  type UserInfoFormData,
  TSHIRT_SIZE_OPTIONS,
} from "../lib/validation";
import type { UserInfo } from "../types";

interface UserInfoFormProps {
  data?: UserInfo;
  onSubmit: (data: UserInfoFormData) => Promise<void>;
  onPhotoUpload?: (photo: string, filename?: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function UserInfoForm({
  data,
  onSubmit,
  onPhotoUpload,
  isLoading,
  error,
}: UserInfoFormProps) {
  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [imageError, setImageError] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo preview modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      firstname: "",
      middlename: "",
      lastname: "",
      legalName: "",
      preferredName: "",
      titles: "",
      position: "",
      license: "",
      tshirtSize: undefined,
      bio: "",
      additionalNotes: "",
    },
  });

  // Reset form when data changes
  useEffect(() => {
    console.log("UserInfoForm useEffect: data prop changed", data);
    if (data) {
      reset({
        firstname: data.firstname || "",
        middlename: data.middlename || "",
        lastname: data.lastname || "",
        legalName: data.legalName || "",
        preferredName: data.preferredName || "",
        titles: data.titles || "",
        position: data.position || "",
        license: data.license || "",
        tshirtSize: data.tshirtSize,
        bio: data.bio || "",
        additionalNotes: data.additionalNotes || "",
      });
    }
  }, [data, reset]);

  const bioValue = watch("bio") || "";
  const notesValue = watch("additionalNotes") || "";

  const handleFormSubmit = async (formData: UserInfoFormData) => {
    try {
      await onSubmit(formData);
    } catch (err) {
      // Error handling is done by parent component
      console.error("Form submission error:", err);
    }
  };

  // Image handling functions
  const checkImageDimensions = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 500 || img.height < 500) {
          reject(new Error("Image must be at least 500x500 pixels"));
        } else {
          resolve();
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFileName(file.name);
      setImageError("");

      try {
        await checkImageDimensions(file);

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          setSelectedImage(reader.result as string);
          setShowCropper(true);
        });
        reader.readAsDataURL(file);
      } catch (error) {
        setImageError(error instanceof Error ? error.message : "Invalid image");
        // Reset the input file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    setShowCropper(false);
    setIsUploadingPhoto(true);
    setImageError("");

    try {
      if (onPhotoUpload) {
        // Pass both the cropped image and original filename
        await onPhotoUpload(croppedImage, originalFileName);
        // Show success toast notification
        showSuccess("Photo uploaded successfully!", "Your profile photo has been updated.");
        setImageError("");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload photo. Please try again.";
      setImageError(errorMessage);
      // Show error toast notification
      showError("Photo upload failed", errorMessage);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const closeCropper = () => {
    setShowCropper(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const photoUrl = useMemo(() => {
    console.log("getPhotoUrl called with data:", data);
    if (data?.photo) {
      console.log("Photo object:", data.photo);
      console.log("Photo formats:", data.photo.formats);
      
      // Try to get the best available format, preferring squared for profile display
      if (data.photo.formats?.squared) {
        console.log("Using squared format:", data.photo.formats.squared.url);
        return data.photo.formats.squared.url;
      }
      if (data.photo.formats?.medium) {
        console.log("Using medium format:", data.photo.formats.medium.url);
        return data.photo.formats.medium.url;
      }
      if (data.photo.formats?.small) {
        console.log("Using small format:", data.photo.formats.small.url);
        return data.photo.formats.small.url;
      }
      if (data.photo.formats?.thumbnail) {
        console.log("Using thumbnail format:", data.photo.formats.thumbnail.url);
        return data.photo.formats.thumbnail.url;
      }
      // Fallback to original URL
      console.log("Using original URL:", data.photo.url);
      return data.photo.url;
    }
    console.log("No photo data available");
    return null;
  }, [data?.photo]);

  // Photo modal handlers
  const handlePhotoClick = () => {
    setShowPhotoModal(true);
  };

  const handleDeletePhoto = async () => {
    try {
      setIsUploadingPhoto(true);
      setImageError("");

      // Create a File object from the default image
      const response = await fetch('/images/indi-symbol.png');
      const blob = await response.blob();
      const file = new File([blob], 'indi-symbol.png', { type: 'image/png' });

      if (onPhotoUpload) {
        await onPhotoUpload(URL.createObjectURL(file), "indi-symbol.png");
        showSuccess("Photo deleted successfully!", "Your profile photo has been reset to default.");
        setShowPhotoModal(false);
      }
    } catch (err) {
      console.error("Delete photo error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete photo. Please try again.";
      setImageError(errorMessage);
      showError("Delete photo failed", errorMessage);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleChangePhoto = () => {
    setShowPhotoModal(false);
    fileInputRef.current?.click();
  };

  if (!data && isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details. This information will be reflected on
          your Indi website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Photo Section */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {photoUrl ? (
                <div 
                  className="relative w-20 h-20 rounded-full cursor-pointer group"
                  onClick={handlePhotoClick}
                >
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
              ) : (
                <div 
                  className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                  onClick={handlePhotoClick}
                >
                  <span className="text-gray-500 text-sm">No Photo</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Profile Photo
              </h4>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                </Button>
                {imageError && (
                  <p className="text-sm text-red-500">{imageError}</p>
                )}
                <p className="text-xs text-gray-500">
                  Image must be at least 500x500 pixels
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstname">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstname"
                {...register("firstname")}
                placeholder="John"
                disabled={isSubmitting}
              />
              {errors.firstname && (
                <p className="text-sm text-red-500">
                  {errors.firstname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middlename">Middle Name</Label>
              <Input
                id="middlename"
                {...register("middlename")}
                placeholder="Michael"
                disabled={isSubmitting}
              />
              {errors.middlename && (
                <p className="text-sm text-red-500">
                  {errors.middlename.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastname">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastname"
                {...register("lastname")}
                placeholder="Doe"
                disabled={isSubmitting}
              />
              {errors.lastname && (
                <p className="text-sm text-red-500">
                  {errors.lastname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                {...register("legalName")}
                placeholder="John Michael Doe"
                disabled={isSubmitting}
              />
              {errors.legalName && (
                <p className="text-sm text-red-500">
                  {errors.legalName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                {...register("preferredName")}
                placeholder="Johnny"
                disabled={isSubmitting}
              />
              {errors.preferredName && (
                <p className="text-sm text-red-500">
                  {errors.preferredName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="titles">Title After Name (e.g. AMP, BCC)</Label>
              <Input
                id="titles"
                {...register("titles")}
                placeholder="AMP, BCC, BCO"
                disabled={isSubmitting}
              />
              {errors.titles && (
                <p className="text-sm text-red-500">{errors.titles.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                {...register("position")}
                placeholder="Mortgage Broker, BCS"
                disabled={isSubmitting}
              />
              {errors.position && (
                <p className="text-sm text-red-500">
                  {errors.position.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                {...register("license")}
                placeholder="#AXM003333"
                disabled={isSubmitting}
              />
              {errors.license && (
                <p className="text-sm text-red-500">{errors.license.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tshirtSize">T-Shirt Size</Label>
            <select
              id="tshirtSize"
              {...register("tshirtSize")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              <option value="">Select a size</option>
              {TSHIRT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.tshirtSize && (
              <p className="text-sm text-red-500">
                {errors.tshirtSize.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">
              More About Me (Bio) <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="bio"
              {...register("bio")}
              rows={6}
              maxLength={800}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell us about yourself..."
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {bioValue.length}/800
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <textarea
              id="additionalNotes"
              {...register("additionalNotes")}
              rows={6}
              maxLength={800}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional information..."
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              {errors.additionalNotes && (
                <p className="text-sm text-red-500">
                  {errors.additionalNotes.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {notesValue.length}/800
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Saving..." : "Save Information"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Photo Preview Modal */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center py-6">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile Photo Preview"
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-500 text-lg">No Photo</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleDeletePhoto}
              disabled={isUploadingPhoto}
              className="flex items-center space-x-2 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Image</span>
            </Button>
            <Button
              onClick={handleChangePhoto}
              disabled={isUploadingPhoto}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Change Image</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onClose={closeCropper}
        />
      )}
    </Card>
  );
}
