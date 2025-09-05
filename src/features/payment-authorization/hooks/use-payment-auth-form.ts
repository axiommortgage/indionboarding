"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentAuthSchema, PaymentAuthFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

export function usePaymentAuthForm() {
  const { userAuth } = useAuthContext();
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [files, setFiles] = React.useState<{ articlesOfIncorporation?: File }>({});
  const [fileSizeMessage, setFileSizeMessage] = React.useState({ isVisible: false, message: '' });

  const form = useForm<PaymentAuthFormData>({
    resolver: zodResolver(paymentAuthSchema) as any,
    defaultValues: {
      payrollRequired: true,
      payrollRequiredNo: false,
      brokerName: "",
      birthdate: "",
      sin: "",
      chequingAccount: false,
      savingsAccount: false,
      accountType: "",
      nameOnAccount: "",
      bankName: "",
      bankAddress: "",
      transitNumber: "",
      institutionNumber: "",
      accountNumber: "",
      companyAccount: false,
      businessNumber: "",
      articlesOfIncorporation: null,
      creditCardExpenses: false,
      signature: null,
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
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

  // Handle account type selection (mutually exclusive)
  const handleAccountTypeChange = (type: 'chequing' | 'savings', checked: boolean) => {
    if (checked) {
      if (type === 'chequing') {
        setValue('chequingAccount', true);
        setValue('savingsAccount', false);
        setValue('accountType', 'Chequing');
      } else {
        setValue('chequingAccount', false);
        setValue('savingsAccount', true);
        setValue('accountType', 'Savings');
      }
    } else {
      setValue(type === 'chequing' ? 'chequingAccount' : 'savingsAccount', false);
      setValue('accountType', '');
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setFiles({ ...files, articlesOfIncorporation: file });
  };

  // Handle file drop
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      [...e.dataTransfer.items].forEach((item) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
          }
        }
      });
    }
  };

  // Handle payroll requirement change
  const handlePayrollRequiredChange = (required: boolean) => {
    setValue('payrollRequired', required);
    setValue('payrollRequiredNo', !required);
  };

  // Check if user is licensed
  const isLicensed = userAuth.userInfo?.license !== undefined && userAuth.userInfo?.license !== null;

  // Check if signature exists
  const hasSignature = watchedValues.signature && watchedValues.signature.url;

  // Check if form is complete based on payroll requirement
  const isFormComplete = watchedValues.payrollRequiredNo || 
    (watchedValues.payrollRequired && 
     watchedValues.brokerName && 
     watchedValues.bankName && 
     watchedValues.bankAddress && 
     watchedValues.transitNumber && 
     watchedValues.institutionNumber && 
     watchedValues.accountNumber && 
     watchedValues.nameOnAccount && 
     watchedValues.accountType &&
     (!watchedValues.companyAccount || (watchedValues.businessNumber && files.articlesOfIncorporation)) &&
     hasSignature);

  const onSubmit = async (data: PaymentAuthFormData) => {
    setIsLoading(true);
    try {
      // Validate file size if uploaded
      if (files.articlesOfIncorporation) {
        const fileSize = Math.round(files.articlesOfIncorporation.size / 1024);
        if (fileSize >= 15 * 1024) {
          toast.error("The file size must be 15MB or less.");
          setIsLoading(false);
          return;
        }
      }

      updateForm('paymentAuthorization', {
        ...data,
        articlesOfIncorporation: files.articlesOfIncorporation,
        isFormComplete: isFormComplete,
        firstSaveComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('paymentAuthorization');
      toast.success("Payment Authorization saved successfully!");
    } catch (error) {
      console.error("Error saving payment authorization:", error);
      toast.error("Failed to save payment authorization");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    files,
    fileSizeMessage,
    isLicensed,
    hasSignature,
    isFormComplete,
    handleAccountTypeChange,
    handleFileSelect,
    handleFileDrop,
    handlePayrollRequiredChange,
    handleSubmit: handleSubmit(onSubmit),
  };
}
