"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brokerInfoSchema, BrokerInfoFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

export function useBrokerInfoForm() {
  const { userAuth } = useAuthContext();
  const { forms, updateForm, saveForm, isFormComplete } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [charCount, setCharCount] = React.useState({ bio: 0 });
  const [sameAddressWarning, setSameAddressWarning] = React.useState({
    showMessage: false,
    sameAddress: null as boolean | null,
  });
  const [branches, setBranches] = React.useState<any[]>([]);

  const form = useForm<BrokerInfoFormData>({
    resolver: zodResolver(brokerInfoSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      legalName: "",
      preferredName: "",
      titles: "",
      position: "",
      license: "",
      birthdate: "",
      sin: "",
      tshirtSize: "M",
      bio: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      personalAddress: "",
      personalCity: "",
      personalProvince: "",
      personalPostalCode: "",
      sameAddress: false,
      workPhone: "",
      emergencyContact: "",
      emergencyPhone: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      declarationRegulatoryReview: undefined,
      declarationClientComplaints: undefined,
      declarationRegulatoryReviewDetails: "",
      declarationClientComplaintsDetails: "",
      signature: "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.brokerInfo) {
      const formData = forms.brokerInfo;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof BrokerInfoFormData, formData[key as keyof typeof formData]);
        }
      });
      
      if (formData.bio) {
        setCharCount({ bio: formData.bio.length });
      }
    }
  }, [forms.brokerInfo, setValue]);

  // Fetch branches data
  React.useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches?populate=*');
        if (response.ok) {
          const data = await response.json();
          setBranches(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  // Handle form submission
  const onSubmit = async (data: BrokerInfoFormData) => {
    setIsLoading(true);
    try {
      // Update form data in context
      updateForm('brokerInfo', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('brokerInfo');
      
      toast.success("Broker information saved successfully!");
    } catch (error) {
      console.error("Error saving broker information:", error);
      toast.error("Failed to save broker information");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bio character count
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharCount({ bio: value.length });
    setValue('bio', value);
  };

  // Handle same address toggle
  const handleSameAddressChange = (checked: boolean) => {
    setValue('sameAddress', checked);
    if (checked) {
      setValue('personalAddress', watchedValues.address);
      setValue('personalCity', watchedValues.city);
      setValue('personalProvince', watchedValues.province);
      setValue('personalPostalCode', watchedValues.postalCode);
    }
  };

  // Handle branch selection
  const handleBranchSelect = (addressInfo: any) => {
    setValue('address', addressInfo.address);
    setValue('city', addressInfo.city);
    setValue('province', addressInfo.province);
    setValue('postalCode', addressInfo.postalCode);
  };

  // Check if user is licensed (affects which fields to show)
  const isLicensed = userAuth.userInfo?.license !== undefined && userAuth.userInfo?.license !== null;

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    charCount,
    sameAddressWarning,
    branches,
    isLicensed,
    handleBioChange,
    handleSameAddressChange,
    handleBranchSelect,
    handleSubmit: handleSubmit(onSubmit),
  };
}
