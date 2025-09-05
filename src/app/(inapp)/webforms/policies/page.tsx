"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

// Form validation schema
const policiesSchema = z.object({
  acknowledged: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the policies and procedures"
  }),
  acknowledgedDate: z.string().optional(),
  signature: z.string().min(1, "Signature is required"),
  signatureDate: z.string().optional(),
});

type PoliciesFormData = z.infer<typeof policiesSchema>;

export default function PoliciesPage() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PoliciesFormData>({
    resolver: zodResolver(policiesSchema) as any,
    defaultValues: {
      acknowledged: false,
      acknowledgedDate: "",
      signature: "",
      signatureDate: "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.policiesAndProcedure) {
      const formData = forms.policiesAndProcedure;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof PoliciesFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.policiesAndProcedure, setValue]);

  // Handle form submission
  const onSubmit = async (data: PoliciesFormData) => {
    setIsLoading(true);
    try {
      // Update form data in context
      updateForm('policiesAndProcedure', {
        ...data,
        acknowledgedDate: new Date().toISOString(),
        signatureDate: new Date().toISOString(),
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('policiesAndProcedure');
      
      toast.success("Policies and procedures acknowledged successfully!");
    } catch (error) {
      console.error("Error saving policies acknowledgment:", error);
      toast.error("Failed to save policies acknowledgment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Policies and Procedures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Policies Content Section */}
            <div>
              <FormSectionTitle
                title="Company Policies and Procedures"
                icon={<FileText className="h-5 w-5" />}
                description="Please review and acknowledge our company policies"
              />
              
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Important Policies to Review:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Code of Conduct and Professional Standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Privacy and Confidentiality Policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Anti-Money Laundering (AML) Procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Know Your Customer (KYC) Requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Complaint Handling Procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Record Keeping and Documentation Standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Marketing and Advertising Guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Conflict of Interest Policies</span>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The complete policies and procedures manual will be provided to you 
                    separately. Please ensure you read and understand all policies before beginning your work 
                    with our organization.
                  </p>
                </div>
              </div>
            </div>

            {/* Acknowledgment Section */}
            <div>
              <FormSectionTitle
                title="Acknowledgment"
                description="Please confirm your understanding and agreement"
              />
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acknowledged"
                    checked={watchedValues.acknowledged}
                    onCheckedChange={(checked) => setValue('acknowledged', checked as boolean)}
                    className={errors.acknowledged ? "border-red-500" : ""}
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor="acknowledged" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I acknowledge that I have received, read, and understand the company's policies and procedures manual. 
                      I agree to comply with all policies and procedures outlined therein and understand that failure to do so 
                      may result in disciplinary action up to and including termination.
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    {errors.acknowledged && (
                      <p className="text-red-500 text-sm">{errors.acknowledged.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div>
              <FormSectionTitle
                title="Signature"
                icon={<FileText className="h-5 w-5" />}
                description="Please sign to confirm your acknowledgment"
              />
              
              <SignatureCapture
                value={watchedValues.signature}
                onSignatureChange={(signature) => setValue('signature', signature || '')}
                required={true}
                label="Your Signature"
              />
              {errors.signature && (
                <p className="text-red-500 text-sm mt-2">{errors.signature.message}</p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !watchedValues.acknowledged}>
                {isLoading ? "Saving..." : "Acknowledge and Sign"}
              </Button>
            </div>

            {/* Navigation Footer */}
            <NextPrevFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
