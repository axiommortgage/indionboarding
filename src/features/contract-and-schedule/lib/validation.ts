import * as z from "zod";

const contractSchema = z.object({
  brokerSignature: z.string().min(1, "Broker signature is required"),
  brokerInitials: z.string().min(1, "Broker initials are required"),
  contractFileUrl: z.string().optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;
export { contractSchema };
