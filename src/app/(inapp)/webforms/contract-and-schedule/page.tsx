"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

const contractSchema = z.object({
  brokerSignature: z.string().min(1, "Broker signature is required"),
  brokerInitials: z.string().min(1, "Broker initials are required"),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function ContractAndSchedulePage() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      brokerSignature: forms.contractAndSchedule?.brokerSignature || "",
      brokerInitials: forms.contractAndSchedule?.brokerInitials || "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.contractAndSchedule) {
      const formData = forms.contractAndSchedule;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof ContractFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.contractAndSchedule, setValue]);

  const onSubmit = async (data: ContractFormData) => {
    setIsLoading(true);
    try {
      updateForm('contractAndSchedule', {
        ...data,
        signatureDate: new Date().toISOString(),
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('contractAndSchedule');
      toast.success("Contract and Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error("Failed to save contract");
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
            Contract and Payment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* PDF Viewer Section */}
            <div>
              <FormSectionTitle
                title="Contract Document"
                icon={<FileText className="h-5 w-5" />}
                description="Please review the contract and payment schedule document below"
              />

              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src="/documents/contract-and-schedule.pdf"
                  width="100%"
                  height="600"
                  style={{ border: 'none' }}
                  title="Contract and Payment Schedule"
                >
                  <p>Your browser does not support PDFs. <a href="/documents/contract-and-schedule.pdf">Download the PDF</a>.</p>
                </iframe>
              </div>
            </div>

            {/* Signature Section */}
            <div>
              <FormSectionTitle
                title="Broker Signature"
                description="Please provide your signature to accept the contract terms"
              />

              <div className="space-y-4">
                <div>
                  <SignatureCapture
                    value={watchedValues.brokerSignature}
                    onSignatureChange={(signature) => setValue('brokerSignature', signature || '')}
                    label="Broker Signature"
                    required
                  />
                  {errors.brokerSignature && (
                    <p className="text-red-500 text-sm mt-1">{errors.brokerSignature.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Initials Section */}
            <div>
              <FormSectionTitle
                title="Broker Initials"
                description="Please provide your initials"
              />

              <div className="space-y-4">
                <div>
                  <SignatureCapture
                    value={watchedValues.brokerInitials}
                    onSignatureChange={(initials) => setValue('brokerInitials', initials || '')}
                    label="Broker Initials"
                    required
                  />
                  {errors.brokerInitials && (
                    <p className="text-red-500 text-sm mt-1">{errors.brokerInitials.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Contract"}
              </Button>
            </div>

            <NextPrevFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
