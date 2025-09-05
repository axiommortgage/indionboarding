"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { policiesSchema, PoliciesFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

export function usePoliciesForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const { userAuth } = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PoliciesFormData>({
    resolver: zodResolver(policiesSchema) as any,
    defaultValues: {
      brokerName: forms.policiesAndProcedure?.brokerName || userAuth.userInfo?.firstName + " " + userAuth.userInfo?.lastName || "",
      signature: forms.policiesAndProcedure?.signature || "",
      signatureDate: forms.policiesAndProcedure?.signatureDate || "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.policiesAndProcedure) {
      const formData = forms.policiesAndProcedure;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof PoliciesFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.policiesAndProcedure, setValue]);

  // Check if signature exists and is saved
  const hasSignature = () => {
    const signature = watchedValues.signature;
    if (!signature) return false;
    
    // If it's a string, check if it's not empty
    if (typeof signature === 'string') {
      return signature.length > 0;
    }
    
    // If it's an object, check if it has a url
    if (typeof signature === 'object' && signature.url) {
      return true;
    }
    
    return false;
  };

  // Handle form submission
  const onSubmit = async (data: PoliciesFormData) => {
    setIsLoading(true);
    try {
      // Update form data in context
      updateForm('policiesAndProcedure', {
        ...data,
        signatureDate: new Date().toISOString(),
        isFormComplete: true,
        firstSaveComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('policiesAndProcedure');
      
      toast.success("Policies and procedures form saved successfully!");
    } catch (error) {
      console.error("Error saving policies form:", error);
      toast.error("Failed to save policies form");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    hasSignature: hasSignature(),
    handleSubmit: handleSubmit(onSubmit),
  };
}