import * as z from "zod";

const policiesSchema = z.object({
  brokerName: z.string().min(1, "Broker name is required"),
  signature: z.any().optional(), // Signature can be string or object with url
  signatureDate: z.string().optional(),
});

export type PoliciesFormData = z.infer<typeof policiesSchema>;
export { policiesSchema };