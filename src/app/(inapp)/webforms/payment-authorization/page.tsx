"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreditCard, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

const paymentAuthSchema = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
  billingAddress: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  signature: z.string().min(1, "Signature is required"),
});

type PaymentAuthFormData = z.infer<typeof paymentAuthSchema>;

export default function PaymentAuthorizationPage() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PaymentAuthFormData>({
    resolver: zodResolver(paymentAuthSchema) as any,
    defaultValues: {
      paymentMethod: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      billingAddress: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      signature: "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  React.useEffect(() => {
    if (forms.paymentAuthorization) {
      const formData = forms.paymentAuthorization;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof PaymentAuthFormData, formData[key as keyof typeof formData] as any);
        }
      });
    }
  }, [forms.paymentAuthorization, setValue]);

  const onSubmit = async (data: PaymentAuthFormData) => {
    setIsLoading(true);
    try {
      updateForm('paymentAuthorization', {
        ...data,
        signatureDate: new Date().toISOString(),
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      await saveForm('paymentAuthorization');
      toast.success("Payment Authorization saved successfully!");
    } catch (error) {
      console.error("Error saving payment authorization:", error);
      toast.error("Failed to save payment authorization");
    } finally {
      setIsLoading(false);
    }
  };

  const isCardPayment = watchedValues.paymentMethod === 'credit_card';
  const isBankPayment = watchedValues.paymentMethod === 'bank_transfer';

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Authorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <FormSectionTitle
                title="Payment Method"
                icon={<CreditCard className="h-5 w-5" />}
                description="Choose your preferred payment method"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedValues.paymentMethod}
                    onValueChange={(value) => setValue('paymentMethod', value)}
                  >
                    <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
                  )}
                </div>
              </div>
            </div>

            {isCardPayment && (
              <div>
                <FormSectionTitle
                  title="Credit Card Information"
                  description="Enter your credit card details"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      {...form.register("cardholderName")}
                      placeholder="Name on card"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      {...form.register("cardNumber")}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      {...form.register("expiryDate")}
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      {...form.register("cvv")}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    {...form.register("billingAddress")}
                    placeholder="Full billing address"
                  />
                </div>
              </div>
            )}

            {isBankPayment && (
              <div>
                <FormSectionTitle
                  title="Bank Information"
                  description="Enter your bank account details"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      {...form.register("bankName")}
                      placeholder="Your bank name"
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
              </div>
            )}

            <div>
              <FormSectionTitle
                title="Authorization Signature"
                icon={<FileText className="h-5 w-5" />}
                description="Please sign to authorize payment processing"
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
                {isLoading ? "Saving..." : "Save Payment Authorization"}
              </Button>
            </div>

            <NextPrevFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
