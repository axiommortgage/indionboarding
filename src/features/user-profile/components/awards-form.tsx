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
import { Switch } from "@/shared/ui/switch";

import { awardsSchema, type AwardsFormData } from "../lib/validation";
import type { Awards, Badge } from "../types";

interface AwardsFormProps {
  data?: Awards;
  onSubmit: (data: AwardsFormData) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function AwardsForm({
  data,
  onSubmit,
  isLoading,
  error,
}: AwardsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<AwardsFormData>({
    resolver: zodResolver(awardsSchema),
    defaultValues: {
      badges: [],
      showBadges: {
        website: false,
        emailSignature: false,
      },
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        badges: data.badges || [],
        showBadges: {
          website: data.showBadges?.website || false,
          emailSignature: data.showBadges?.emailSignature || false,
        },
      });
    }
  }, [data, reset]);

  const handleFormSubmit = async (formData: AwardsFormData) => {
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const handleBadgeToggle = (badgeId: string | number) => {
    const currentBadges = watch("badges");
    const updatedBadges = currentBadges.map((badge) =>
      badge.id === badgeId ? { ...badge, enabled: !badge.enabled } : badge
    );
    setValue("badges", updatedBadges);
  };

  if (!data && isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const badges = watch("badges") || [];
  const showBadges = watch("showBadges");

  // Debug badge data structure
  console.log("Badges data:", badges);
  console.log("First badge structure:", badges[0]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Hidden input to ensure form has registered fields */}
      <input type="hidden" {...register("badges")} />
      <input type="hidden" {...register("showBadges")} />

      {/* Award Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Your Award Badges</CardTitle>
          <CardDescription>
            Manage your professional badges and awards. Enable or disable badges
            to control their display.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{badge.title}</h4>
                      <Switch
                        checked={badge.enabled}
                        onCheckedChange={() => handleBadgeToggle(badge.id)}
                        disabled={isSubmitting}
                      />
                    </div>
                    {(badge.image?.url ||
                      badge.image?.formats?.thumbnail?.url ||
                      badge.image?.formats?.small?.url) && (
                      <div className="flex justify-center">
                        <img
                          src={
                            badge.image?.url ||
                            badge.image?.formats?.thumbnail?.url ||
                            badge.image?.formats?.small?.url
                          }
                          alt={badge.title || "Badge"}
                          className="h-auto w-28 object-contain"
                          onError={(e) =>
                            console.error("Image failed to load:", badge.image)
                          }
                        />
                      </div>
                    )}
                    {/* Debug image structure */}
                    {!badge.image?.url &&
                      !badge.image?.formats?.thumbnail?.url &&
                      !badge.image?.formats?.small?.url && (
                        <div className="text-xs text-muted-foreground">
                          No image URL found. Badge image structure:{" "}
                          {JSON.stringify(badge.image)}
                        </div>
                      )}
                    <div className="text-sm text-muted-foreground">
                      Status: {badge.enabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No badges available at the moment.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badge Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Show Award Badges on:</CardTitle>
          <CardDescription>
            Choose where your enabled badges should be displayed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="website-badges">Your Indi Website</Label>
                <p className="text-sm text-muted-foreground">
                  Display badges on your personal Indi website
                </p>
              </div>
              <Switch
                id="website-badges"
                checked={showBadges?.website || false}
                onCheckedChange={(checked) =>
                  setValue("showBadges.website", checked)
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-signature-badges">Email Signature</Label>
                <p className="text-sm text-muted-foreground">
                  Include badges in your email signature
                </p>
              </div>
              <Switch
                id="email-signature-badges"
                checked={showBadges?.emailSignature || false}
                onCheckedChange={(checked) =>
                  setValue("showBadges.emailSignature", checked)
                }
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Badge Settings"}
        </Button>
      </div>
    </form>
  );
}
