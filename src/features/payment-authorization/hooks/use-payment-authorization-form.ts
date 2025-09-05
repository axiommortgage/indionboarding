import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";
import { paymentAuthSchema, PaymentAuthFormData } from "../lib/validation";

export function usePaymentAuthForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PaymentAuthFormData>({
    resolver: zodResolver(paymentAuthSchema) as any,
    defaultValues: {},
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.paymentAuthorization) {
      const formData = forms.paymentAuthorization;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof PaymentAuthFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.paymentAuthorization, setValue]);

  const onSubmit = async (data: PaymentAuthFormData) => {
    setIsLoading(true);
    try {
      updateForm('paymentAuthorization', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('paymentAuthorization');
      toast.success("payment authorization saved successfully!");
    } catch (error) {
      console.error("Error saving payment-authorization:", error);
      toast.error("Failed to save payment-authorization");
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