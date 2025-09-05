"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { letterOfDirectionSchema, LetterOfDirectionFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

export function useLetterOfDirectionForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const { userAuth } = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [iframeWidth, setIframeWidth] = React.useState(1000);
  const [localMortgageSoftware, setLocalMortgageSoftware] = React.useState(
    forms.brokerInfo?.mortgageSoftware || ''
  );
  const [otherMtgSoftware, setOtherMtgSoftware] = React.useState(
    forms.brokerInfo?.mortgageSoftware === 'Other' || false
  );
  const [localOtherMortgageSoftware, setLocalOtherMortgageSoftware] = React.useState(
    forms.brokerInfo?.otherMortgageSoftware || ''
  );

  const user = userAuth.userInfo;

  const form = useForm<LetterOfDirectionFormData>({
    resolver: zodResolver(letterOfDirectionSchema) as any,
    defaultValues: {
      mortgageSoftware: forms.letterOfDirection?.mortgageSoftware || forms.brokerInfo?.mortgageSoftware || "",
      otherMortgageSoftware: forms.letterOfDirection?.otherMortgageSoftware || forms.brokerInfo?.otherMortgageSoftware || "",
      selectedLetter: forms.letterOfDirection?.selectedLetter || "",
      acknowledgement: forms.letterOfDirection?.acknowledgement ?? false,
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.letterOfDirection) {
      const formData = forms.letterOfDirection;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof LetterOfDirectionFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.letterOfDirection, setValue]);

  // Handle mortgage software selection changes
  const handleMortgageSoftwareChange = (value: string) => {
    setLocalMortgageSoftware(value);
    setValue('mortgageSoftware', value);

    if (value === 'Other') {
      setOtherMtgSoftware(true);
    } else {
      setOtherMtgSoftware(false);
      setLocalOtherMortgageSoftware('');
      setValue('otherMortgageSoftware', '');
    }
  };

  // Handle other mortgage software input changes
  const handleOtherMortgageSoftwareChange = (value: string) => {
    setLocalOtherMortgageSoftware(value);
    setValue('otherMortgageSoftware', value);
  };

  // Mapping function to convert mortgageSoftware values to letterOfDirection property values
  const getMortgageSoftwareMapping = (mortgageSoftware: string) => {
    if (!mortgageSoftware || mortgageSoftware === 'Select') return 'expert';

    // Handle special cases
    if (mortgageSoftware === 'None') return null; // No PDF needed

    // Normalize the selected mortgage software to lowercase
    const normalizedSoftware = mortgageSoftware.toLowerCase();

    // Special exception: ExpertPro should use Expert letter of direction
    if (normalizedSoftware === 'expertpro') {
      return 'expert';
    }

    // For now, return the normalized software name
    // In a real implementation, you'd check against available documents
    return normalizedSoftware;
  };

  // Get PDF link based on mortgage software selection
  const getPdfLink = (software?: string) => {
    const mortgageSoftware = software || localMortgageSoftware || forms.brokerInfo?.mortgageSoftware;

    // Treat 'Select' as no selection, and return empty for 'None'
    if (!mortgageSoftware || mortgageSoftware === 'Select' || mortgageSoftware === 'None') {
      if (mortgageSoftware === 'None') {
        return '';
      }
      if (mortgageSoftware === 'Select') {
        return '';
      }
      // Default to expert if no value
      return '/documents/letter-of-direction-expert.pdf';
    }

    // For "Other" mortgage software, return empty
    if (mortgageSoftware === 'Other') {
      return '';
    }

    // Get the corresponding letterOfDirection value
    const letterOfDirectionValue = getMortgageSoftwareMapping(mortgageSoftware);

    // Return the PDF path based on the software
    return `/documents/letter-of-direction-${letterOfDirectionValue}.pdf`;
  };

  // Check if form is complete
  const isFormComplete = () => {
    return watchedValues.acknowledgement === true;
  };

  const onSubmit = async (data: LetterOfDirectionFormData) => {
    setIsLoading(true);
    try {
      // Determine the selected letter type based on mortgage software selection
      const selectedLetter = getMortgageSoftwareMapping(localMortgageSoftware || forms.brokerInfo?.mortgageSoftware || '');

      const formData = {
        ...data,
        selectedLetter: selectedLetter,
        isFormComplete: isFormComplete(),
        firstSaveComplete: true,
        lastUpdated: new Date().toISOString(),
      };

      updateForm('letterOfDirection', formData);
      await saveForm('letterOfDirection');
      toast.success("Letter of Direction saved successfully!");
    } catch (error) {
      console.error("Error saving letter of direction:", error);
      toast.error("Failed to save letter of direction");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate iframe width based on screen size
  const calculateIframeWidth = () => {
    if (typeof window === 'undefined') {
      return 680;
    } else {
      const w = window.innerWidth;

      if (w > 0 && w < 540) {
        return 240;
      } else if (w >= 540 && w < 768) {
        return 420;
      } else if (w >= 768 && w < 992) {
        return 540;
      } else if (w >= 992 && w < 1280) {
        return 600;
      } else {
        return 860;
      }
    }
  };

  React.useEffect(() => {
    setIframeWidth(calculateIframeWidth());
  }, []);

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    iframeWidth,
    localMortgageSoftware,
    otherMtgSoftware,
    localOtherMortgageSoftware,
    handleMortgageSoftwareChange,
    handleOtherMortgageSoftwareChange,
    getPdfLink,
    isFormComplete: isFormComplete(),
    handleSubmit: handleSubmit(onSubmit),
  };
}