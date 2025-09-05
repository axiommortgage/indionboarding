import { OnboardingForms } from '@/shared/types/forms';

export interface FormNavigationConfig {
  slug: string;
  title: string;
  order: number;
  isRequired: boolean;
  isUnlicensedOnly?: boolean;
}

export const FORM_CONFIGS: FormNavigationConfig[] = [
  {
    slug: 'broker-information',
    title: 'Broker Information',
    order: 1,
    isRequired: true,
  },
  {
    slug: 'unlicensed-information',
    title: 'Unlicensed Information',
    order: 2,
    isRequired: true,
    isUnlicensedOnly: true,
  },
  {
    slug: 'photos',
    title: 'Photos',
    order: 3,
    isRequired: true,
  },
  {
    slug: 'business-card',
    title: 'Business Card',
    order: 4,
    isRequired: true,
  },
  {
    slug: 'website-information',
    title: 'Website Information',
    order: 5,
    isRequired: true,
  },
  {
    slug: 'mpc-application',
    title: 'MPC Application',
    order: 6,
    isRequired: true,
  },
  {
    slug: 'letter-of-direction',
    title: 'Letter of Direction',
    order: 7,
    isRequired: true,
  },
  {
    slug: 'payment-authorization',
    title: 'Payment Authorization',
    order: 8,
    isRequired: true,
  },
  {
    slug: 'contract-and-schedule',
    title: 'Contract and Schedule',
    order: 9,
    isRequired: true,
  },
  {
    slug: 'policies',
    title: 'Policies',
    order: 10,
    isRequired: true,
    isUnlicensedOnly: true,
  },
];

export function getFormConfig(slug: string): FormNavigationConfig | undefined {
  return FORM_CONFIGS.find(config => config.slug === slug);
}

export function getNextForm(currentSlug: string, isUnlicensed: boolean): string | null {
  const availableForms = FORM_CONFIGS.filter(config => 
    !config.isUnlicensedOnly || isUnlicensed
  ).sort((a, b) => a.order - b.order);

  const currentIndex = availableForms.findIndex(config => config.slug === currentSlug);
  
  if (currentIndex === -1 || currentIndex === availableForms.length - 1) {
    return null;
  }
  
  return availableForms[currentIndex + 1].slug;
}

export function getPreviousForm(currentSlug: string, isUnlicensed: boolean): string | null {
  const availableForms = FORM_CONFIGS.filter(config => 
    !config.isUnlicensedOnly || isUnlicensed
  ).sort((a, b) => a.order - b.order);

  const currentIndex = availableForms.findIndex(config => config.slug === currentSlug);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return availableForms[currentIndex - 1].slug;
}

export function getAvailableForms(isUnlicensed: boolean): FormNavigationConfig[] {
  return FORM_CONFIGS.filter(config => 
    !config.isUnlicensedOnly || isUnlicensed
  ).sort((a, b) => a.order - b.order);
}

export function calculateCompletionPercentage(forms: OnboardingForms, isUnlicensed: boolean): number {
  const availableForms = getAvailableForms(isUnlicensed);
  const totalForms = availableForms.length;
  
  if (totalForms === 0) return 0;
  
  let completedForms = 0;
  
  availableForms.forEach(config => {
    const formKey = getFormKey(config.slug);
    const formData = forms[formKey] as any;
    
    if (formData && formData.isFormComplete) {
      completedForms++;
    }
  });
  
  return Math.round((completedForms / totalForms) * 100);
}

function getFormKey(slug: string): keyof OnboardingForms {
  const keyMap: Record<string, keyof OnboardingForms> = {
    'broker-information': 'brokerInfo',
    'unlicensed-information': 'unlicensedInfo',
    'photos': 'photos',
    'business-card': 'businessCardInfo',
    'website-information': 'websiteInfo',
    'mpc-application': 'mpcApplication',
    'letter-of-direction': 'letterOfDirection',
    'payment-authorization': 'paymentAuthorization',
    'contract-and-schedule': 'contractAndSchedule',
    'policies': 'unlicensedPolicies',
  };

  return keyMap[slug] || 'brokerInfo';
}

// React hook for form navigation
export function useFormNavigation() {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      getCurrentFormIndex: () => 0,
      getTotalForms: () => 0,
      goToPreviousForm: () => {},
      goToNextForm: () => {},
      getCurrentForm: () => null,
      formMenuItems: [],
    };
  }

  // This will be imported dynamically on client side
  const { useRouter, usePathname } = require("next/navigation");
  const { useFormsContext } = require("@/shared/contexts/forms-context");

  const router = useRouter();
  const pathname = usePathname();
  const { menuOrder } = useFormsContext();

  // Use menuOrder as formMenuItems for backward compatibility
  const formMenuItems = menuOrder || [];

  // Get current form index based on pathname
  const getCurrentFormIndex = () => {
    if (!formMenuItems || !Array.isArray(formMenuItems)) {
      return 0;
    }
    const currentSlug = pathname?.split('/').pop();
    const index = formMenuItems.findIndex((item: any) => item.slug === currentSlug);
    return index >= 0 ? index : 0;
  };

  // Get total number of forms
  const getTotalForms = () => formMenuItems?.length || 0;

  // Navigate to previous form
  const goToPreviousForm = () => {
    if (!formMenuItems || !Array.isArray(formMenuItems)) return;
    const currentIndex = getCurrentFormIndex();
    if (currentIndex > 0) {
      const previousForm = formMenuItems[currentIndex - 1];
      router.push(`/webforms/${previousForm.slug}`);
    }
  };

  // Navigate to next form
  const goToNextForm = () => {
    if (!formMenuItems || !Array.isArray(formMenuItems)) return;
    const currentIndex = getCurrentFormIndex();
    if (currentIndex < formMenuItems.length - 1) {
      const nextForm = formMenuItems[currentIndex + 1];
      router.push(`/webforms/${nextForm.slug}`);
    }
  };

  // Get current form info
  const getCurrentForm = () => {
    if (!formMenuItems || !Array.isArray(formMenuItems)) return null;
    const currentIndex = getCurrentFormIndex();
    return currentIndex >= 0 && currentIndex < formMenuItems.length ? formMenuItems[currentIndex] : null;
  };

  return {
    getCurrentFormIndex,
    getTotalForms,
    goToPreviousForm,
    goToNextForm,
    getCurrentForm,
    formMenuItems,
  };
}
