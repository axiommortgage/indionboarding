"use client";

import * as React from "react";
import { FileText, Download, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useLetterOfDirectionForm } from "../hooks/use-letter-of-direction-form";

export function LetterOfDirectionForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    iframeWidth,
    localMortgageSoftware,
    otherMtgSoftware,
    localOtherMortgageSoftware,
    handleMortgageSoftwareChange,
    handleOtherMortgageSoftwareChange,
    getPdfLink,
    isFormComplete,
    handleSubmit,
  } = useLetterOfDirectionForm();

  const { setValue } = form;

  // Determine the current mortgage software selection
  const currentSelection = localMortgageSoftware || watchedValues.mortgageSoftware;
  
  // State to track if user has made an initial selection
  const [hasInitialSelection, setHasInitialSelection] = React.useState(
    Boolean(currentSelection && currentSelection !== 'Select')
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Letter Of Direction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mortgage Software Selection - Always visible */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {hasInitialSelection 
                  ? "Change your mortgage software platform to view a different letter of direction:"
                  : "Please select your mortgage software platform to view the correct letter of direction:"
                }
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mortgageSoftware">Mortgage Software Platform</Label>
                  <Select
                    value={localMortgageSoftware}
                    onValueChange={(value) => {
                      handleMortgageSoftwareChange(value);
                      setHasInitialSelection(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Expert">Expert</SelectItem>
                      <SelectItem value="ExpertPro">ExpertPro</SelectItem>
                      <SelectItem value="Finmo">Finmo</SelectItem>
                      <SelectItem value="Scarlett">Scarlett</SelectItem>
                      <SelectItem value="Velocity">Velocity</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="None">I do not use mortgage software</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {otherMtgSoftware && (
                  <div>
                    <Label htmlFor="otherMortgageSoftware">Please specify:</Label>
                    <Input
                      id="otherMortgageSoftware"
                      placeholder="Enter your mortgage software"
                      value={localOtherMortgageSoftware}
                      onChange={(e) => handleOtherMortgageSoftwareChange(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div>
              {/* Check if user selected "None" (doesn't use mortgage software) */}
              {currentSelection === 'None' ? (
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center mb-8">
                  <h3 className="text-lg font-medium text-yellow-800 mb-4">No Letter of Direction Required</h3>
                  <p className="text-yellow-700">
                    Since you do not use mortgage software, no letter of direction is needed. Please click on{' '}
                    <strong>"Not Required"</strong> and proceed to next steps.
                  </p>
                </div>
              ) : (
                (() => {
                  // Show "Please select" message only if no selection or "Select" is chosen
                  if (!currentSelection || currentSelection === 'Select' || currentSelection === '') {
                    return (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center mb-8">
                        <h3 className="text-lg font-medium text-gray-600 mb-4">
                          Please Select Your Mortgage Software
                        </h3>
                        <p className="text-gray-600">
                          Select your mortgage software platform above to view the corresponding letter of direction.
                        </p>
                      </div>
                    );
                  }

                  // Hide iframe for "Other" selections
                  if (currentSelection === 'Other') {
                    return (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center mb-8">
                        <h3 className="text-lg font-medium text-gray-600 mb-4">
                          Custom Mortgage Software
                        </h3>
                        <p className="text-gray-600">
                          Since you use a custom mortgage software, please click on{' '}
                          <strong>"Not Required"</strong> and proceed to next steps.
                        </p>
                      </div>
                    );
                  }

                  // For valid selections (Expert, ExpertPro, Finmo, Velocity, Scarlett), show the PDF
                  const pdfUrl = getPdfLink();
                  return (
                    <div className="mb-8">
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Currently viewing:</strong> {currentSelection} Letter of Direction
                        </p>
                      </div>
                      <iframe
                        key={currentSelection} // Force re-render when selection changes
                        width={iframeWidth}
                        height="1200"
                        title={`Letter Of Direction - ${currentSelection}`}
                        src={pdfUrl}
                        className="w-full border rounded-lg"
                      />
                    </div>
                  );
                })()
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              {/* Only show transfer message if user actually uses mortgage software and it's not "Other" */}
              {currentSelection !== 'None' &&
                currentSelection !== 'Other' &&
                currentSelection !== 'Select' &&
                currentSelection !== '' && (
                  <p className="text-gray-700">
                    This form is required to be signed by your existing Broker of Record at your current brokerage.
                    Please download the form should you wish to have your existing{' '}
                    {currentSelection === 'ExpertPro' ? 'Expert' : currentSelection} data transferred. 
                    Once signed by the existing Broker of Record please return to{' '}
                    <strong>matt.brownlow@indimortgage.ca</strong>.
                  </p>
                )}
              
              <p className="text-gray-700">
                {currentSelection === 'None' || currentSelection === 'Other'
                  ? 'Please click on "Not Required" and proceed to next steps.'
                  : 'Otherwise please click on "Not Required" and proceed to next steps.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Download letter of direction
                  const pdfUrl = getPdfLink();
                  if (pdfUrl) {
                    window.open(pdfUrl, '_blank');
                  }
                }}
                disabled={!currentSelection || currentSelection === 'Select' || currentSelection === 'None' || currentSelection === 'Other'}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Letter of Direction
              </Button>
              
              <Button
                type="button"
                onClick={() => {
                  // Mark as not required and save
                  setValue('acknowledgement', true);
                  handleSubmit();
                }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Not Required
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