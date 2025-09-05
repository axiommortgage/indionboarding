import { z } from "zod";

// Canadian provinces
const PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland And Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
] as const;

// T-shirt sizes
const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

// Helper schemas
const phoneRegex = /^[\d\s\-\(\)\.]+$/;
const urlRegex = /^https?:\/\/.*$/;

// User Info Tab Schema
export const userInfoSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  middlename: z.string().optional(),
  lastname: z.string().min(1, "Last name is required"),
  legalName: z.string().optional(),
  preferredName: z.string().optional(),
  titles: z.string().optional(),
  position: z.string().optional(),
  license: z.string().optional(),
  tshirtSize: z.enum(TSHIRT_SIZES).optional(),
  bio: z.string().max(800, "Bio cannot exceed 800 characters").optional(),
  additionalNotes: z
    .string()
    .max(800, "Additional notes cannot exceed 800 characters")
    .optional(),
});

// Contact Info Tab Schema
export const contactInfoSchema = z.object({
  email: z.string().email("Invalid email address"),
  workEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Invalid phone number format"),
  ext: z.string().optional(),
  homePhone: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  cellPhone: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  emergencyContact: z.string().optional(),
  emergencyPhone: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  dietRestriction: z.string().optional(),
});

// Social Links Tab Schema
export const socialLinksSchema = z.object({
  website: z
    .string()
    .regex(urlRegex, "Website must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  secondaryWebsite: z
    .string()
    .regex(urlRegex, "Website must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .regex(urlRegex, "Instagram must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  facebook: z
    .string()
    .regex(urlRegex, "Facebook must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .regex(urlRegex, "LinkedIn must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .regex(urlRegex, "Twitter must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  youtube: z
    .string()
    .regex(urlRegex, "YouTube must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  applicationLink: z
    .string()
    .regex(urlRegex, "Application link must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  appointmentScheduleLink: z
    .string()
    .regex(urlRegex, "Appointment link must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  googleReviewsLink: z
    .string()
    .regex(urlRegex, "Google Reviews link must be a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
});

// Office Address Tab Schema
export const officeAddressSchema = z.object({
  address: z.string().min(1, "Office address is required"),
  suiteUnit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.enum(PROVINCES, { required_error: "Province is required" }),
  postalCode: z.string().min(1, "Postal code is required"),
  provinceLicenseNumber: z.string().optional(),
});

// Personal Address Tab Schema
export const personalAddressSchema = z.object({
  personalAddress: z.string().min(1, "Personal address is required"),
  personalSuiteUnit: z.string().optional(),
  personalCity: z.string().min(1, "City is required"),
  personalProvince: z.enum(PROVINCES, {
    required_error: "Province is required",
  }),
  personalPostalCode: z.string().min(1, "Postal code is required"),
});

// Awards Tab Schema
export const awardsSchema = z.object({
  badges: z.array(
    z.object({
      id: z.union([z.string(), z.number()]), // Allow both string and number IDs
      title: z.string().nullable(), // Allow null titles
      enabled: z.boolean(),
      image: z
        .object({
          url: z.string(),
          formats: z
            .object({
              thumbnail: z.object({ url: z.string() }).optional(),
              small: z.object({ url: z.string() }).optional(),
              medium: z.object({ url: z.string() }).optional(),
            })
            .optional(),
        })
        .optional(),
    })
  ),
  showBadges: z.object({
    website: z.boolean(),
    emailSignature: z.boolean(),
  }),
});

// Combined schema for full profile
export const fullProfileSchema = z.object({
  userInfo: userInfoSchema,
  contactInfo: contactInfoSchema,
  socialLinks: socialLinksSchema,
  officeAddress: officeAddressSchema,
  personalAddress: personalAddressSchema,
  awards: awardsSchema,
});

// Export individual form schemas for use with React Hook Form
export type UserInfoFormData = z.infer<typeof userInfoSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type SocialLinksFormData = z.infer<typeof socialLinksSchema>;
export type OfficeAddressFormData = z.infer<typeof officeAddressSchema>;
export type PersonalAddressFormData = z.infer<typeof personalAddressSchema>;
export type AwardsFormData = z.infer<typeof awardsSchema>;
export type FullProfileFormData = z.infer<typeof fullProfileSchema>;

// Constants for form options
export const PROVINCE_OPTIONS = PROVINCES.map((province) => ({
  value: province,
  label: province,
}));

export const TSHIRT_SIZE_OPTIONS = TSHIRT_SIZES.map((size) => ({
  value: size,
  label: size,
}));
