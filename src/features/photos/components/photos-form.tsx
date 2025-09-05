"use client";

import * as React from "react";
import { Camera, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { usePhotosForm } from "../hooks/use-photos-form";

export function PhotosForm() {
  const {
    form,
    watchedValues,
    isLoading,
    digitalPhotoPreview,
    printPhotoPreview,
    dragActive,
    files,
    handleFileSelect,
    handleDrag,
    handleDrop,
    handleFileInputChange,
    handleDefaultPhotoChange,
    handleSubmit,
  } = usePhotosForm();

  const { setValue } = form;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Digital and Print Photos - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Digital Photo Section */}
              <div className="w-full">
                <FormSectionTitle
                  title="Digital Photo"
                  icon={<Camera className="h-5 w-5" />}
                  description="Upload your professional headshot (required unless using default)"
                />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="digitalPhoto">
                      Digital Photo <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Image must be at least 500x500 pixels and less than 15MB (JPG or PNG format)
                    </p>

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive.digital
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      } ${watchedValues.useDefaultPhoto ? 'opacity-50 pointer-events-none' : ''}`}
                      onDragEnter={(e) => !watchedValues.useDefaultPhoto && handleDrag(e, 'digital')}
                      onDragLeave={(e) => !watchedValues.useDefaultPhoto && handleDrag(e, 'digital')}
                      onDragOver={(e) => !watchedValues.useDefaultPhoto && handleDrag(e, 'digital')}
                      onDrop={(e) => !watchedValues.useDefaultPhoto && handleDrop(e, 'digital')}
                    >
                      {digitalPhotoPreview ? (
                        <div className="space-y-4">
                          <img
                            src={digitalPhotoPreview}
                            alt="Digital photo preview"
                            className="w-32 h-32 object-cover rounded-lg border mx-auto"
                          />
                          <p className="text-sm text-muted-foreground">
                            Photo uploaded successfully
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setValue('photo', '');
                              setDigitalPhotoPreview(null);
                              setFiles(prev => ({ ...prev, digital: undefined }));
                            }}
                            disabled={watchedValues.useDefaultPhoto}
                          >
                            Remove Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-lg font-medium">Drop your photo here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                          </div>
                          <Input
                            id="digitalPhoto"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileInputChange(e, 'digital')}
                            className="hidden"
                            disabled={watchedValues.useDefaultPhoto}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('digitalPhoto')?.click()}
                            disabled={watchedValues.useDefaultPhoto}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Print Photo Section */}
              <div className="w-full">
                <FormSectionTitle
                  title="Print Photo"
                  icon={<Camera className="h-5 w-5" />}
                  description="Upload a high-quality photo for print materials (optional)"
                />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="printPhoto">Print Photo</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Image must be at least 500x500 pixels and less than 15MB (JPG or PNG format)
                    </p>

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive.print
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }`}
                      onDragEnter={(e) => handleDrag(e, 'print')}
                      onDragLeave={(e) => handleDrag(e, 'print')}
                      onDragOver={(e) => handleDrag(e, 'print')}
                      onDrop={(e) => handleDrop(e, 'print')}
                    >
                      {printPhotoPreview ? (
                        <div className="space-y-4">
                          <img
                            src={printPhotoPreview}
                            alt="Print photo preview"
                            className="w-32 h-32 object-cover rounded-lg border mx-auto"
                          />
                          <p className="text-sm text-muted-foreground">
                            Print photo uploaded successfully
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setValue('printPhoto', '');
                              setPrintPhotoPreview(null);
                              setFiles(prev => ({ ...prev, print: undefined }));
                            }}
                          >
                            Remove Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-lg font-medium">Drop your print photo here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                          </div>
                          <Input
                            id="printPhoto"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileInputChange(e, 'print')}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('printPhoto')?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Default Photo Option */}
            <div>
              <FormSectionTitle
                title="Default Photo Option"
                icon={<Camera className="h-5 w-5" />}
                description="Alternative to uploading your own photo"
              />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useDefaultPhoto"
                    checked={watchedValues.useDefaultPhoto}
                    onCheckedChange={handleDefaultPhotoChange}
                  />
                  <Label htmlFor="useDefaultPhoto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I don't have a photo right now. Please use the default image.
                  </Label>
                </div>

                {watchedValues.useDefaultPhoto && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      A default professional image will be used for your profile. You can upload your own photo later by unchecking this option.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Photos"}
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