"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useContractForm } from "../hooks/use-contract-form";

export function ContractAndScheduleForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    handleSubmit,
  } = useContractForm();

  const { setValue } = form;

  // Get contract file URL from forms context
  const contractFileUrl = watchedValues.contractFileUrl || '/documents/contract-and-schedule.pdf';

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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PDF Viewer Section */}
            <div>
              <FormSectionTitle
                title="Contract Document"
                icon={<FileText className="h-5 w-5" />}
                description="Please review the contract and payment schedule document below"
              />

              <div className="border rounded-lg overflow-hidden">
                {contractFileUrl ? (
                  <iframe
                    src={contractFileUrl}
                    width="100%"
                    height="600"
                    style={{ border: 'none' }}
                    title="Contract and Payment Schedule"
                  >
                    <p>Your browser does not support PDFs. <a href={contractFileUrl}>Download the PDF</a>.</p>
                  </iframe>
                ) : (
                  <div className="flex items-center justify-center h-[600px] bg-gray-50">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Contract document will be available once your onboarding process is loaded.</p>
                    </div>
                  </div>
                )}
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
