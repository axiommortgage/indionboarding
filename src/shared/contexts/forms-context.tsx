"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./auth-context";
import { api } from "@/shared/lib/api";
import { toast } from "@/shared/lib/toast";
import { getAvailableForms, calculateCompletionPercentage } from '@/shared/lib/form-navigation';
import { validateForm as validateFormData, isFormComplete as checkFormComplete } from '@/shared/lib/form-validation';
import type {
  OnboardingForms,
  FormMenuItem,
  FormsContextType,
  FormValidationState,
} from "@/shared/types/forms";

const FormsContext = createContext<FormsContextType | undefined>(undefined);

interface FormsProviderProps {
  children: React.ReactNode;
}

export function FormsProvider({ children }: FormsProviderProps) {
  const { userAuth, setUserAuth } = useAuthContext();
  const router = useRouter();
  
  const [forms, setForms] = useState<OnboardingForms>({});
  const [menuOrder, setMenuOrder] = useState<FormMenuItem[]>([]);
  const [lastFormVisited, setLastFormVisited] = useState<string | null>(null);
  const [beforeLeave, setBeforeLeave] = useState({
    showAlert: false,
    action: null as string | null,
    route: null as string | null,
  });

  // Form configuration - matches legacy Menu.js
  const getFormConfig = useCallback(() => {
    const user = userAuth.userInfo;
    const isUnlicensed = (user?.license as any) === false || user?.license === 'false' || !user?.license;

    const formConfigs = [
      {
        key: 'brokerInfo',
        slug: isUnlicensed ? 'unlicensed-information' : 'broker-information',
        title: isUnlicensed ? 'Information' : 'Broker Information',
        order: '1'
      },
      {
        key: 'photos',
        slug: 'photos',
        title: 'Photos',
        order: '2'
      },
      {
        key: 'businessCardInfo',
        slug: 'business-card',
        title: 'Business Card',
        order: '3'
      },
      {
        key: 'websiteInfo',
        slug: 'website-information',
        title: 'Website Information',
        order: '4'
      },
      {
        key: 'mpcApplication',
        slug: 'mpc-application',
        title: 'MPC Application',
        order: '5'
      },
      {
        key: 'letterOfDirection',
        slug: 'letter-of-direction',
        title: 'Letter Of Direction',
        order: '6'
      },
      {
        key: 'paymentAuthorization',
        slug: 'payment-authorization',
        title: 'Payroll Information',
        order: '7'
      },
      {
        key: 'contractAndSchedule',
        slug: 'contract-and-schedule',
        title: 'Contract And Schedule',
        order: '8'
      },
      {
        key: 'policiesAndProcedure',
        slug: 'policies',
        title: 'Policies And Procedure',
        order: '9'
      },
      {
        key: 'unlicensedPolicies',
        slug: 'unlicensed-policies',
        title: 'Unlicensed Policies',
        order: '10'
      }
    ];

    return formConfigs.filter(config => {
      // Filter forms based on user type and form availability
      if (isUnlicensed && config.key === 'brokerInfo') {
        return forms.unlicensedInfo !== null;
      }
      if (!isUnlicensed && config.key === 'unlicensedInfo') {
        return false;
      }
      return forms[config.key as keyof OnboardingForms] !== null;
    });
  }, [userAuth.userInfo, forms]);

  // Update form data
  const updateForm = useCallback((formName: keyof OnboardingForms, formData: any) => {
    setForms(prev => ({
      ...prev,
      [formName]: {
        ...(prev[formName] as any || {}),
        ...formData,
        lastUpdated: new Date().toISOString(),
      },
      isFormSaved: false,
    }));
  }, []);

  // Save form to backend
  const saveForm = useCallback(async (formName: keyof OnboardingForms) => {
    try {
      const userId = userAuth.userInfo?.id;
      if (!userId) {
        throw new Error('No user ID found');
      }

      const formData = forms[formName];
      const response = await api.put(`/onboarding-status/${userId}`, {
        [formName]: formData,
        lastFormVisited: formName,
      });

      setForms(prev => ({
        ...prev,
        isFormSaved: true,
      }));

      toast.success('Form saved successfully');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
      throw error;
    }
  }, [forms, userAuth.userInfo]);

  // Validate form
  const validateForm = useCallback((formName: keyof OnboardingForms): FormValidationState => {
    const formData = forms[formName];
    if (!formData) {
      return { isValid: false, fields: [] };
    }

    // Basic validation - can be extended
    const fields = Object.entries(formData).map(([field, value]) => ({
      field,
      isValid: value !== null && value !== undefined && value !== '',
      message: !value ? `${field} is required` : undefined,
    }));

    return {
      isValid: fields.every(f => f.isValid),
      fields,
    };
  }, [forms]);

  // Check if form is complete
  const isFormComplete = useCallback((formName: keyof OnboardingForms): boolean => {
    const formData = forms[formName] as any;

    // First check if manually marked as complete
    if (formData?.isFormComplete === true) {
      return true;
    }

    // Otherwise use validation to check completeness
    return checkFormComplete(formName, formData);
  }, [forms]);

  // Calculate completion percentage
  const getFormCompletionPercentage = useCallback((): number => {
    const availableForms = getFormConfig();
    if (availableForms.length === 0) return 0;

    const completedForms = availableForms.filter(config => 
      isFormComplete(config.key as keyof OnboardingForms)
    );

    return Math.round((completedForms.length / availableForms.length) * 100);
  }, [getFormConfig, isFormComplete]);

  // Submit all forms
  const submitAllForms = useCallback(async () => {
    try {
      const userId = userAuth.userInfo?.id;
      if (!userId) {
        throw new Error('No user ID found');
      }

      const response = await api.put(`/onboarding-status/${userId}`, {
        isSubmited: true,
        isLocked: true,
        submissionDate: new Date().toISOString(),
        completionPercent: "100",
      });

      setForms(prev => ({
        ...prev,
        isSubmited: true,
        submissionDate: new Date().toISOString(),
      }));

      toast.success('Onboarding package submitted successfully!');
    } catch (error) {
      console.error('Error submitting forms:', error);
      toast.error('Failed to submit onboarding package');
      throw error;
    }
  }, [userAuth.userInfo]);

  // Update menu order when forms or user changes
  useEffect(() => {
    const configs = getFormConfig();
    const menuItems = configs.map(config => ({
      key: config.key,
      order: config.order,
      title: config.title,
      slug: config.slug,
    }));
    setMenuOrder(menuItems);
  }, [getFormConfig]);

  // Load forms data on mount
  useEffect(() => {
    const loadFormsData = async () => {
      if (userAuth.userInfo?.id) {
        try {
          // Load onboarding status data
          const response = await api.get(`/onboarding-status/${userAuth.userInfo.id}?populate=*`);

          if (response.success && response.data) {
            const onboardingData = response.data as any;

            // Extract forms data from the API response
            const formsData: OnboardingForms = {
              brokerInfo: onboardingData.brokerInfo || {},
              unlicensedInfo: onboardingData.unlicensedInfo || {},
              businessCardInfo: onboardingData.businessCardInfo || {},
              contractAndSchedule: onboardingData.contractAndSchedule || {},
              letterOfDirection: onboardingData.letterOfDirection || {},
              mpcApplication: onboardingData.mpcApplication || {},
              paymentAuthorization: onboardingData.paymentAuthorization || {},
              photos: onboardingData.photos || {},
              policiesAndProcedure: onboardingData.policiesAndProcedure || {},
              unlicensedPolicies: onboardingData.unlicensedPolicies || {},
              websiteInfo: onboardingData.websiteInfo || {},
              isSubmited: onboardingData.isSubmited || false,
              isFormSaved: true,
              completionPercent: onboardingData.completionPercent || "0",
              submissionDate: onboardingData.submissionDate,
            };

            setForms(formsData);

            // Set last form visited if available
            if (onboardingData.lastFormVisited) {
              setLastFormVisited(onboardingData.lastFormVisited);
            }
          }
        } catch (error) {
          console.error('Error loading forms data:', error);
          // Initialize with empty forms if loading fails
          setForms({});
        }
      }
    };

    loadFormsData();
  }, [userAuth.userInfo?.id]);

  const contextValue: FormsContextType = {
    forms,
    updateForm,
    saveForm,
    validateForm,
    getFormCompletionPercentage,
    isFormComplete,
    submitAllForms,
    menuOrder,
    lastFormVisited,
    setLastFormVisited,
    beforeLeave,
    setBeforeLeave,
  };

  return (
    <FormsContext.Provider value={contextValue}>
      {children}
    </FormsContext.Provider>
  );
}

export function useFormsContext() {
  const context = useContext(FormsContext);
  if (context === undefined) {
    throw new Error('useFormsContext must be used within a FormsProvider');
  }
  return context;
}

// Export alias for convenience
export const useForms = useFormsContext;
