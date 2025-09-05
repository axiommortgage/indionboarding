"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessCardSchema, BusinessCardFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

export function useBusinessCardForm() {
  const { userAuth } = useAuthContext();
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<BusinessCardFormData>({
    resolver: zodResolver(businessCardSchema) as any,
    defaultValues: {
      businessCardOptOut: forms.businessCardInfo?.businessCardOptOut,
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.businessCardInfo) {
      const formData = forms.businessCardInfo;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof BusinessCardFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.businessCardInfo, setValue]);

  // Handle form submission
  const onSubmit = async (data: BusinessCardFormData) => {
    setIsLoading(true);
    try {
      // Update form data in context
      updateForm('businessCardInfo', {
        ...data,
        isFormComplete: true,
        firstSaveComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('businessCardInfo');
      
      toast.success("Business card information saved successfully!");
    } catch (error) {
      console.error("Error saving business card information:", error);
      toast.error("Failed to save business card information");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    handleSubmit,
  };
}
