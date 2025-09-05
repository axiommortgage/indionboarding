"use client";

import * as React from "react";
import { User, Phone, MapPin, Calendar, FileText, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { PhoneInput, SinInput } from "@/shared/ui/masked-inputs";
import { AddressSelect } from "@/shared/ui/address-select";
import { SwitcherBox } from "@/shared/ui/switcher-box";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useBrokerInfoForm } from "../hooks/use-broker-info-form";

export function BrokerInformationForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    charCount,
    sameAddressWarning,
    branches,
    isLicensed,
    handleBioChange,
    handleSameAddressChange,
    handleBranchSelect,
    handleSubmit,
  } = useBrokerInfoForm();

  const { setValue } = form;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Broker Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <FormSectionTitle
                title="Personal Information"
                icon={<User className="h-5 w-5" />}
                description="Please provide your personal details"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="First Name"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Last Name"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input
                    id="legalName"
                    {...form.register("legalName")}
                    placeholder="Legal Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input
                    id="preferredName"
                    {...form.register("preferredName")}
                    placeholder="Preferred Name"
                  />
                </div>

                <div>
                  <Label htmlFor="titles">Titles After Name (e.g. AMP, BCC)</Label>
                  <Input
                    id="titles"
                    {...form.register("titles")}
                    placeholder="AMP, BCC, BCO"
                  />
                </div>

                <div>
                  <Label htmlFor="position">
                    Position <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="position"
                    {...form.register("position")}
                    placeholder="I.E: Mortgage Broker"
                    className={errors.position ? "border-red-500" : ""}
                  />
                  {errors.position && (
                    <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="license">License Number</Label>
                  <Input
                    id="license"
                    {...form.register("license")}
                    placeholder="I.E: #AXM003333"
                  />
                </div>

                <div>
                  <Label htmlFor="birthdate">
                    Birthdate <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    {...form.register("birthdate")}
                    className={errors.birthdate ? "border-red-500" : ""}
                  />
                  {errors.birthdate && (
                    <p className="text-red-500 text-sm mt-1">{errors.birthdate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sin">
                    SIN <span className="text-red-500">*</span>
                  </Label>
                  <SinInput
                    id="sin"
                    value={watchedValues.sin}
                    onChange={(e) => setValue('sin', e.target.value)}
                    className={errors.sin ? "border-red-500" : ""}
                  />
                  {errors.sin && (
                    <p className="text-red-500 text-sm mt-1">{errors.sin.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="tshirtSize">T-Shirt Size</Label>
                  <Select
                    value={watchedValues.tshirtSize}
                    onValueChange={(value) => setValue('tshirtSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="bio">
                  More About Me (Bio) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="bio"
                  value={watchedValues.bio}
                  onChange={handleBioChange}
                  placeholder="Tell us about yourself..."
                  className={`min-h-[100px] ${errors.bio ? "border-red-500" : ""}`}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-500 text-sm">{errors.bio.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground ml-auto">
                    {charCount.bio}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Office Address Section */}
            <div>
              <FormSectionTitle
                title="Office Address"
                icon={<MapPin className="h-5 w-5" />}
                description="Your primary work address"
              />

              {/* Branch Selection */}
              <div className="mb-4">
                <AddressSelect
                  branches={branches}
                  onAddressSelect={handleBranchSelect}
                  className="max-w-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="123 Main Street"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
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
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AB">Alberta</SelectItem>
                      <SelectItem value="BC">British Columbia</SelectItem>
                      <SelectItem value="MB">Manitoba</SelectItem>
                      <SelectItem value="NB">New Brunswick</SelectItem>
                      <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                      <SelectItem value="NS">Nova Scotia</SelectItem>
                      <SelectItem value="ON">Ontario</SelectItem>
                      <SelectItem value="PE">Prince Edward Island</SelectItem>
                      <SelectItem value="QC">Quebec</SelectItem>
                      <SelectItem value="SK">Saskatchewan</SelectItem>
                      <SelectItem value="NT">Northwest Territories</SelectItem>
                      <SelectItem value="NU">Nunavut</SelectItem>
                      <SelectItem value="YT">Yukon</SelectItem>
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
                    placeholder="T2P 1J9"
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
                icon={<MapPin className="h-5 w-5" />}
                description="Your home address"
              />

              <div className="mb-4">
                <SwitcherBox
                  id="sameAddress"
                  name="sameAddress"
                  checked={watchedValues.sameAddress}
                  onChange={handleSameAddressChange}
                  label="Same as office address"
                  yesno={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="personalAddress">
                    Personal Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personalAddress"
                    {...form.register("personalAddress")}
                    placeholder="123 Home Street"
                    className={errors.personalAddress ? "border-red-500" : ""}
                    disabled={watchedValues.sameAddress}
                  />
                  {errors.personalAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalAddress.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="personalCity">
                    Personal City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personalCity"
                    {...form.register("personalCity")}
                    placeholder="Calgary"
                    className={errors.personalCity ? "border-red-500" : ""}
                    disabled={watchedValues.sameAddress}
                  />
                  {errors.personalCity && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalCity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="personalProvince">
                    Personal Province <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedValues.personalProvince}
                    onValueChange={(value) => setValue('personalProvince', value)}
                    disabled={watchedValues.sameAddress}
                  >
                    <SelectTrigger className={errors.personalProvince ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AB">Alberta</SelectItem>
                      <SelectItem value="BC">British Columbia</SelectItem>
                      <SelectItem value="MB">Manitoba</SelectItem>
                      <SelectItem value="NB">New Brunswick</SelectItem>
                      <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                      <SelectItem value="NS">Nova Scotia</SelectItem>
                      <SelectItem value="ON">Ontario</SelectItem>
                      <SelectItem value="PE">Prince Edward Island</SelectItem>
                      <SelectItem value="QC">Quebec</SelectItem>
                      <SelectItem value="SK">Saskatchewan</SelectItem>
                      <SelectItem value="NT">Northwest Territories</SelectItem>
                      <SelectItem value="NU">Nunavut</SelectItem>
                      <SelectItem value="YT">Yukon</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.personalProvince && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalProvince.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="personalPostalCode">
                    Personal Postal Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personalPostalCode"
                    {...form.register("personalPostalCode")}
                    placeholder="T2P 1J9"
                    className={errors.personalPostalCode ? "border-red-500" : ""}
                    disabled={watchedValues.sameAddress}
                  />
                  {errors.personalPostalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.personalPostalCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <FormSectionTitle
                title="Contact Information"
                icon={<Phone className="h-5 w-5" />}
                description="Your contact details"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="workPhone">
                    Work Phone <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    id="workPhone"
                    value={watchedValues.workPhone}
                    onChange={(e) => setValue('workPhone', e.target.value)}
                    className={errors.workPhone ? "border-red-500" : ""}
                  />
                  {errors.workPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.workPhone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyContact">
                    Emergency Contact <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emergencyContact"
                    {...form.register("emergencyContact")}
                    placeholder="Emergency contact name"
                    className={errors.emergencyContact ? "border-red-500" : ""}
                  />
                  {errors.emergencyContact && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">
                    Emergency Phone <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    id="emergencyPhone"
                    value={watchedValues.emergencyPhone}
                    onChange={(e) => setValue('emergencyPhone', e.target.value)}
                    className={errors.emergencyPhone ? "border-red-500" : ""}
                  />
                  {errors.emergencyPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div>
              <FormSectionTitle
                title="Social Media"
                description="Your social media profiles (optional)"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    {...form.register("facebook")}
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...form.register("instagram")}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    {...form.register("linkedin")}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    {...form.register("youtube")}
                    placeholder="https://youtube.com/c/yourchannel"
                  />
                </div>
              </div>
            </div>

            {/* Declaration Section - Only for licensed brokers */}
            {isLicensed && (
              <div>
                <FormSectionTitle
                  title="Declarations"
                  icon={<Scale className="h-5 w-5" />}
                  description="Please answer the following declarations"
                />

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">
                      Have you ever been subject to regulatory review or disciplinary action?
                    </Label>
                    <div className="mt-2">
                      <SwitcherBox
                        id="declarationRegulatoryReview"
                        name="declarationRegulatoryReview"
                        checked={watchedValues.declarationRegulatoryReview === true}
                        onChange={(checked) => setValue('declarationRegulatoryReview', checked)}
                        yesno={true}
                      />
                    </div>
                    {watchedValues.declarationRegulatoryReview === true && (
                      <div className="mt-4">
                        <Label htmlFor="declarationRegulatoryReviewDetails">
                          Please provide details <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="declarationRegulatoryReviewDetails"
                          {...form.register("declarationRegulatoryReviewDetails")}
                          placeholder="Please provide details..."
                          className="min-h-[80px]"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-medium">
                      Have you ever had client complaints filed against you?
                    </Label>
                    <div className="mt-2">
                      <SwitcherBox
                        id="declarationClientComplaints"
                        name="declarationClientComplaints"
                        checked={watchedValues.declarationClientComplaints === true}
                        onChange={(checked) => setValue('declarationClientComplaints', checked)}
                        yesno={true}
                      />
                    </div>
                    {watchedValues.declarationClientComplaints === true && (
                      <div className="mt-4">
                        <Label htmlFor="declarationClientComplaintsDetails">
                          Please provide details <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="declarationClientComplaintsDetails"
                          {...form.register("declarationClientComplaintsDetails")}
                          placeholder="Please provide details..."
                          className="min-h-[80px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Signature Section */}
            <div>
              <FormSectionTitle
                title="Signature"
                icon={<FileText className="h-5 w-5" />}
                description="Please sign to confirm the information above"
              />

              <SignatureCapture
                value={watchedValues.signature}
                onSignatureChange={(signature) => setValue('signature', signature || '')}
                required={true}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Information"}
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
