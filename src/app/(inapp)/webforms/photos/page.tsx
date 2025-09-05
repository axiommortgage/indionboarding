"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

// Form validation schema
const photosSchema = z.object({
  photo: z.string().optional(), // Digital photo
  printPhoto: z.string().optional(), // Print photo
  useDefaultPhoto: z.boolean().default(false),
});

type PhotosFormData = z.infer<typeof photosSchema>;

export default function PhotosPage() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [digitalPhotoPreview, setDigitalPhotoPreview] = React.useState<string | null>(null);
  const [printPhotoPreview, setPrintPhotoPreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState({ digital: false, print: false });
  const [files, setFiles] = React.useState<{ digital?: File, print?: File }>({});

  const form = useForm<PhotosFormData>({
    resolver: zodResolver(photosSchema) as any,
    defaultValues: {
      photo: "",
      printPhoto: "",
      useDefaultPhoto: false,
    },
  });

  const { setValue, handleSubmit, watch } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.photos) {
      const formData = forms.photos;
      if (formData.photo) {
        setValue('photo', formData.photo);
        setDigitalPhotoPreview(formData.photo);
      }
      if (formData.printPhoto) {
        setValue('printPhoto', formData.printPhoto);
        setPrintPhotoPreview(formData.printPhoto);
      }
      if (formData.useDefaultPhoto !== undefined) {
        setValue('useDefaultPhoto', formData.useDefaultPhoto);
      }
    }
  }, [forms.photos, setValue]);

  // Validate image requirements
  const verifyImageRequirements = (file: File, type: 'digital' | 'print'): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Check minimum dimensions (500x500 pixels)
        if (width < 500 || height < 500) {
          toast.error(`Image must be at least 500x500 pixels. Current size: ${width}x${height} pixels.`);
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        toast.error('Unable to analyze image. Please ensure it is a valid image file.');
        resolve(false);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (file: File, type: 'digital' | 'print') => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG or PNG)');
      return;
    }

    // Validate file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB');
      return;
    }

    // Verify image requirements
    const isValid = await verifyImageRequirements(file, type);
    if (!isValid) return;

    // Store file and create preview
    setFiles(prev => ({ ...prev, [type]: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      if (type === 'digital') {
        setValue('photo', result);
        setDigitalPhotoPreview(result);
      } else {
        setValue('printPhoto', result);
        setPrintPhotoPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent, type: 'digital' | 'print') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, type: 'digital' | 'print') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], type);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'digital' | 'print') => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], type);
    }
  };

  // Handle default photo checkbox
  const handleDefaultPhotoChange = (checked: boolean) => {
    setValue('useDefaultPhoto', checked);
    if (checked) {
      // Clear digital photo when using default
      setValue('photo', '');
      setDigitalPhotoPreview(null);
      setFiles(prev => ({ ...prev, digital: undefined }));
    }
  };

  // Handle form submission
  const onSubmit = async (data: PhotosFormData) => {
    setIsLoading(true);
    try {
      // Validate that either a photo is uploaded or default photo is selected
      if (!data.useDefaultPhoto && !data.photo) {
        toast.error("Please upload a digital photo or select the default photo option");
        setIsLoading(false);
        return;
      }

      // Update form data in context
      updateForm('photos', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('photos');

      toast.success("Photos saved successfully!");
    } catch (error) {
      console.error("Error saving photos:", error);
      toast.error("Failed to save photos");
    } finally {
      setIsLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Digital Photo Section */}
            <div>
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
            <div>
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
