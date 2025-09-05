import * as z from "zod";

const paymentAuthSchema = z.object({
  // Payroll requirement
  payrollRequired: z.boolean().optional(),
  payrollRequiredNo: z.boolean().optional(),
  
  // Broker information
  brokerName: z.string().min(1, "Broker name is required"),
  birthdate: z.string().min(1, "Birth date is required"),
  sin: z.string().min(1, "SIN is required"),
  
  // Account information
  chequingAccount: z.boolean().optional(),
  savingsAccount: z.boolean().optional(),
  accountType: z.string().optional(),
  nameOnAccount: z.string().min(1, "Name on account is required"),
  
  // Bank information
  bankName: z.string().min(1, "Bank name is required"),
  bankAddress: z.string().min(1, "Bank address is required"),
  transitNumber: z.string().min(1, "Transit number is required"),
  institutionNumber: z.string().min(1, "Institution number is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  
  // Company account
  companyAccount: z.boolean().optional(),
  businessNumber: z.string().optional(),
  articlesOfIncorporation: z.any().optional(), // File upload
  
  // Credit card expenses
  creditCardExpenses: z.boolean().optional(),
  
  // Signature
  signature: z.any().optional(),
});

export type PaymentAuthFormData = z.infer<typeof paymentAuthSchema>;
export { paymentAuthSchema };