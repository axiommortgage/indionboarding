"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { websiteInfoSchema, WebsiteInfoFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

export function useWebsiteInfoForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<WebsiteInfoFormData>({
    resolver: zodResolver(websiteInfoSchema) as any,
    defaultValues: {
      websiteOptIn: undefined,
      ownDomain: false,
      providedDomain: false,
      websiteDomainName: "",
      websiteDomainRegistrar: "",
      priorWebsite: undefined,
      priorWebsitesUse: [],
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Handle domain type selection (mutually exclusive)
  const handleDomainTypeChange = (type: 'own' | 'provided', checked: boolean) => {
    if (checked) {
      if (type === 'own') {
        setValue('ownDomain', true);
        setValue('providedDomain', false);
      } else {
        setValue('ownDomain', false);
        setValue('providedDomain', true);
      }
    } else {
      setValue(type === 'own' ? 'ownDomain' : 'providedDomain', false);
    }
  };

  // Add new prior website
  const addPriorWebsite = () => {
    const currentWebsites = watchedValues.priorWebsitesUse || [];
    setValue('priorWebsitesUse', [...currentWebsites, { domain: '', keepInUse: undefined, redirect: undefined }]);
  };

  // Remove prior website
  const removePriorWebsite = (index: number) => {
    const currentWebsites = watchedValues.priorWebsitesUse || [];
    setValue('priorWebsitesUse', currentWebsites.filter((_, i) => i !== index));
  };

  // Update prior website field
  const updatePriorWebsite = (index: number, field: string, value: any) => {
    const currentWebsites = watchedValues.priorWebsitesUse || [];
    const updatedWebsites = [...currentWebsites];
    updatedWebsites[index] = { ...updatedWebsites[index], [field]: value };
    setValue('priorWebsitesUse', updatedWebsites);
  };

  // Load existing form data
  React.useEffect(() => {
    if (forms.websiteInfo) {
      const formData = forms.websiteInfo;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof WebsiteInfoFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.websiteInfo, setValue]);

  // Handle form submission
  const onSubmit = async (data: WebsiteInfoFormData) => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (data.websiteOptIn === undefined) {
        toast.error("Please select whether you want an Indi Website");
        setIsLoading(false);
        return;
      }

      if (data.priorWebsite === undefined) {
        toast.error("Please select whether you have existing mortgage websites");
        setIsLoading(false);
        return;
      }

      // Update form data in context
      updateForm('websiteInfo', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('websiteInfo');

      toast.success("Website information saved successfully!");
    } catch (error) {
      console.error("Error saving website information:", error);
      toast.error("Failed to save website information");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    handleDomainTypeChange,
    addPriorWebsite,
    removePriorWebsite,
    updatePriorWebsite,
    handleSubmit: handleSubmit(onSubmit),
  };
}
