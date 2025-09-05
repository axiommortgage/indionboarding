import { z } from 'zod';
import {
  BrokerInfoForm,
  UnlicensedInfoForm,
  PhotosForm,
  BusinessCardForm,
  WebsiteInfoForm,
  MpcApplicationForm,
  LetterOfDirectionForm,
  PaymentAuthorizationForm,
  ContractForm,
  PoliciesForm,
  UnlicensedPoliciesForm,
} from '@/shared/types/forms';

// Validation schemas for each form
export const brokerInfoSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  middlename: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  sin: z.string().min(9, 'Valid SIN is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  signature: z.string().min(1, 'Signature is required'),
  isFormComplete: z.boolean().optional(),
});

export const unlicensedInfoSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  isFormComplete: z.boolean().optional(),
});

export const photosSchema = z.object({
  headshot: z.string().min(1, 'Headshot is required'),
  isFormComplete: z.boolean().optional(),
});

export const businessCardSchema = z.object({
  businessCardImage: z.string().min(1, 'Business card image is required'),
  isFormComplete: z.boolean().optional(),
});

export const websiteInfoSchema = z.object({
  websiteUrl: z.string().url('Valid website URL is required').optional().or(z.literal('')),
  facebookUrl: z.string().url('Valid Facebook URL is required').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Valid LinkedIn URL is required').optional().or(z.literal('')),
  twitterUrl: z.string().url('Valid Twitter URL is required').optional().or(z.literal('')),
  instagramUrl: z.string().url('Valid Instagram URL is required').optional().or(z.literal('')),
  isFormComplete: z.boolean().optional(),
});

export const mpcApplicationSchema = z.object({
  hasAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  isFormComplete: z.boolean().optional(),
});

export const letterOfDirectionSchema = z.object({
  hasAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  isFormComplete: z.boolean().optional(),
});

export const paymentAuthorizationSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  transitNumber: z.string().min(5, 'Valid transit number is required'),
  institutionNumber: z.string().min(3, 'Valid institution number is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  hasAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  isFormComplete: z.boolean().optional(),
});

export const contractAndScheduleSchema = z.object({
  hasAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  isFormComplete: z.boolean().optional(),
});

export const policiesSchema = z.object({
  hasAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  isFormComplete: z.boolean().optional(),
});

export const unlicensedPoliciesSchema = z.object({
  hasAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  isFormComplete: z.boolean().optional(),
});

// Form validation function
export function validateForm(formType: string, data: any): { isValid: boolean; errors: string[] } {
  try {
    let schema;
    
    switch (formType) {
      case 'brokerInfo':
        schema = brokerInfoSchema;
        break;
      case 'unlicensedInfo':
        schema = unlicensedInfoSchema;
        break;
      case 'photos':
        schema = photosSchema;
        break;
      case 'businessCardInfo':
        schema = businessCardSchema;
        break;
      case 'websiteInfo':
        schema = websiteInfoSchema;
        break;
      case 'mpcApplication':
        schema = mpcApplicationSchema;
        break;
      case 'letterOfDirection':
        schema = letterOfDirectionSchema;
        break;
      case 'paymentAuthorization':
        schema = paymentAuthorizationSchema;
        break;
      case 'contractAndSchedule':
        schema = contractAndScheduleSchema;
        break;
      case 'policiesAndProcedure':
        schema = policiesSchema;
        break;
      case 'unlicensedPolicies':
        schema = unlicensedPoliciesSchema;
        break;
      default:
        return { isValid: false, errors: ['Unknown form type'] };
    }
    
    schema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message),
      };
    }
    
    return { isValid: false, errors: ['Validation failed'] };
  }
}

// Check if form is complete
export function isFormComplete(formType: string, data: any): boolean {
  const validation = validateForm(formType, data);
  return validation.isValid;
}

// Get form completion percentage for a single form
export function getFormCompletionPercentage(formType: string, data: any): number {
  if (!data) return 0;
  
  const validation = validateForm(formType, data);
  if (validation.isValid) return 100;
  
  // Calculate partial completion based on filled fields
  const totalFields = Object.keys(data).length;
  const filledFields = Object.values(data).filter(value => 
    value !== null && value !== undefined && value !== ''
  ).length;
  
  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}
