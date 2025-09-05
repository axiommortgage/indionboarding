"use client";

import * as React from "react";
import { CreditCard, FileText, Upload, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { SwitcherBox } from "@/shared/ui/switcher-box";
import { usePaymentAuthForm } from "../hooks/use-payment-auth-form";

export function PaymentAuthorizationForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    files,
    fileSizeMessage,
    isLicensed,
    hasSignature,
    isFormComplete,
    handleAccountTypeChange,
    handleFileSelect,
    handleFileDrop,
    handlePayrollRequiredChange,
    handleSubmit,
  } = usePaymentAuthForm();

  const { setValue } = form;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payroll Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Payroll Section */}
            <div>
              <FormSectionTitle
                title="Payroll"
                icon={<CreditCard className="h-5 w-5" />}
                description="Configure your payroll preferences"
              />

              {/* Licensed broker information */}
              {isLicensed && (
                <div className="space-y-4 mb-6">
                  <p className="text-sm text-gray-600">
                    This Payment Authorization form authorizes Indi Mortgage to deduct expenses (owing) directly
                    from your bank account in the event you do not have the available funds in your payroll account
                    for 2 consecutive months.
                  </p>
                  <p className="text-sm text-gray-600">
                    ie. If you do not have active payroll over a 2 month period, the expenses outstanding will be
                    deducted directly from your chequing or savings account.
                  </p>
                  <p className="text-sm text-gray-600">
                    Detailed pay statements outlining expenses can be found by logging into your payroll and
                    selecting Commissions.
                  </p>
                </div>
              )}

              {/* Payroll Required Question */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Do you require payroll? <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-6">
                  <SwitcherBox
                    id="payrollRequiredYes"
                    name="payrollRequired"
                    checked={watchedValues.payrollRequired === true}
                    onChange={(checked) => handlePayrollRequiredChange(checked)}
                    label="Yes"
                    yesno={false}
                  />
                  <SwitcherBox
                    id="payrollRequiredNo"
                    name="payrollRequiredNo"
                    checked={watchedValues.payrollRequiredNo === true}
                    onChange={(checked) => handlePayrollRequiredChange(!checked)}
                    label="No"
                    yesno={false}
                  />
                </div>
              </div>

              {/* Authorization Text for Licensed Brokers */}
              {isLicensed && watchedValues.payrollRequired && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    By signing below you are agreeing to payment of your owed expenses by debit to the account shown.
                  </p>
                </div>
              )}
            </div>

            {/* Bank Account Information - Only show if payroll is required */}
            {watchedValues.payrollRequired && (
              <div className="space-y-6">
                <FormSectionTitle
                  title="Bank Account Information"
                  description="Provide your bank account details for payroll"
                />

                {/* Broker Name */}
                <div>
                  <Label htmlFor="brokerName">
                    I <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="brokerName"
                    {...form.register("brokerName")}
                    placeholder="Account holder name"
                    className={errors.brokerName ? "border-red-500" : ""}
                  />
                  {errors.brokerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.brokerName.message}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    authorize Indi Mortgage to charge my bank account as indicated below:
                  </p>
                </div>

                {/* Account Type Selection */}
                <div>
                  <Label className="text-base font-medium">
                    Account Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="chequingAccount"
                        checked={watchedValues.chequingAccount}
                        onCheckedChange={(checked) => handleAccountTypeChange('chequing', checked as boolean)}
                      />
                      <Label htmlFor="chequingAccount">Chequing Account</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="savingsAccount"
                        checked={watchedValues.savingsAccount}
                        onCheckedChange={(checked) => handleAccountTypeChange('savings', checked as boolean)}
                      />
                      <Label htmlFor="savingsAccount">Savings Account</Label>
                    </div>
                  </div>
                </div>

                {/* Company Account Question */}
                <div>
                  <Label className="text-base font-medium">
                    Are you being paid in a company account?
                  </Label>
                  <div className="mt-2">
                    <SwitcherBox
                      id="companyAccount"
                      name="companyAccount"
                      checked={watchedValues.companyAccount === true}
                      onChange={(checked) => setValue('companyAccount', checked)}
                      yesno={true}
                    />
                  </div>
                </div>

                {/* Articles of Incorporation Upload - Only show if company account */}
                {watchedValues.companyAccount && (
                  <div>
                    <Label className="text-base font-medium">
                      Please upload a copy of your articles of incorporation below <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors ${
                        errors.articlesOfIncorporation ? "border-red-500" : ""
                      }`}
                      onDrop={handleFileDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById('articlesOfIncorporation')?.click()}
                    >
                      <input
                        id="articlesOfIncorporation"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        accept=".pdf,.doc,.docx"
                      />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      {files.articlesOfIncorporation ? (
                        <p className="text-sm text-gray-600">{files.articlesOfIncorporation.name}</p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Drag/drop your file here or click to choose it.
                        </p>
                      )}
                    </div>
                    {fileSizeMessage.isVisible && (
                      <p className="text-red-500 text-sm mt-1">{fileSizeMessage.message}</p>
                    )}
                  </div>
                )}

                {/* Business Number - Only show if company account */}
                {watchedValues.companyAccount && (
                  <div>
                    <Label htmlFor="businessNumber">
                      Full Business Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessNumber"
                      {...form.register("businessNumber")}
                      placeholder="Business number"
                      className={errors.businessNumber ? "border-red-500" : ""}
                    />
                    {errors.businessNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessNumber.message}</p>
                    )}
                  </div>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthdate">
                      Birth Date <span className="text-red-500">*</span>
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
                    <Input
                      id="sin"
                      {...form.register("sin")}
                      placeholder="Social Insurance Number"
                      className={errors.sin ? "border-red-500" : ""}
                    />
                    {errors.sin && (
                      <p className="text-red-500 text-sm mt-1">{errors.sin.message}</p>
                    )}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nameOnAccount">
                      Name On Account <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nameOnAccount"
                      {...form.register("nameOnAccount")}
                      placeholder="Name on account"
                      className={errors.nameOnAccount ? "border-red-500" : ""}
                    />
                    {errors.nameOnAccount && (
                      <p className="text-red-500 text-sm mt-1">{errors.nameOnAccount.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bankName">
                      Bank Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bankName"
                      {...form.register("bankName")}
                      placeholder="Bank name"
                      className={errors.bankName ? "border-red-500" : ""}
                    />
                    {errors.bankName && (
                      <p className="text-red-500 text-sm mt-1">{errors.bankName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transitNumber">
                        Transit Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="transitNumber"
                        {...form.register("transitNumber")}
                        placeholder="Transit number"
                        className={errors.transitNumber ? "border-red-500" : ""}
                      />
                      {errors.transitNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.transitNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="institutionNumber">
                        Institution Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="institutionNumber"
                        {...form.register("institutionNumber")}
                        placeholder="Institution number"
                        className={errors.institutionNumber ? "border-red-500" : ""}
                      />
                      {errors.institutionNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.institutionNumber.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accountNumber">
                      Account Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accountNumber"
                      {...form.register("accountNumber")}
                      placeholder="Account number"
                      className={errors.accountNumber ? "border-red-500" : ""}
                    />
                    {errors.accountNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.accountNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bankAddress">
                      Bank Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bankAddress"
                      {...form.register("bankAddress")}
                      placeholder="Please include City and Postal Code"
                      className={errors.bankAddress ? "border-red-500" : ""}
                    />
                    {errors.bankAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.bankAddress.message}</p>
                    )}
                  </div>
                </div>

                {/* Payment Information Image */}
                <div className="flex justify-center">
                  <img
                    src="/images/payment-info.png"
                    alt="Payment information"
                    className="max-w-full h-auto"
                  />
                </div>

                {/* Credit Card Expenses - Only for licensed brokers */}
                {isLicensed && (
                  <div>
                    <Label className="text-base font-medium">
                      Should you wish outstanding expenses to be collected via credit card?
                    </Label>
                    <div className="mt-2">
                      <SwitcherBox
                        id="creditCardExpenses"
                        name="creditCardExpenses"
                        checked={watchedValues.creditCardExpenses === true}
                        onChange={(checked) => setValue('creditCardExpenses', checked)}
                        yesno={true}
                      />
                    </div>
                  </div>
                )}

                {/* Credit Card Form Download - Only if credit card expenses is selected */}
                {watchedValues.creditCardExpenses && (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Download credit card authorization form
                        window.open('/documents/credit-card-authorization-form.pdf', '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Credit Card Authorization Form
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Signature Section - Only show if payroll is required */}
            {watchedValues.payrollRequired && (
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
            )}

            {/* Legal Text for Licensed Brokers */}
            {isLicensed && watchedValues.payrollRequired && (
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  I understand that this authorization will remain in effect until I cancel it in writing, and I agree
                  to notify Indi Mortgage in writing of any changes in my account information. Funds owed to Indi
                  Mortgage will remain the responsibility of the above noted signator regardless of employment status.
                  NSF charges of $35 will apply if the funds owed cannot be debited from the account provided. If the
                  funds cannot be taken via authorized debit as set forth above, alternate payment arrangements must
                  be made (in writing). Indi Mortgage maintains the right to withhold the entire amount owing from any
                  future/outstanding commissions payable to the signator.
                </p>
                <p>
                  Should you wish outstanding expenses to be collected via credit card, please select yes below and
                  download our credit card authorization form. We will not use this credit card information without
                  prior notification. Your credit card can also be used with your consent for new licensing
                  activities, license renewals or future company events or activities again, with your consent.
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Payment Authorization"}
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
