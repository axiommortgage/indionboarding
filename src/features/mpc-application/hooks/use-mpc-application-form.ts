"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mpcApplicationSchema, MpcApplicationFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

export function useMpcApplicationForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [branches, setBranches] = React.useState([]);
  const [showDeclarationDetails, setShowDeclarationDetails] = React.useState(false);
  const [showJudgementUpload, setShowJudgementUpload] = React.useState(false);

  const form = useForm<MpcApplicationFormData>({
    resolver: zodResolver(mpcApplicationSchema) as any,
    defaultValues: {
      firstname: forms.mpcApplication?.firstname || "",
      middlename: forms.mpcApplication?.middlename || "",
      lastname: forms.mpcApplication?.lastname || "",
      preferredName: forms.mpcApplication?.preferredName || "",
      website: forms.mpcApplication?.website || "",
      workEmail: forms.mpcApplication?.workEmail || "",
      alternateEmail: forms.mpcApplication?.alternateEmail || "",
      position: forms.mpcApplication?.position || "",
      address: forms.mpcApplication?.address || "",
      suiteUnit: forms.mpcApplication?.suiteUnit || "",
      city: forms.mpcApplication?.city || "",
      province: forms.mpcApplication?.province || "",
      postalCode: forms.mpcApplication?.postalCode || "",
      workPhone: forms.mpcApplication?.workPhone || "",
      cellPhone: forms.mpcApplication?.cellPhone || "",
      tollfree: forms.mpcApplication?.tollfree || "",
      fax: forms.mpcApplication?.fax || "",
      officeAddress: forms.mpcApplication?.officeAddress || "",
      officeSuiteUnit: forms.mpcApplication?.officeSuiteUnit || "",
      officeCity: forms.mpcApplication?.officeCity || "",
      officeProvince: forms.mpcApplication?.officeProvince || "",
      officePostalCode: forms.mpcApplication?.officePostalCode || "",
      officeWebsite: forms.mpcApplication?.officeWebsite || "",
      declarationCriminalOffense: forms.mpcApplication?.declarationCriminalOffense,
      declarationFraud: forms.mpcApplication?.declarationFraud,
      declarationSuspended: forms.mpcApplication?.declarationSuspended,
      declarationLicenseDenied: forms.mpcApplication?.declarationLicenseDenied,
      declarationBankruptcy: forms.mpcApplication?.declarationBankruptcy,
      declarationDetails: forms.mpcApplication?.declarationDetails || "",
      judgementAction: forms.mpcApplication?.judgementAction || "",
      applicantDeclarationSignature: forms.mpcApplication?.applicantDeclarationSignature || "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.mpcApplication) {
      const formData = forms.mpcApplication;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof MpcApplicationFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.mpcApplication, setValue]);

  // Fetch branches on component mount
  React.useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches?populate=*');
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  // Check if any declaration is Yes to show details textarea
  React.useEffect(() => {
    const hasYesDeclaration =
      watchedValues.declarationCriminalOffense === true ||
      watchedValues.declarationFraud === true ||
      watchedValues.declarationSuspended === true ||
      watchedValues.declarationLicenseDenied === true ||
      watchedValues.declarationBankruptcy === true;

    setShowDeclarationDetails(hasYesDeclaration);

    // Show judgement upload if fraud declaration is Yes
    setShowJudgementUpload(watchedValues.declarationFraud === true);
  }, [watchedValues.declarationCriminalOffense, watchedValues.declarationFraud, watchedValues.declarationSuspended, watchedValues.declarationLicenseDenied, watchedValues.declarationBankruptcy]);

  // Handle branch selection
  const handleBranchSelect = (addressInfo: any) => {
    if (addressInfo) {
      setValue('officeAddress', addressInfo.address || '');
      setValue('officeCity', addressInfo.city || '');
      setValue('officeProvince', addressInfo.province || '');
      setValue('officePostalCode', addressInfo.postalCode || '');
    }
  };

  const onSubmit = async (data: MpcApplicationFormData) => {
    setIsLoading(true);
    try {
      updateForm('mpcApplication', {
        ...data,
        signatureDate: new Date().toISOString(),
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('mpcApplication');
      toast.success("MPC Application saved successfully!");
    } catch (error) {
      console.error("Error saving MPC application:", error);
      toast.error("Failed to save MPC application");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    watchedValues,
    errors,
    isLoading,
    branches,
    showDeclarationDetails,
    showJudgementUpload,
    handleBranchSelect,
    handleSubmit: handleSubmit(onSubmit),
  };
}