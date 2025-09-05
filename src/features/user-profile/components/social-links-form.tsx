"use client";

import React, { useEffect } from "react";
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
import { socialLinksSchema, type SocialLinksFormData } from "../lib/validation";
import type { SocialLinksInfo } from "../types";

interface SocialLinksFormProps {
  data?: SocialLinksInfo;
  onSubmit: (data: SocialLinksFormData) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function SocialLinksForm({
  data,
  onSubmit,
  isLoading,
  error,
}: SocialLinksFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      website: "",
      secondaryWebsite: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
      youtube: "",
      applicationLink: "",
      appointmentScheduleLink: "",
      googleReviewsLink: "",
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        website: data.website || "",
        secondaryWebsite: data.secondaryWebsite || "",
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        linkedin: data.linkedin || "",
        twitter: data.twitter || "",
        youtube: data.youtube || "",
        applicationLink: data.applicationLink || "",
        appointmentScheduleLink: data.appointmentScheduleLink || "",
        googleReviewsLink: data.googleReviewsLink || "",
      });
    }
  }, [data, reset]);

  const handleFormSubmit = async (formData: SocialLinksFormData) => {
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Form submission error:", err);
    }
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
        <CardTitle>Websites, Social Media & Links</CardTitle>
        <CardDescription>
          Add your website, social media profiles, and important links. These
          will be displayed on your Indi website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://indimortgage.ca"
                disabled={isSubmitting}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryWebsite">Secondary Website</Label>
              <Input
                id="secondaryWebsite"
                {...register("secondaryWebsite")}
                placeholder="https://axiommortgage.ca"
                disabled={isSubmitting}
              />
              {errors.secondaryWebsite && (
                <p className="text-sm text-red-500">
                  {errors.secondaryWebsite.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Page</Label>
              <Input
                id="instagram"
                {...register("instagram")}
                placeholder="https://instagram.com/jane-doe"
                disabled={isSubmitting}
              />
              {errors.instagram && (
                <p className="text-sm text-red-500">
                  {errors.instagram.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook Page</Label>
              <Input
                id="facebook"
                {...register("facebook")}
                placeholder="https://facebook.com/jane-doe"
                disabled={isSubmitting}
              />
              {errors.facebook && (
                <p className="text-sm text-red-500">
                  {errors.facebook.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Page</Label>
              <Input
                id="linkedin"
                {...register("linkedin")}
                placeholder="https://linkedin.com/in/jane-doe"
                disabled={isSubmitting}
              />
              {errors.linkedin && (
                <p className="text-sm text-red-500">
                  {errors.linkedin.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter Page</Label>
              <Input
                id="twitter"
                {...register("twitter")}
                placeholder="https://twitter.com/jane-doe"
                disabled={isSubmitting}
              />
              {errors.twitter && (
                <p className="text-sm text-red-500">{errors.twitter.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube Channel</Label>
              <Input
                id="youtube"
                {...register("youtube")}
                placeholder="https://youtube.com/c/jane-doe"
                disabled={isSubmitting}
              />
              {errors.youtube && (
                <p className="text-sm text-red-500">{errors.youtube.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationLink">Mortgage Application Link</Label>
              <Input
                id="applicationLink"
                {...register("applicationLink")}
                placeholder="https://mtgapp.scarlettnetwork.com/broker-name/home"
                disabled={isSubmitting}
              />
              {errors.applicationLink && (
                <p className="text-sm text-red-500">
                  {errors.applicationLink.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentScheduleLink">
                Appointment Schedule Link (e.g. Calendly)
              </Label>
              <Input
                id="appointmentScheduleLink"
                {...register("appointmentScheduleLink")}
                placeholder="Calendly or Other"
                disabled={isSubmitting}
              />
              {errors.appointmentScheduleLink && (
                <p className="text-sm text-red-500">
                  {errors.appointmentScheduleLink.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleReviewsLink">Google Reviews Link</Label>
              <Input
                id="googleReviewsLink"
                {...register("googleReviewsLink")}
                placeholder="Link to your Google Reviews page"
                disabled={isSubmitting}
              />
              {errors.googleReviewsLink && (
                <p className="text-sm text-red-500">
                  {errors.googleReviewsLink.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Social Links"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
