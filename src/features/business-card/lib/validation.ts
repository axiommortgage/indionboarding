import * as z from "zod";

const businessCardSchema = z.object({
  businessCardOptOut: z.boolean().optional(),
});

export type BusinessCardFormData = z.infer<typeof businessCardSchema>;
export { businessCardSchema };
