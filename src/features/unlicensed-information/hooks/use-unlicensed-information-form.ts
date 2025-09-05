import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";
import { unlicensedInfoSchema, UnlicensedInfoFormData } from "../lib/validation";

export function useUnlicensedInfoForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<UnlicensedInfoFormData>({
    resolver: zodResolver(unlicensedInfoSchema) as any,
    defaultValues: {},
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

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

  const onSubmit = async (data: UnlicensedInfoFormData) => {
    setIsLoading(true);
    try {
      updateForm('unlicensedInfo', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('unlicensedInfo');
      toast.success("unlicensed information saved successfully!");
    } catch (error) {
      console.error("Error saving unlicensed-information:", error);
      toast.error("Failed to save unlicensed-information");
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