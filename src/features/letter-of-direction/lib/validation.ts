import * as z from "zod";

const letterOfDirectionSchema = z.object({
  // Mortgage software selection
  mortgageSoftware: z.string().optional(),
  otherMortgageSoftware: z.string().optional(),
  
  // Letter of direction selection
  selectedLetter: z.string().optional(),
  
  // Acknowledgement
  acknowledgement: z.boolean().optional(),
});

export type LetterOfDirectionFormData = z.infer<typeof letterOfDirectionSchema>;
export { letterOfDirectionSchema };