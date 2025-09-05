import z from "zod";

// Form validation schema
const brokerInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  legalName: z.string().optional(),
  preferredName: z.string().optional(),
  titles: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  license: z.string().optional(),
  birthdate: z.string().min(1, "Birthdate is required"),
  sin: z.string().min(1, "SIN is required"),
  tshirtSize: z.string().optional(),
  bio: z.string().min(1, "Bio is required"),
  
  // Address fields
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  
  // Personal address fields
  personalAddress: z.string().min(1, "Personal address is required"),
  personalCity: z.string().min(1, "Personal city is required"),
  personalProvince: z.string().min(1, "Personal province is required"),
  personalPostalCode: z.string().min(1, "Personal postal code is required"),
  sameAddress: z.boolean().default(false),
  
  // Contact fields
  workPhone: z.string().min(1, "Work phone is required"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyPhone: z.string().min(1, "Emergency phone is required"),
  
  // Social media
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  
  // Declaration fields (for licensed brokers)
  declarationRegulatoryReview: z.boolean().optional(),
  declarationClientComplaints: z.boolean().optional(),
  declarationRegulatoryReviewDetails: z.string().optional(),
  declarationClientComplaintsDetails: z.string().optional(),
  
  // Signature
  signature: z.string().optional(),
});

export type BrokerInfoFormData = z.infer<typeof brokerInfoSchema>;
export { brokerInfoSchema };