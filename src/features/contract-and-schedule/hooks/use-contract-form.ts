"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractSchema, ContractFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

export function useContractForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      brokerSignature: forms.contractAndSchedule?.brokerSignature || "",
      brokerInitials: forms.contractAndSchedule?.brokerInitials || "",
      contractFileUrl: forms.contractAndSchedule?.contractFile?.url || "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.contractAndSchedule) {
      const formData = forms.contractAndSchedule;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof ContractFormData, formData[key as keyof typeof formData] as any);
        }
      });
      
      // Handle contract file URL separately
      if (formData.contractFile?.url) {
        setValue('contractFileUrl', formData.contractFile.url);
      }
    }
  }, [forms.contractAndSchedule, setValue]);

  const onSubmit = async (data: ContractFormData) => {
    setIsLoading(true);
    try {
      updateForm('contractAndSchedule', {
        ...data,
        signatureDate: new Date().toISOString(),
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('contractAndSchedule');
      toast.success("Contract and Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error("Failed to save contract");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    handleSubmit: handleSubmit(onSubmit),
  };
}
