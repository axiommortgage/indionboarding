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
import { contactInfoSchema, type ContactInfoFormData } from "../lib/validation";
import type { ContactInfo } from "../types";

interface ContactInfoFormProps {
  data?: ContactInfo;
  onSubmit: (data: ContactInfoFormData) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function ContactInfoForm({
  data,
  onSubmit,
  isLoading,
  error,
}: ContactInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: "",
      workEmail: "",
      phone: "",
      ext: "",
      homePhone: "",
      cellPhone: "",
      emergencyContact: "",
      emergencyPhone: "",
      dietRestriction: "",
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        email: data.email || "",
        workEmail: data.workEmail || "",
        phone: data.phone || "",
        ext: data.ext || "",
        homePhone: data.homePhone || "",
        cellPhone: data.cellPhone || "",
        emergencyContact: data.emergencyContact || "",
        emergencyPhone: data.emergencyPhone || "",
        dietRestriction: data.dietRestriction || "",
      });
    }
  }, [data, reset]);

  const handleFormSubmit = async (formData: ContactInfoFormData) => {
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
          {Array.from({ length: 8 }).map((_, i) => (
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
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Manage your contact details and emergency information.
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
              <Label htmlFor="email">
                Login Email
                <span className="ml-2 text-xs text-muted-foreground">
                  (Contact support to change)
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john.doe@indimortgage.ca"
                disabled={true} // Login email is immutable
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEmail">Preferred Email Address</Label>
              <Input
                id="workEmail"
                type="email"
                {...register("workEmail")}
                placeholder="john.doe@indimortgage.ca"
                disabled={isSubmitting}
              />
              {errors.workEmail && (
                <p className="text-sm text-red-500">
                  {errors.workEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Phone Numbers</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="phone">
                  Preferred Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="999-888-7777"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ext">Extension</Label>
                <Input
                  id="ext"
                  type="tel"
                  {...register("ext")}
                  placeholder="123"
                  disabled={isSubmitting}
                />
                {errors.ext && (
                  <p className="text-sm text-red-500">{errors.ext.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homePhone">Home Phone</Label>
                <Input
                  id="homePhone"
                  type="tel"
                  {...register("homePhone")}
                  placeholder="999-888-7777"
                  disabled={isSubmitting}
                />
                {errors.homePhone && (
                  <p className="text-sm text-red-500">
                    {errors.homePhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cellPhone">Cell Phone</Label>
                <Input
                  id="cellPhone"
                  type="tel"
                  {...register("cellPhone")}
                  placeholder="999-888-7777"
                  disabled={isSubmitting}
                />
                {errors.cellPhone && (
                  <p className="text-sm text-red-500">
                    {errors.cellPhone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  {...register("emergencyContact")}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-500">
                    {errors.emergencyContact.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  {...register("emergencyPhone")}
                  placeholder="999-888-7777"
                  disabled={isSubmitting}
                />
                {errors.emergencyPhone && (
                  <p className="text-sm text-red-500">
                    {errors.emergencyPhone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietRestriction">Dietary Restrictions</Label>
            <Input
              id="dietRestriction"
              {...register("dietRestriction")}
              placeholder="E.g.: Celiac disease, vegetarian, allergies..."
              disabled={isSubmitting}
            />
            {errors.dietRestriction && (
              <p className="text-sm text-red-500">
                {errors.dietRestriction.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Saving..." : "Save Contact Info"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
