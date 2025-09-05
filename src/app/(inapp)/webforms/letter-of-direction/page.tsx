"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

const letterOfDirectionSchema = z.object({
  payeeName: z.string().min(1, "Payee name is required"),
  payeeAddress: z.string().min(1, "Payee address is required"),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  bankName: z.string().optional(),
  specialInstructions: z.string().optional(),
  signature: z.string().min(1, "Signature is required"),
});

type LetterOfDirectionFormData = z.infer<typeof letterOfDirectionSchema>;

export default function LetterOfDirectionPage() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LetterOfDirectionFormData>({
    resolver: zodResolver(letterOfDirectionSchema) as any,
    defaultValues: {
      payeeName: "",
      payeeAddress: "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      specialInstructions: "",
      signature: "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.letterOfDirection) {
      const formData = forms.letterOfDirection;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof LetterOfDirectionFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.letterOfDirection, setValue]);

  const onSubmit = async (data: LetterOfDirectionFormData) => {
    setIsLoading(true);
    try {
      updateForm('letterOfDirection', {
        ...data,
        signatureDate: new Date().toISOString(),
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('letterOfDirection');
      toast.success("Letter of Direction saved successfully!");
    } catch (error) {
      console.error("Error saving letter of direction:", error);
      toast.error("Failed to save letter of direction");
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
            Letter of Direction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <FormSectionTitle
                title="Payment Information"
                icon={<DollarSign className="h-5 w-5" />}
                description="Direct payment instructions"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payeeName">
                    Payee Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="payeeName"
                    {...form.register("payeeName")}
                    placeholder="Name of payee"
                    className={errors.payeeName ? "border-red-500" : ""}
                  />
                  {errors.payeeName && (
                    <p className="text-red-500 text-sm mt-1">{errors.payeeName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    {...form.register("bankName")}
                    placeholder="Bank name"
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    {...form.register("accountNumber")}
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    {...form.register("routingNumber")}
                    placeholder="Routing number"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="payeeAddress">
                  Payee Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="payeeAddress"
                  {...form.register("payeeAddress")}
                  placeholder="Full address of payee"
                  className={`min-h-[80px] ${errors.payeeAddress ? "border-red-500" : ""}`}
                />
                {errors.payeeAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.payeeAddress.message}</p>
                )}
              </div>

              <div className="mt-4">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  {...form.register("specialInstructions")}
                  placeholder="Any special payment instructions..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div>
              <FormSectionTitle
                title="Signature"
                icon={<FileText className="h-5 w-5" />}
                description="Please sign to authorize the payment direction"
              />
              
              <SignatureCapture
                value={watchedValues.signature}
                onSignatureChange={(signature) => setValue('signature', signature || '')}
                required={true}
              />
              {errors.signature && (
                <p className="text-red-500 text-sm mt-2">{errors.signature.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Letter of Direction"}
              </Button>
            </div>

            <NextPrevFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
