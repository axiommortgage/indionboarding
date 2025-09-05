"use client";

import * as React from "react";
import { CreditCard, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SwitcherBox } from "@/shared/ui/switcher-box";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useBusinessCardForm } from "../hooks/use-business-card-form";

export function BusinessCardForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    handleSubmit,
  } = useBusinessCardForm();

  const { setValue } = form;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Business Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Information Section */}
            <div className="space-y-4">
              <p>
                The business card provided by Indi is a NFC card, which will contain all your contact information digitally. You can transfer your contact information to a phone by approximating your card to the phone, and it will add your data as a new contact to that phone.
              </p>
              <p>
                Paper Business Cards only upon request by email:{' '}
                <a href="mailto:tanya.appel@indimortgage.ca" target="_blank" className="text-blue-600 underline">
                  tanya.appel@indimortgage.ca
                </a>
                .
              </p>
            </div>

            {/* Opt In Section */}
            <div>
              <FormSectionTitle
                title="Opt In"
                icon={<X className="h-7 w-7" />}
              />

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Do you require a Business Card? <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-6 mt-2">
                    <SwitcherBox
                      id="businessCardOptOutYes"
                      name="businessCardOptOut"
                      checked={watchedValues.businessCardOptOut === true}
                      onChange={(checked) => setValue('businessCardOptOut', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="businessCardOptOutNo"
                      name="businessCardOptOut"
                      checked={watchedValues.businessCardOptOut === false}
                      onChange={(checked) => setValue('businessCardOptOut', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {watchedValues.businessCardOptOut === false && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900">
                      Opting out? Please ensure your cards are compliant. You must acquire approval from the brokerage prior to use.
                    </h2>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Business Card Info"}
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
