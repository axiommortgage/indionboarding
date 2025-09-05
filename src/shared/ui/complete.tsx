"use client";

import * as React from "react";
import { CheckCircle, Download, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";
import { downloadFormPDF } from "@/shared/lib/pdf-generator";

interface CompleteProps {
  className?: string;
}

export function Complete({ className }: CompleteProps) {
  const { forms, submitAllForms } = useFormsContext();
  const { userAuth } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (forms.isSubmited) {
      setIsSubmitted(true);
    }
  }, [forms.isSubmited]);

  const handleSubmitPackage = async () => {
    setIsSubmitting(true);
    try {
      await submitAllForms();
      setIsSubmitted(true);
      toast.success("Onboarding package submitted successfully!");
    } catch (error) {
      console.error("Error submitting package:", error);
      toast.error("Failed to submit onboarding package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadForm = async (formKey: string, formTitle: string) => {
    try {
      const formData = forms[formKey as keyof typeof forms];
      if (!formData) {
        toast.error(`No data found for ${formTitle}`);
        return;
      }

      const filename = `${formTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      await downloadFormPDF(formData as any, formTitle, filename);
      toast.success(`${formTitle} downloaded successfully!`);
    } catch (error) {
      console.error(`Error downloading ${formTitle}:`, error);
      toast.error(`Failed to download ${formTitle}`);
    }
  };

  const availableForms = [
    { key: 'brokerInfo', title: 'Broker Information', available: !!forms.brokerInfo },
    { key: 'unlicensedInfo', title: 'Unlicensed Information', available: !!forms.unlicensedInfo },
    { key: 'businessCardInfo', title: 'Business Card Information', available: !!forms.businessCardInfo },
    { key: 'contractAndSchedule', title: 'Contract And Schedule', available: !!forms.contractAndSchedule },
    { key: 'letterOfDirection', title: 'Letter Of Direction', available: !!forms.letterOfDirection },
    { key: 'mpcApplication', title: 'MPC Application', available: !!forms.mpcApplication },
    { key: 'paymentAuthorization', title: 'Payment Authorization', available: !!forms.paymentAuthorization },
    { key: 'photos', title: 'Photos', available: !!forms.photos },
    { key: 'policiesAndProcedure', title: 'Policies And Procedure', available: !!forms.policiesAndProcedure },
    { key: 'unlicensedPolicies', title: 'Unlicensed Policies', available: !!forms.unlicensedPolicies },
    { key: 'websiteInfo', title: 'Website Information', available: !!forms.websiteInfo },
  ].filter(form => form.available);

  return (
    <div className={`container mx-auto py-8 ${className}`}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Wooohooo!!! Congratulations!
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            You've completed the onboarding package!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              The Indi's team is hard at work getting your custom setup at Indi Mortgage ready for your 
              license activation. You can expect to hear from a member of the team within 2 business days. 
              Download the on-boarding package here for your records.
            </p>
          </div>

          {isSubmitted ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">
                  Please download your forms for your records.
                </h3>
              </div>

              <div className="space-y-3">
                {availableForms.map((form) => (
                  <div
                    key={form.key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{form.title}</h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadForm(form.key, form.title)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Form
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleSubmitPackage}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Finish and Submit Forms
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
