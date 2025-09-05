"use client";

import * as React from "react";
import { User, Phone, MapPin, FileText, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { PhoneInput } from "@/shared/ui/masked-inputs";
import { AddressSelect } from "@/shared/ui/address-select";
import { SwitcherBox } from "@/shared/ui/switcher-box";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useUnlicensedInfoForm } from "../hooks/use-unlicensed-info-form";

export function UnlicensedInformationForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    charCount,
    sameAddressWarning,
    branches,
    hasSignature,
    handleBioChange,
    handleNoteChange,
    handleSameAddressChange,
    handleBranchSelect,
    handleSubmit,
  } = useUnlicensedInfoForm();

  const { setValue } = form;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal & Professional Section */}
            <div>
              <FormSectionTitle
                title="Personal & Professional"
                icon={<User className="h-7 w-7" />}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstname">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstname"
                    {...form.register("firstname")}
                    placeholder="Name"
                    className={errors.firstname ? "border-red-500" : ""}
                  />
                  {errors.firstname && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstname.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="middlename">Middle Name</Label>
                  <Input
                    id="middlename"
                    {...form.register("middlename")}
                    placeholder="Name"
                  />
                </div>

                <div>
                  <Label htmlFor="lastname">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastname"
                    {...form.register("lastname")}
                    placeholder="Last Name"
                    className={errors.lastname ? "border-red-500" : ""}
                  />
                  {errors.lastname && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastname.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="assistantTo">
                    Assistant To <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="assistantTo"
                    {...form.register("assistantTo")}
                    placeholder=""
                    className={errors.assistantTo ? "border-red-500" : ""}
                  />
                  {errors.assistantTo && (
                    <p className="text-red-500 text-sm mt-1">{errors.assistantTo.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Completing Compliance <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="completingComplianceYes"
                        checked={watchedValues.completingCompliance === true}
                        onCheckedChange={(checked) => setValue('completingCompliance', checked === true)}
                      />
                      <Label htmlFor="completingComplianceYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="completingComplianceNo"
                        checked={watchedValues.completingCompliance === false}
                        onCheckedChange={(checked) => setValue('completingCompliance', checked === true ? false : undefined)}
                      />
                      <Label htmlFor="completingComplianceNo">No</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <FormSectionTitle
                title="Contact"
                icon={<Phone className="h-7 w-7" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="workEmail">
                    Preferred Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="workEmail"
                    type="email"
                    {...form.register("workEmail")}
                    placeholder="johndoe@indimortgage.ca"
                    className={errors.workEmail ? "border-red-500" : ""}
                  />
                  {errors.workEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.workEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cellPhone">
                    Cell Phone <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    id="cellPhone"
                    value={watchedValues.cellPhone}
                    onChange={(e) => setValue('cellPhone', e.target.value)}
                    placeholder="999-888-7777"
                    className={errors.cellPhone ? "border-red-500" : ""}
                  />
                  {errors.cellPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.cellPhone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyContact">
                    Emergency Contact Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emergencyContact"
                    {...form.register("emergencyContact")}
                    placeholder="John Doe"
                    className={errors.emergencyContact ? "border-red-500" : ""}
                  />
                  {errors.emergencyContact && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">
                    Emergency Contact Phone <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    id="emergencyPhone"
                    value={watchedValues.emergencyPhone}
                    onChange={(e) => setValue('emergencyPhone', e.target.value)}
                    placeholder="999-888-7777"
                    className={errors.emergencyPhone ? "border-red-500" : ""}
                  />
                  {errors.emergencyPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Office Address Section */}
            <div>
              <FormSectionTitle
                title="Office Address"
                icon={<MapPin className="h-7 w-7" />}
              />

              <div className="mb-4">
                <AddressSelect
                  branches={branches}
                  onAddressSelect={handleBranchSelect}
                  className="max-w-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">
                    Office Address (Street) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="223 14 Street NW"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="suiteUnit">Suite/Unit</Label>
                  <Input
                    id="suiteUnit"
                    {...form.register("suiteUnit")}
                    placeholder="suite/unit"
                  />
                </div>

                <div>
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Calgary"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="province">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedValues.province}
                    onValueChange={(value) => setValue('province', value)}
                  >
                    <SelectTrigger className={errors.province ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alberta">Alberta</SelectItem>
                      <SelectItem value="British Columbia">British Columbia</SelectItem>
                      <SelectItem value="Manitoba">Manitoba</SelectItem>
                      <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                      <SelectItem value="Newfoundland And Labrador">Newfoundland And Labrador</SelectItem>
                      <SelectItem value="Northwest Territories">Northwest Territories</SelectItem>
                      <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                      <SelectItem value="Nunavut">Nunavut</SelectItem>
                      <SelectItem value="Ontario">Ontario</SelectItem>
                      <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                      <SelectItem value="Quebec">Quebec</SelectItem>
                      <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                      <SelectItem value="Yukon">Yukon</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.province && (
                    <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postalCode">
                    Postal Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postalCode"
                    {...form.register("postalCode")}
                    placeholder="T2N 1Z6"
                    className={errors.postalCode ? "border-red-500" : ""}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Address Section */}
            <div>
              <FormSectionTitle
                title="Personal Address"
                icon={<MapPin className="h-7 w-7" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="personalAddress">
                    Address (Street) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personalAddress"
                    {...form.register("personalAddress")}
                    placeholder="223 14 Street NW"
                    className={errors.personalAddress ? "border-red-500" : ""}
                  />
                  {errors.personalAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalAddress.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="personalSuiteUnit">Suite/Unit</Label>
                  <Input
                    id="personalSuiteUnit"
                    {...form.register("personalSuiteUnit")}
                    placeholder="suite/unit"
                  />
                </div>

                <div>
                  <Label htmlFor="personalCity">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personalCity"
                    {...form.register("personalCity")}
                    placeholder="Calgary"
                    className={errors.personalCity ? "border-red-500" : ""}
                  />
                  {errors.personalCity && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalCity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="personalProvince">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedValues.personalProvince}
                    onValueChange={(value) => setValue('personalProvince', value)}
                  >
                    <SelectTrigger className={errors.personalProvince ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alberta">Alberta</SelectItem>
                      <SelectItem value="British Columbia">British Columbia</SelectItem>
                      <SelectItem value="Manitoba">Manitoba</SelectItem>
                      <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                      <SelectItem value="Newfoundland And Labrador">Newfoundland And Labrador</SelectItem>
                      <SelectItem value="Northwest Territories">Northwest Territories</SelectItem>
                      <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                      <SelectItem value="Nunavut">Nunavut</SelectItem>
                      <SelectItem value="Ontario">Ontario</SelectItem>
                      <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                      <SelectItem value="Quebec">Quebec</SelectItem>
                      <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                      <SelectItem value="Yukon">Yukon</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.personalProvince && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalProvince.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="personalPostalCode">
                    Postal Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personalPostalCode"
                    {...form.register("personalPostalCode")}
                    placeholder="T2N 1Z6"
                    className={errors.personalPostalCode ? "border-red-500" : ""}
                  />
                  {errors.personalPostalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalPostalCode.message}</p>
                  )}
                </div>
              </div>

              {/* Same Address Warning */}
              {sameAddressWarning && sameAddressWarning.showMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 mb-4">
                    It seems like you are adding your <strong>Personal Address</strong> as the same as your{' '}
                    <strong>Office Address.</strong>
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAddressYes"
                        checked={false}
                        onCheckedChange={() => setSameAddressWarning({ showMessage: false, sameAddress: true })}
                      />
                      <Label htmlFor="sameAddressYes">Yes, it is the same address.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAddressNo"
                        checked={false}
                        onCheckedChange={() => setSameAddressWarning({ showMessage: false, sameAddress: false })}
                      />
                      <Label htmlFor="sameAddressNo">No, I'd like to add a different address.</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Signature Section */}
            <div>
              <FormSectionTitle
                title="Signature"
                icon={<Edit className="h-7 w-7" />}
                subtitle="Draw your signature on the rectangle below and save it."
              />

              <div className="max-w-md">
                {hasSignature() ? (
                  <div className="space-y-4">
                    <div className="w-full">
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
                      <strong>Signed on:</strong> {new Date().toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <SignatureCapture
                    value={watchedValues.signature}
                    onSignatureChange={(signature) => setValue('signature', signature || '')}
                    required={true}
                    label="Broker Signature (Please sign in the rectangle area)"
                  />
                )}
                {errors.signature && (
                  <p className="text-red-500 text-sm mt-2">
                    {String(errors.signature.message || 'Signature is required')}
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="default"
                disabled={isLoading || !hasSignature()}
              >
                {isLoading ? "Saving..." : "Save Form"}
              </Button>
            </div>

            {/* Help Text */}
            {!hasSignature() && (
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