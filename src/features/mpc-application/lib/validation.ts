import * as z from "zod";

const mpcApplicationSchema = z.object({
  // Individual Information
  firstname: z.string().min(1, "First name is required"),
  middlename: z.string().optional(),
  lastname: z.string().min(1, "Last name is required"),
  preferredName: z.string().optional(),
  website: z.string().optional(),
  workEmail: z.string().min(1, "Preferred email contact is required").email("Invalid email format"),
  alternateEmail: z.string().optional(),
  position: z.string().min(1, "Position is required"),

  // Mailing Address
  address: z.string().min(1, "Mailing address is required"),
  suiteUnit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  workPhone: z.string().min(1, "Preferred phone contact is required"),
  cellPhone: z.string().optional(),
  tollfree: z.string().optional(),
  fax: z.string().optional(),

  // Office Location
  officeAddress: z.string().min(1, "Office address is required"),
  officeSuiteUnit: z.string().optional(),
  officeCity: z.string().min(1, "Office city is required"),
  officeProvince: z.string().min(1, "Office province is required"),
  officePostalCode: z.string().min(1, "Office postal code is required"),
  officeWebsite: z.string().optional(),

  // Declarations
  declarationCriminalOffense: z.boolean().optional(),
  declarationFraud: z.boolean().optional(),
  declarationSuspended: z.boolean().optional(),
  declarationLicenseDenied: z.boolean().optional(),
  declarationBankruptcy: z.boolean().optional(),
  declarationDetails: z.string().optional(),
  judgementAction: z.string().optional(), // File upload

  // Signature
  applicantDeclarationSignature: z.string().min(1, "Signature is required"),
});

export type MpcApplicationFormData = z.infer<typeof mpcApplicationSchema>;
export { mpcApplicationSchema };