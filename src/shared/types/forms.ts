// Form types for the digital onboarding system

export interface FormMenuItem {
  key: string;
  order: string;
  title: string;
  slug: string;
}

export interface OnboardingForms {
  id?: string;
  completionPercent?: number;
  isFormSaved?: boolean;
  isSubmited?: boolean;
  isLocked?: boolean;
  submissionDate?: string;
  brokerInfo?: BrokerInfoForm;
  unlicensedInfo?: UnlicensedInfoForm;
  photos?: PhotosForm;
  businessCardInfo?: BusinessCardForm;
  websiteInfo?: WebsiteInfoForm;
  mpcApplication?: MpcApplicationForm;
  letterOfDirection?: LetterOfDirectionForm;
  paymentAuthorization?: PaymentAuthorizationForm;
  contractAndSchedule?: ContractForm;
  policiesAndProcedure?: PoliciesForm;
  unlicensedPolicies?: UnlicensedPoliciesForm;
}

export interface BaseForm {
  isFormComplete?: boolean;
  lastUpdated?: string;
}

export interface BrokerInfoForm extends BaseForm {
  // Personal Information
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  sin?: string;
  
  // Address Information
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  
  // Personal Address (if different)
  personalAddress?: string;
  personalCity?: string;
  personalProvince?: string;
  personalPostalCode?: string;
  sameAddress?: boolean;
  
  // Professional Information
  licensed?: boolean;
  provinceLicenseNumber?: string;
  licenseExpiry?: string;
  yearsExperience?: string;
  previousEmployer?: string;
  
  // Social Media
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  
  // Bio and Notes
  bio?: string;
  note?: string;
  
  // Signature
  signature?: string;
  signatureDate?: string;
  
  // Declarations
  declarationRegulatoryReview?: boolean;
  declarationClientComplaints?: boolean;
}

export interface UnlicensedInfoForm extends BaseForm {
  // Similar structure to BrokerInfoForm but for unlicensed brokers
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  sin?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  personalAddress?: string;
  personalCity?: string;
  personalProvince?: string;
  personalPostalCode?: string;
  sameAddress?: boolean;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  bio?: string;
  note?: string;
  signature?: string;
  signatureDate?: string;
}

export interface PhotosForm extends BaseForm {
  photo?: string; // Digital photo
  printPhoto?: string; // Print photo
  useDefaultPhoto?: boolean;
}

export interface BusinessCardForm extends BaseForm {
  businessCardOptOut?: boolean;
}

export interface WebsiteInfoForm extends BaseForm {
  websiteOptIn?: boolean;
  ownDomain?: boolean;
  providedDomain?: boolean;
  websiteDomainName?: string;
  websiteDomainRegistrar?: string;
  priorWebsite?: boolean;
  priorWebsitesUse?: Array<{
    domain: string;
    keepInUse?: boolean;
    redirect?: boolean;
  }>;
}

export interface MpcApplicationForm extends BaseForm {
  // Individual Information
  firstname?: string;
  middlename?: string;
  lastname?: string;
  preferredName?: string;
  website?: string;
  workEmail?: string;
  alternateEmail?: string;
  position?: string;

  // Mailing Address
  address?: string;
  suiteUnit?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  workPhone?: string;
  cellPhone?: string;
  tollfree?: string;
  fax?: string;

  // Office Location
  officeAddress?: string;
  officeSuiteUnit?: string;
  officeCity?: string;
  officeProvince?: string;
  officePostalCode?: string;
  officeWebsite?: string;

  // Declarations
  declarationCriminalOffense?: boolean;
  declarationFraud?: boolean;
  declarationSuspended?: boolean;
  declarationLicenseDenied?: boolean;
  declarationBankruptcy?: boolean;
  declarationDetails?: string;
  judgementAction?: string;

  // Signature
  applicantDeclarationSignature?: string;
}

export interface LetterOfDirectionForm extends BaseForm {
  selectedLetter?: 'expert' | 'standard' | 'custom';
  customInstructions?: string;
  effectiveDate?: string;
  signature?: string;
  signatureDate?: string;
}

export interface PaymentAuthorizationForm extends BaseForm {
  bankName?: string;
  transitNumber?: string;
  institutionNumber?: string;
  accountNumber?: string;
  accountType?: 'checking' | 'savings';
  payrollFrequency?: 'weekly' | 'biweekly' | 'monthly';
  deductions?: Array<{
    type: string;
    amount: number;
    percentage?: number;
  }>;
  signature?: string;
  signatureDate?: string;
}

export interface ContractForm extends BaseForm {
  brokerSignature?: string;
  brokerInitials?: string;
  brokerSignatureDate?: string;
  brokerName?: string;
}

export interface PoliciesForm extends BaseForm {
  acknowledged?: boolean;
  acknowledgedDate?: string;
  signature?: string;
  signatureDate?: string;
}

export interface UnlicensedPoliciesForm extends BaseForm {
  acknowledged?: boolean;
  acknowledgedDate?: string;
  signature?: string;
  signatureDate?: string;
}

// Form validation types
export interface FieldValidation {
  field: string;
  isValid: boolean;
  message?: string;
}

export interface FormValidationState {
  isValid: boolean;
  fields: FieldValidation[];
}

// Form context types
export interface FormsContextType {
  forms: OnboardingForms;
  updateForm: (formName: keyof OnboardingForms, formData: any) => void;
  saveForm: (formName: keyof OnboardingForms) => Promise<void>;
  validateForm: (formName: keyof OnboardingForms) => FormValidationState;
  getFormCompletionPercentage: () => number;
  isFormComplete: (formName: keyof OnboardingForms) => boolean;
  submitAllForms: () => Promise<void>;
  menuOrder: FormMenuItem[];
  lastFormVisited: string | null;
  setLastFormVisited: (formSlug: string) => void;
  beforeLeave: {
    showAlert: boolean;
    action: string | null;
    route: string | null;
  };
  setBeforeLeave: (state: { showAlert: boolean; action: string | null; route: string | null }) => void;
}
