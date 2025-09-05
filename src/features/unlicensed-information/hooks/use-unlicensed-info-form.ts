"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unlicensedInfoSchema, UnlicensedInfoFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

export function useUnlicensedInfoForm() {
  const { userAuth } = useAuthContext();
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [charCount, setCharCount] = React.useState({ bio: 0, note: 0 });
  const [sameAddressWarning, setSameAddressWarning] = React.useState({ 
    showMessage: false, 
    sameAddress: null 
  });
  const [branches, setBranches] = React.useState([]);

  const form = useForm<UnlicensedInfoFormData>({
    resolver: zodResolver(unlicensedInfoSchema) as any,
    defaultValues: {
      firstname: forms.unlicensedInfo?.firstname || userAuth.userInfo?.firstName || "",
      middlename: forms.unlicensedInfo?.middlename || userAuth.userInfo?.middleName || "",
      lastname: forms.unlicensedInfo?.lastname || userAuth.userInfo?.lastName || "",
      workEmail: forms.unlicensedInfo?.workEmail || userAuth.userInfo?.email || "",
      cellPhone: forms.unlicensedInfo?.cellPhone || userAuth.userInfo?.phone || "",
      emergencyContact: forms.unlicensedInfo?.emergencyContact || "",
      emergencyPhone: forms.unlicensedInfo?.emergencyPhone || "",
      assistantTo: forms.unlicensedInfo?.assistantTo || "",
      completingCompliance: forms.unlicensedInfo?.completingCompliance || false,
      address: forms.unlicensedInfo?.address || "",
      suiteUnit: forms.unlicensedInfo?.suiteUnit || "",
      city: forms.unlicensedInfo?.city || "",
      province: forms.unlicensedInfo?.province || "",
      postalCode: forms.unlicensedInfo?.postalCode || "",
      personalAddress: forms.unlicensedInfo?.personalAddress || "",
      personalSuiteUnit: forms.unlicensedInfo?.personalSuiteUnit || "",
      personalCity: forms.unlicensedInfo?.personalCity || "",
      personalProvince: forms.unlicensedInfo?.personalProvince || "",
      personalPostalCode: forms.unlicensedInfo?.personalPostalCode || "",
      signature: forms.unlicensedInfo?.signature || "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.unlicensedInfo) {
      const formData = forms.unlicensedInfo;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof UnlicensedInfoFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.unlicensedInfo, setValue]);

  // Load branches data
  React.useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches');
        if (response.ok) {
          const data = await response.json();
          setBranches(data);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  // Handle form submission
  const onSubmit = async (data: UnlicensedInfoFormData) => {
    setIsLoading(true);
    try {
      // Update form data in context
      updateForm('unlicensedInfo', {
        ...data,
        isFormComplete: true,
        firstSaveComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('unlicensedInfo');
      
      toast.success("Unlicensed information saved successfully!");
    } catch (error) {
      console.error("Error saving unlicensed information:", error);
      toast.error("Failed to save unlicensed information");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle character counts
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharCount(prev => ({ ...prev, bio: value.length }));
    setValue('bio', value);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharCount(prev => ({ ...prev, note: value.length }));
    setValue('note', value);
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

  // Handle address selection from branches
  const handleBranchSelect = (selectedAddress: any) => {
    setValue('address', selectedAddress.address || '');
    setValue('city', selectedAddress.city || '');
    setValue('province', selectedAddress.province || '');
    setValue('postalCode', selectedAddress.postalCode || '');
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
    charCount,
    sameAddressWarning,
    branches,
    hasSignature,
    handleBioChange,
    handleNoteChange,
    handleSameAddressChange,
    handleBranchSelect,
    handleSubmit,
  };
}
