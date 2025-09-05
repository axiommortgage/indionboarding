"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unlicensedPoliciesSchema, UnlicensedPoliciesFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

export function useUnlicensedPoliciesForm() {
  const { userAuth } = useAuthContext();
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [complianceManualUrl, setComplianceManualUrl] = React.useState("");

  const form = useForm<UnlicensedPoliciesFormData>({
    resolver: zodResolver(unlicensedPoliciesSchema) as any,
    defaultValues: {
      brokerName: forms.unlicensedPolicies?.brokerName || userAuth.userInfo?.firstName + " " + userAuth.userInfo?.lastName || "",
      signature: forms.unlicensedPolicies?.signature || "",
      signatureDate: forms.unlicensedPolicies?.signatureDate || "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.unlicensedPolicies) {
      const formData = forms.unlicensedPolicies;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof UnlicensedPoliciesFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.unlicensedPolicies, setValue]);

  // Load compliance manual URL
  React.useEffect(() => {
    const fetchComplianceManual = async () => {
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          const unlicensedPolicy = data.find((doc: any) => doc.unlicensedPolicyProcedure === true);
          if (unlicensedPolicy?.file?.url) {
            setComplianceManualUrl(unlicensedPolicy.file.url);
          }
        }
      } catch (error) {
        console.error('Error fetching compliance manual:', error);
      }
    };
    fetchComplianceManual();
  }, []);

  // Handle form submission
  const onSubmit = async (data: UnlicensedPoliciesFormData) => {
    setIsLoading(true);
    try {
      // Update form data in context
      updateForm('unlicensedPolicies', {
        ...data,
        isFormComplete: true,
        firstSaveComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('unlicensedPolicies');
      
      toast.success("Unlicensed policies saved successfully!");
    } catch (error) {
      console.error("Error saving unlicensed policies:", error);
      toast.error("Failed to save unlicensed policies");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if signature exists
  const hasSignature = () => {
    const signature = watchedValues.signature;
    if (!signature) return false;
    if (typeof signature === 'string') {
      return signature.length > 0;
    }
    if (typeof signature === 'object' && signature.url) {
      return true;
    }
    return false;
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    complianceManualUrl,
    hasSignature,
    handleSubmit,
  };
}
