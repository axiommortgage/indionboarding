import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";
import { websiteInfoSchema, WebsiteInfoFormData } from "../lib/validation";

export function useWebsiteInfoForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<WebsiteInfoFormData>({
    resolver: zodResolver(websiteInfoSchema) as any,
    defaultValues: {},
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

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

  const onSubmit = async (data: WebsiteInfoFormData) => {
    setIsLoading(true);
    try {
      updateForm('websiteInfo', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('websiteInfo');
      toast.success("website information saved successfully!");
    } catch (error) {
      console.error("Error saving website-information:", error);
      toast.error("Failed to save website-information");
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