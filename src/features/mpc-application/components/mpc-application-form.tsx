"use client";

import * as React from "react";
import { User, MapPin, Scale, FileText, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { SwitcherBox } from "@/shared/ui/switcher-box";
import { AddressSelect } from "@/shared/ui/address-select";
import { PhoneInput } from "@/shared/ui/masked-inputs";
import { useMpcApplicationForm } from "../hooks/use-mpc-application-form";

export function MpcApplicationForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    branches,
    showDeclarationDetails,
    showJudgementUpload,
    handleBranchSelect,
    handleSubmit,
  } = useMpcApplicationForm();

  const { setValue } = form;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            MPC Membership Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mortgage Professionals Canada Information */}
            <div>
              <FormSectionTitle
                title="Mortgage Professionals Canada"
                icon={<FileText className="h-5 w-5" />}
              />

              <div className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                  <li>Represents Canada's mortgage industry</li>
                  <li>Supports professional excellence through the Accredited Mortgage Professional (AMP) designation</li>
                  <li>Publishes a variety of industry publications covering in depth news and information</li>
                  <li>Delivers comprehensive professional development courses</li>
                  <li>Provides timely and relevant industry research</li>
                </ul>
              </div>
            </div>

            {/* Member Services */}
            <div>
              <FormSectionTitle
                title="Member Services"
                icon={<FileText className="h-5 w-5" />}
              />

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-semibold">Professional Accreditation</h3>
                  <p>Accredited Mortgage Professional (AMP) - Canada's national designation for mortgage professionals, supported by extensive advertising (available to members only).</p>
                </div>
                <div>
                  <h3 className="font-semibold">Client Reach</h3>
                  <p>Connecting members with mortgage consumers through a variety of channels</p>
                </div>
                <div>
                  <h3 className="font-semibold">A voice with Government and Regulators</h3>
                  <p>Representing members' interests and providing updates on relevant and regulatory changes</p>
                </div>
                <div>
                  <h3 className="font-semibold">Errors and Omissions Insurance (E & O)</h3>
                  <p>The premier E & O insurance policy for mortgage brokers</p>
                </div>
                <div>
                  <h3 className="font-semibold">Resources</h3>
                  <p>Providing timely industry statistics, publications and research reports</p>
                </div>
                <div>
                  <h3 className="font-semibold">Benefits Program</h3>
                  <p>Discounts on a variety of products and services</p>
                </div>
              </div>
            </div>

            {/* Individual Information */}
            <div>
              <FormSectionTitle
                title="Individual Information"
                icon={<User className="h-5 w-5" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstname">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstname"
                    {...form.register("firstname")}
                    placeholder="First Name"
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
                    placeholder="Middle Name"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="preferredName">Conversational Name</Label>
                  <Input
                    id="preferredName"
                    {...form.register("preferredName")}
                    placeholder="Conversational Name"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Your Website</Label>
                  <Input
                    id="website"
                    {...form.register("website")}
                    placeholder="https://yoursite.ca"
                  />
                </div>

                <div>
                  <Label htmlFor="workEmail">
                    Preferred Email Contact <span className="text-red-500">*</span>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="alternateEmail">Alternate Email</Label>
                  <Input
                    id="alternateEmail"
                    type="email"
                    {...form.register("alternateEmail")}
                    placeholder="johndoe@indimortgage.ca"
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
            </div>

            {/* Mailing Address */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address">
                    Mailing Address (Street) <span className="text-red-500">*</span>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="province">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue('province', value)}>
                    <SelectTrigger className={errors.province ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alberta">Alberta</SelectItem>
                      <SelectItem value="british columbia">British Columbia</SelectItem>
                      <SelectItem value="manitoba">Manitoba</SelectItem>
                      <SelectItem value="new brunswick">New Brunswick</SelectItem>
                      <SelectItem value="newfoundland and labrador">Newfoundland And Labrador</SelectItem>
                      <SelectItem value="northwest territories">Northwest Territories</SelectItem>
                      <SelectItem value="nova scotia">Nova Scotia</SelectItem>
                      <SelectItem value="nunavut">Nunavut</SelectItem>
                      <SelectItem value="ontario">Ontario</SelectItem>
                      <SelectItem value="prince edward island">Prince Edward Island</SelectItem>
                      <SelectItem value="quebec">Quebec</SelectItem>
                      <SelectItem value="saskatchewan">Saskatchewan</SelectItem>
                      <SelectItem value="yukon">Yukon</SelectItem>
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <Label htmlFor="workPhone">
                    Preferred Phone Contact <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    id="workPhone"
                    name="workPhone"
                    placeholder="999-888-7777"
                    value={watchedValues.workPhone || ''}
                    onChange={(e) => setValue('workPhone', e.target.value)}
                    className={errors.workPhone ? "border-red-500" : ""}
                  />
                  {errors.workPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.workPhone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cellPhone">Cell Phone</Label>
                  <PhoneInput
                    id="cellPhone"
                    name="cellPhone"
                    placeholder="999-888-7777"
                    value={watchedValues.cellPhone || ''}
                    onChange={(e) => setValue('cellPhone', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tollfree">Tollfree Phone</Label>
                  <PhoneInput
                    id="tollfree"
                    name="tollfree"
                    placeholder="999-888-7777"
                    value={watchedValues.tollfree || ''}
                    onChange={(e) => setValue('tollfree', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <PhoneInput
                    id="fax"
                    name="fax"
                    placeholder="999-888-7777"
                    value={watchedValues.fax || ''}
                    onChange={(e) => setValue('fax', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Office Location */}
            <div>
              <FormSectionTitle
                title="Office Location"
                icon={<MapPin className="h-5 w-5" />}
                description="To appear on the Consumer Online Directory"
              />

              <div className="mb-4">
                <AddressSelect
                  branches={branches}
                  onAddressSelect={handleBranchSelect}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="officeAddress">
                    Office Address (Street) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="officeAddress"
                    {...form.register("officeAddress")}
                    placeholder="223 14 Street NW"
                    className={errors.officeAddress ? "border-red-500" : ""}
                  />
                  {errors.officeAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.officeAddress.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="officeSuiteUnit">Office Suite/Unit</Label>
                  <Input
                    id="officeSuiteUnit"
                    {...form.register("officeSuiteUnit")}
                    placeholder="office Suite/unit"
                  />
                </div>

                <div>
                  <Label htmlFor="officeCity">
                    Office City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="officeCity"
                    {...form.register("officeCity")}
                    placeholder="Calgary"
                    className={errors.officeCity ? "border-red-500" : ""}
                  />
                  {errors.officeCity && (
                    <p className="text-red-500 text-sm mt-1">{errors.officeCity.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="officeProvince">
                    Office Province <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue('officeProvince', value)}>
                    <SelectTrigger className={errors.officeProvince ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alberta">Alberta</SelectItem>
                      <SelectItem value="british columbia">British Columbia</SelectItem>
                      <SelectItem value="manitoba">Manitoba</SelectItem>
                      <SelectItem value="new brunswick">New Brunswick</SelectItem>
                      <SelectItem value="newfoundland and labrador">Newfoundland And Labrador</SelectItem>
                      <SelectItem value="northwest territories">Northwest Territories</SelectItem>
                      <SelectItem value="nova scotia">Nova Scotia</SelectItem>
                      <SelectItem value="nunavut">Nunavut</SelectItem>
                      <SelectItem value="ontario">Ontario</SelectItem>
                      <SelectItem value="prince edward island">Prince Edward Island</SelectItem>
                      <SelectItem value="quebec">Quebec</SelectItem>
                      <SelectItem value="saskatchewan">Saskatchewan</SelectItem>
                      <SelectItem value="yukon">Yukon</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.officeProvince && (
                    <p className="text-red-500 text-sm mt-1">{errors.officeProvince.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="officePostalCode">
                    Office Postal Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="officePostalCode"
                    {...form.register("officePostalCode")}
                    placeholder="T2N 1Z6"
                    className={errors.officePostalCode ? "border-red-500" : ""}
                  />
                  {errors.officePostalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.officePostalCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="officeWebsite">Office Website</Label>
                  <Input
                    id="officeWebsite"
                    {...form.register("officeWebsite")}
                    placeholder="https://officesite.ca"
                  />
                </div>
              </div>
            </div>

            {/* Declarations */}
            <div>
              <FormSectionTitle
                title="Declarations"
                icon={<Scale className="h-5 w-5" />}
              />

              <div className="space-y-6">
                <h2 className="text-lg font-semibold">
                  Individual Declaration <span className="text-red-500">*</span>
                </h2>

                {/* Criminal Offense Declaration */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Have you ever been charged with, convicted of or pardoned of a criminal offence?
                  </Label>
                  <div className="flex gap-6">
                    <SwitcherBox
                      id="declarationCriminalOffenseYes"
                      name="declarationCriminalOffense"
                      checked={watchedValues.declarationCriminalOffense === true}
                      onChange={(checked) => setValue('declarationCriminalOffense', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="declarationCriminalOffenseNo"
                      name="declarationCriminalOffense"
                      checked={watchedValues.declarationCriminalOffense === false}
                      onChange={(checked) => setValue('declarationCriminalOffense', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {/* Fraud Declaration */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Are there any civil judgments or actions against you or has judgment ever been entered against you in an action involving fraud? If so, attach a copy of the judgment or action.
                  </Label>
                  <div className="flex gap-6">
                    <SwitcherBox
                      id="declarationFraudYes"
                      name="declarationFraud"
                      checked={watchedValues.declarationFraud === true}
                      onChange={(checked) => setValue('declarationFraud', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="declarationFraudNo"
                      name="declarationFraud"
                      checked={watchedValues.declarationFraud === false}
                      onChange={(checked) => setValue('declarationFraud', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {/* Suspended Declaration */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Have you ever been disciplined, suspended or expelled as a member of any professional organization?
                  </Label>
                  <div className="flex gap-6">
                    <SwitcherBox
                      id="declarationSuspendedYes"
                      name="declarationSuspended"
                      checked={watchedValues.declarationSuspended === true}
                      onChange={(checked) => setValue('declarationSuspended', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="declarationSuspendedNo"
                      name="declarationSuspended"
                      checked={watchedValues.declarationSuspended === false}
                      onChange={(checked) => setValue('declarationSuspended', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {/* License Denied Declaration */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Have you ever been denied a license or permit, or had any license or permit revoked, for failure to meet good character requirements?
                  </Label>
                  <div className="flex gap-6">
                    <SwitcherBox
                      id="declarationLicenseDeniedYes"
                      name="declarationLicenseDenied"
                      checked={watchedValues.declarationLicenseDenied === true}
                      onChange={(checked) => setValue('declarationLicenseDenied', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="declarationLicenseDeniedNo"
                      name="declarationLicenseDenied"
                      checked={watchedValues.declarationLicenseDenied === false}
                      onChange={(checked) => setValue('declarationLicenseDenied', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {/* Bankruptcy Declaration */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Are you currently subject to a petition or assignment in bankruptcy or a proposal to creditors under the Bankruptcy and Insolvency Act, or have you ever been bankrupt or insolvent, under any statute?
                  </Label>
                  <div className="flex gap-6">
                    <SwitcherBox
                      id="declarationBankruptcyYes"
                      name="declarationBankruptcy"
                      checked={watchedValues.declarationBankruptcy === true}
                      onChange={(checked) => setValue('declarationBankruptcy', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="declarationBankruptcyNo"
                      name="declarationBankruptcy"
                      checked={watchedValues.declarationBankruptcy === false}
                      onChange={(checked) => setValue('declarationBankruptcy', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {/* Judgement Action File Upload - Only show if fraud declaration is Yes */}
                {showJudgementUpload && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Please attach a copy of the judgement or action.</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="judgementAction" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Drag/drop your file here or click to choose it.
                          </span>
                        </Label>
                        <Input
                          id="judgementAction"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          {...form.register("judgementAction")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Declaration Details - Only show if any declaration is Yes */}
                {showDeclarationDetails && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">If you answered yes to any of the above questions, please provide full details below.</h3>
                    <div>
                      <Label htmlFor="declarationDetails">
                        Declaration details <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="declarationDetails"
                        {...form.register("declarationDetails")}
                        placeholder="Please provide full details..."
                        className={errors.declarationDetails ? "border-red-500" : ""}
                        rows={4}
                      />
                      {errors.declarationDetails && (
                        <p className="text-red-500 text-sm mt-1">{errors.declarationDetails.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agreement Text */}
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                I agree to abide by any best practices or professional standards of Mortgage Professionals Canada that may be in place from time to time. I agree to abide by the Mortgage Professionals Canada Bylaws, including its Code of Ethics ("Code") set out therein, and the policies of Mortgage Professionals Canada in place from time to time, and acknowledge having received and read a copy of the current Mortgage Professionals Canada Bylaw. I understand and agree that, if accused of a violation of the Code, I will be subject to the Mortgage Professionals Canada ethics process and penalties, which may include publication of my name.
              </p>
              <p>
                I declare that the statements made herein are for the purpose of qualifying as a member of Mortgage Professionals Canada and are true and correct. I understand and acknowledge that the statements made herein are being relied upon by Mortgage Professionals Canada, in its sole discretion, to approve my application for membership in Mortgage Professionals Canada. I hereby authorize Mortgage Professionals Canada to make all inquiries necessary to verify the accuracy of statements made herein and consent to the collection, use and disclosure of any of my personal information that Mortgage Professionals Canada deems relevant in order to approve my application for membership. I authorize my employer to pay the initial membership fee, all applicable renewal membership fees for me and to provide information updates on me to Mortgage Professionals Canada. Mortgage Professionals Canada reserves the right in its sole discretion to require the membership applicant to provide a criminal record check upon written request.
              </p>
            </div>

            {/* Signature */}
            <div>
              <FormSectionTitle
                title="Applicant Declaration Signature"
                icon={<FileText className="h-5 w-5" />}
                description="Please sign to confirm your application"
              />

              <SignatureCapture
                value={watchedValues.applicantDeclarationSignature}
                onSignatureChange={(signature) => setValue('applicantDeclarationSignature', signature || '')}
                required={true}
              />
              {errors.applicantDeclarationSignature && (
                <p className="text-red-500 text-sm mt-2">{errors.applicantDeclarationSignature.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save MPC Application"}
              </Button>
            </div>

            <NextPrevFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}