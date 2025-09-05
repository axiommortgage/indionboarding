"use client";

import * as React from "react";
import { Globe, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { SwitcherBox } from "@/shared/ui/switcher-box";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useWebsiteInfoForm } from "../hooks/use-website-info-form";

export function WebsiteInformationForm() {
  const {
    form,
    watchedValues,
    errors,
    isLoading,
    handleDomainTypeChange,
    addPriorWebsite,
    removePriorWebsite,
    updatePriorWebsite,
    handleSubmit,
  } = useWebsiteInfoForm();

  const { setValue } = form;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Indi Website Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Indi Website & Domain Section */}
            <div>
              <FormSectionTitle
                title="Indi Website & Domain"
                icon={<Globe className="h-5 w-5" />}
                description="Configure your Indi website preferences"
              />

              <div className="space-y-6">
                {/* Website Opt-in */}
                <div>
                  <Label className="text-base font-medium">
                    Do you want an Indi Website? <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-6 mt-2">
                    <SwitcherBox
                      id="websiteOptInYes"
                      name="websiteOptIn"
                      checked={watchedValues.websiteOptIn === true}
                      onChange={(checked) => setValue('websiteOptIn', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="websiteOptInNo"
                      name="websiteOptIn"
                      checked={watchedValues.websiteOptIn === false}
                      onChange={(checked) => setValue('websiteOptIn', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {/* Domain Type Selection - Only show if websiteOptIn is true */}
                {watchedValues.websiteOptIn === true && (
                  <div>
                    <Label className="text-base font-medium">
                      Which kind website address (domain name) would you like to use on your Indi Website?
                    </Label>
                    <div className="flex gap-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ownDomain"
                          checked={watchedValues.ownDomain}
                          onCheckedChange={(checked) => handleDomainTypeChange('own', checked as boolean)}
                        />
                        <Label htmlFor="ownDomain">My Own Domain</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="providedDomain"
                          checked={watchedValues.providedDomain}
                          onCheckedChange={(checked) => handleDomainTypeChange('provided', checked as boolean)}
                        />
                        <Label htmlFor="providedDomain">A Domain Provided By Indi</Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Own Domain Details - Only show if ownDomain is selected */}
                {watchedValues.ownDomain && watchedValues.websiteOptIn === true && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="websiteDomainName">What is your domain name?</Label>
                        <Input
                          id="websiteDomainName"
                          {...form.register("websiteDomainName")}
                          placeholder="www.myname.ca"
                        />
                      </div>

                      <div>
                        <Label htmlFor="websiteDomainRegistrar">Where is it registered?</Label>
                        <Select
                          value={watchedValues.websiteDomainRegistrar}
                          onValueChange={(value) => setValue('websiteDomainRegistrar', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select registrar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Select">Select</SelectItem>
                            <SelectItem value="GoDaddy">GoDaddy</SelectItem>
                            <SelectItem value="Namecheap">Namecheap</SelectItem>
                            <SelectItem value="Reg.ca">Reg.ca</SelectItem>
                            <SelectItem value="Rebel">Rebel</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>
                          In order to point your domain to your new Indi website, our IT team will need to have access
                          to your domain to change your domain DNS Records. Please check the{' '}
                          <a href="/tutorials/giving-domain-access" target="_blank" className="underline">
                            Giving Domain Access
                          </a>{' '}
                          tutorial.
                        </strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prior Websites Section */}
            <div>
              <FormSectionTitle
                title="Prior Websites"
                icon={<Globe className="h-5 w-5" />}
                description="Information about your existing mortgage-related websites"
              />

              <div className="space-y-6">
                {/* Prior Website Question */}
                <div>
                  <Label className="text-base font-medium">
                    Do you have any existing mortgage related websites? Please list all domains below? <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-6 mt-2">
                    <SwitcherBox
                      id="priorWebsiteYes"
                      name="priorWebsite"
                      checked={watchedValues.priorWebsite === true}
                      onChange={(checked) => setValue('priorWebsite', checked ? true : undefined)}
                      label="Yes"
                      yesno={false}
                    />
                    <SwitcherBox
                      id="priorWebsiteNo"
                      name="priorWebsite"
                      checked={watchedValues.priorWebsite === false}
                      onChange={(checked) => setValue('priorWebsite', checked ? false : undefined)}
                      label="No"
                      yesno={false}
                    />
                  </div>
                </div>

                {/* Prior Websites List - Only show if priorWebsite is true */}
                {watchedValues.priorWebsite === true && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">What are the websites domains?</h3>

                    {(watchedValues.priorWebsitesUse || []).map((website, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`domain-${index}`}>
                              Domain <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`domain-${index}`}
                              value={website.domain}
                              onChange={(e) => updatePriorWebsite(index, 'domain', e.target.value)}
                              placeholder="www.myname.ca"
                            />
                          </div>

                          <div>
                            <Label className="text-base font-medium">
                              Keep in use? <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-4 mt-2">
                              <SwitcherBox
                                id={`keepInUse-${index}-yes`}
                                name={`keepInUse-${index}`}
                                checked={website.keepInUse === true}
                                onChange={(checked) => updatePriorWebsite(index, 'keepInUse', checked ? true : undefined)}
                                label="Yes"
                                yesno={false}
                              />
                              <SwitcherBox
                                id={`keepInUse-${index}-no`}
                                name={`keepInUse-${index}`}
                                checked={website.keepInUse === false}
                                onChange={(checked) => updatePriorWebsite(index, 'keepInUse', checked ? false : undefined)}
                                label="No"
                                yesno={false}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-base font-medium">
                              Redirect to your Indi website? <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-4 mt-2">
                              <SwitcherBox
                                id={`redirect-${index}-yes`}
                                name={`redirect-${index}`}
                                checked={website.redirect === true}
                                onChange={(checked) => updatePriorWebsite(index, 'redirect', checked ? true : undefined)}
                                label="Yes"
                                yesno={false}
                              />
                              <SwitcherBox
                                id={`redirect-${index}-no`}
                                name={`redirect-${index}`}
                                checked={website.redirect === false}
                                onChange={(checked) => updatePriorWebsite(index, 'redirect', checked ? false : undefined)}
                                label="No"
                                yesno={false}
                              />
                            </div>
                            {watchedValues.websiteOptIn === false && (
                              <p className="text-red-500 text-xs mt-1">
                                <strong>It is not possible to redirect while you are not using an Indi WebSite.</strong>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePriorWebsite(index)}
                          >
                            Remove Domain
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPriorWebsite}
                    >
                      Add Domain
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Website Information"}
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
