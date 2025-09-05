"use client";

import React, { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import {
  officeAddressSchema,
  personalAddressSchema,
  type OfficeAddressFormData,
  type PersonalAddressFormData,
} from "../lib/validation";
import type { OfficeAddress, PersonalAddress } from "../types";
import { useBranches, type Branch } from "../hooks/use-branches";

interface AddressesFormProps {
  officeData?: OfficeAddress;
  personalData?: PersonalAddress;
  onSubmit: (data: {
    officeAddress: OfficeAddressFormData;
    personalAddress: PersonalAddressFormData;
  }) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function AddressesForm({
  officeData,
  personalData,
  onSubmit,
  isLoading,
  error,
}: AddressesFormProps) {
  const {
    branches,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<OfficeAddressFormData & PersonalAddressFormData>({
    resolver: zodResolver(officeAddressSchema.merge(personalAddressSchema)),
    defaultValues: {
      // Office Address
      address: "",
      suiteUnit: "",
      city: "",
      province: undefined,
      postalCode: "",
      provinceLicenseNumber: "",
      // Personal Address
      personalAddress: "",
      personalSuiteUnit: "",
      personalCity: "",
      personalProvince: undefined,
      personalPostalCode: "",
    },
  });

  // Handle branch selection
  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);

    if (branchId && branchId !== "select") {
      const selectedBranch = branches.find((branch) => branch.id === branchId);
      if (selectedBranch) {
        setValue("address", selectedBranch.address || "");
        setValue("suiteUnit", selectedBranch.suiteUnit || "");
        setValue("city", selectedBranch.city || "");

        // Convert province to proper case to match our form options
        const provinceMap: Record<string, string> = {
          alberta: "Alberta",
          britishcolumbia: "British Columbia",
          manitoba: "Manitoba",
          newbrunswick: "New Brunswick",
          newfoundlandandlabrador: "Newfoundland And Labrador",
          northwestterritories: "Northwest Territories",
          novascotia: "Nova Scotia",
          nunavut: "Nunavut",
          ontario: "Ontario",
          princeedwardisland: "Prince Edward Island",
          quebec: "Quebec",
          saskatchewan: "Saskatchewan",
          yukon: "Yukon",
        };

        const normalizedProvince =
          provinceMap[selectedBranch.province.toLowerCase()] ||
          selectedBranch.province;
        setValue("province", normalizedProvince as any);
        setValue("postalCode", selectedBranch.postalCode || "");
        setValue(
          "provinceLicenseNumber",
          selectedBranch.provinceLicenseNumber || ""
        );
      }
    } else {
      // Clear office address fields when "Select" is chosen
      setValue("address", "");
      setValue("suiteUnit", "");
      setValue("city", "");
      setValue("province", "" as any);
      setValue("postalCode", "");
      setValue("provinceLicenseNumber", "");
    }
  };

  // Reset form when data changes
  useEffect(() => {
    if (officeData || personalData) {
      reset({
        // Office Address
        address: officeData?.address || "",
        suiteUnit: officeData?.suiteUnit || "",
        city: officeData?.city || "",
        province: (officeData?.province as any) || "",
        postalCode: officeData?.postalCode || "",
        provinceLicenseNumber: officeData?.provinceLicenseNumber || "",
        // Personal Address
        personalAddress: personalData?.personalAddress || "",
        personalSuiteUnit: personalData?.personalSuiteUnit || "",
        personalCity: personalData?.personalCity || "",
        personalProvince: (personalData?.personalProvince as any) || "",
        personalPostalCode: personalData?.personalPostalCode || "",
      });

      // If office data has a branch, try to find and select the matching branch
      if (officeData?.branch?.id) {
        setSelectedBranchId(officeData.branch.id);
      }
    }
  }, [officeData, personalData, reset]);

  const handleFormSubmit = async (
    formData: OfficeAddressFormData & PersonalAddressFormData
  ) => {
    try {
      const {
        personalAddress,
        personalSuiteUnit,
        personalCity,
        personalProvince,
        personalPostalCode,
        ...officeAddress
      } = formData;

      // Add the selected branch to the office address data
      const selectedBranch = branches.find(
        (branch) => branch.id === selectedBranchId
      );
      const officeAddressWithBranch = {
        ...officeAddress,
        branch: selectedBranch || null,
      };

      await onSubmit({
        officeAddress: officeAddressWithBranch,
        personalAddress: {
          personalAddress,
          personalSuiteUnit,
          personalCity,
          personalProvince,
          personalPostalCode,
        },
      });
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  if ((!officeData && !personalData && isLoading) || branchesLoading) {
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

  const PROVINCE_OPTIONS = [
    { value: "Alberta", label: "Alberta" },
    { value: "British Columbia", label: "British Columbia" },
    { value: "Manitoba", label: "Manitoba" },
    { value: "New Brunswick", label: "New Brunswick" },
    { value: "Newfoundland And Labrador", label: "Newfoundland And Labrador" },
    { value: "Northwest Territories", label: "Northwest Territories" },
    { value: "Nova Scotia", label: "Nova Scotia" },
    { value: "Nunavut", label: "Nunavut" },
    { value: "Ontario", label: "Ontario" },
    { value: "Prince Edward Island", label: "Prince Edward Island" },
    { value: "Quebec", label: "Quebec" },
    { value: "Saskatchewan", label: "Saskatchewan" },
    { value: "Yukon", label: "Yukon" },
  ];

  return (
    <div className="space-y-6">
      {/* Office Address */}
      <Card>
        <CardHeader>
          <CardTitle>Office Address</CardTitle>
          <CardDescription>
            Your business address information. Select a branch to automatically
            populate the address fields. This will be displayed on your Indi
            website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || branchesError) && (
            <Alert variant="destructive" className="mb-6">
              {error || branchesError}
            </Alert>
          )}

          <div className="space-y-6">
            {/* Branch Selector */}
            <div className="space-y-2">
              <Label htmlFor="branch-select">Select an Indi Branch</Label>
              <Select
                value={selectedBranchId}
                onValueChange={handleBranchSelect}
                disabled={isSubmitting || branchesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      branchesLoading
                        ? "Loading branches..."
                        : "Select a branch"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select</SelectItem>
                  {Array.isArray(branches) &&
                    branches.map((branch) => {
                      const cityName =
                        branch.city.charAt(0).toUpperCase() +
                        branch.city.slice(1);
                      const licenseText =
                        branch.provinceLicenseNumber &&
                        branch.provinceLicenseNumber.length > 0
                          ? `#${branch.provinceLicenseNumber}`
                          : "NA";
                      const displayText = `${cityName} - License: ${licenseText}`;

                      return (
                        <SelectItem key={branch.id} value={branch.id}>
                          {displayText}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">
                  Office Address (Street){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="223 14 Street NW"
                  disabled={true}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="suiteUnit">Suite/Unit</Label>
                <Input
                  id="suiteUnit"
                  {...register("suiteUnit")}
                  placeholder="Suite/Unit"
                  disabled={true}
                />
                {errors.suiteUnit && (
                  <p className="text-sm text-red-500">
                    {errors.suiteUnit.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Calgary"
                  disabled={true}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">
                  Province <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("province")}
                  onValueChange={(value: any) => setValue("province", value)}
                  disabled={true}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCE_OPTIONS.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {province.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province && (
                  <p className="text-sm text-red-500">
                    {errors.province.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder="T2N 1Z6"
                  disabled={true}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provinceLicenseNumber">
                  Province License Number
                </Label>
                <Input
                  id="provinceLicenseNumber"
                  {...register("provinceLicenseNumber")}
                  placeholder="License Number"
                  disabled={true}
                />
                {errors.provinceLicenseNumber && (
                  <p className="text-sm text-red-500">
                    {errors.provinceLicenseNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Address */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Address</CardTitle>
          <CardDescription>
            Your personal address information for internal records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalAddress">
                  Personal Address (Street){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="personalAddress"
                  {...register("personalAddress")}
                  placeholder="223 14 Street NW"
                  disabled={isSubmitting}
                />
                {errors.personalAddress && (
                  <p className="text-sm text-red-500">
                    {errors.personalAddress.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalSuiteUnit">Suite/Unit</Label>
                <Input
                  id="personalSuiteUnit"
                  {...register("personalSuiteUnit")}
                  placeholder="Suite/Unit"
                  disabled={isSubmitting}
                />
                {errors.personalSuiteUnit && (
                  <p className="text-sm text-red-500">
                    {errors.personalSuiteUnit.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalCity">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="personalCity"
                  {...register("personalCity")}
                  placeholder="Calgary"
                  disabled={isSubmitting}
                />
                {errors.personalCity && (
                  <p className="text-sm text-red-500">
                    {errors.personalCity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalProvince">
                  Province <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("personalProvince")}
                  onValueChange={(value: any) =>
                    setValue("personalProvince", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCE_OPTIONS.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {province.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.personalProvince && (
                  <p className="text-sm text-red-500">
                    {errors.personalProvince.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalPostalCode">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="personalPostalCode"
                  {...register("personalPostalCode")}
                  placeholder="T2N 1Z6"
                  disabled={isSubmitting}
                />
                {errors.personalPostalCode && (
                  <p className="text-sm text-red-500">
                    {errors.personalPostalCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Addresses"}
        </Button>
      </div>
    </div>
  );
}
