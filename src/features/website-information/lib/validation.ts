import * as z from "zod";

const websiteInfoSchema = z.object({
  websiteOptIn: z.boolean().optional(),
  ownDomain: z.boolean().optional(),
  providedDomain: z.boolean().optional(),
  websiteDomainName: z.string().optional(),
  websiteDomainRegistrar: z.string().optional(),
  priorWebsite: z.boolean().optional(),
  priorWebsitesUse: z.array(z.object({
    domain: z.string(),
    keepInUse: z.boolean().optional(),
    redirect: z.boolean().optional(),
  })).optional(),
});

export type WebsiteInfoFormData = z.infer<typeof websiteInfoSchema>;
export { websiteInfoSchema };