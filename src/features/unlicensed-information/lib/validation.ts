import * as z from "zod";

const unlicensedInfoSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  middlename: z.string().optional(),
  lastname: z.string().min(1, "Last name is required"),
  workEmail: z.string().email("Valid email is required"),
  cellPhone: z.string().min(1, "Cell phone is required"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyPhone: z.string().min(1, "Emergency phone is required"),
  assistantTo: z.string().min(1, "Assistant to is required"),
  completingCompliance: z.boolean().optional(),
  
  // Office Address
  address: z.string().min(1, "Address is required"),
  suiteUnit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  
  // Personal Address
  personalAddress: z.string().min(1, "Personal address is required"),
  personalSuiteUnit: z.string().optional(),
  personalCity: z.string().min(1, "Personal city is required"),
  personalProvince: z.string().min(1, "Personal province is required"),
  personalPostalCode: z.string().min(1, "Personal postal code is required"),
  
  // Signature
  signature: z.any().optional(),
});

export type UnlicensedInfoFormData = z.infer<typeof unlicensedInfoSchema>;
export { unlicensedInfoSchema };