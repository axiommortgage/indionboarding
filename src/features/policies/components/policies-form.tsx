"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { usePoliciesForm } from "../hooks/use-policies-form";

export function PoliciesForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    hasSignature,
    handleSubmit,
  } = usePoliciesForm();

  const { setValue } = form;

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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Policies Acknowledgment Text */}
            <div className="space-y-4">
              <p>
                I acknowledge that I have read the <strong>Indi Mortgage</strong> (the "brokerage"){' '}
                <a 
                  href="/documents/policies-and-procedures-manual.pdf" 
                  target="_blank" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Policies and Procedures Manual
                </a>{' '}
                (the "Manual") in its entirety. I confirm that I will adhere to the practices and procedures
                contained within.
              </p>
              <p>
                I also acknowledge it is my sole responsibility to keep updated on any changes made to the Manual
                and that changes made will be communicated to me by the brokerage.
              </p>
            </div>

            {/* Broker Name Section */}
            <div>
              <Label htmlFor="brokerName" className="text-base font-medium mb-4 block">
                Broker/Agent Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brokerName"
                {...form.register("brokerName")}
                placeholder="Broker/Agent Name*"
                className={errors.brokerName ? "border-red-500" : ""}
              />
              {errors.brokerName && (
                <p className="text-red-500 text-sm mt-1">{errors.brokerName.message}</p>
              )}
            </div>

            {/* Signature Section */}
            <div>
              <Label className="text-base font-medium mb-4 block">Signature</Label>
              {hasSignature ? (
                <div className="space-y-4">
                  <div className="w-full max-w-md">
                    {typeof watchedValues.signature === 'object' && watchedValues.signature?.url ? (
                      <img
                        src={watchedValues.signature.url}
                        alt="Signature"
                        className="w-full h-auto border rounded"
                      />
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Signature captured</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Signed on:</strong> {watchedValues.signatureDate ? 
                      new Date(watchedValues.signatureDate).toLocaleString() : 
                      'Just now'
                    }
                  </p>
                </div>
              ) : (
                <SignatureCapture
                  value={watchedValues.signature}
                  onSignatureChange={(signature) => setValue('signature', signature || '')}
                  required={true}
                  label="Your Signature"
                />
              )}
              {errors.signature && (
                <p className="text-red-500 text-sm mt-2">
                  {String(errors.signature.message || 'Signature is required')}
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="default"
                disabled={isLoading || !hasSignature}
              >
                {isLoading ? "Saving..." : "Save Form"}
              </Button>
            </div>

            {/* Help Text */}
            {!hasSignature && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Please save your signature first.
                </p>
              </div>
            )}

            {/* Navigation Footer */}
            <NextPrevFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}