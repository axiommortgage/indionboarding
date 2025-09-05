"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Phone, MapPin, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { FormSectionTitle } from "@/shared/ui/form-section-title";
import { PhoneInput, SinInput } from "@/shared/ui/masked-inputs";
import { SwitcherBox } from "@/shared/ui/switcher-box";
import { SignatureCapture } from "@/shared/ui/signature-capture";
import { NextPrevFooter } from "@/shared/ui/next-prev-footer";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "@/shared/lib/toast";

// Form validation schema for unlicensed information
const unlicensedInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  sin: z.string().min(1, "SIN is required"),
  
  // Address fields
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  
  // Personal address fields
  personalAddress: z.string().min(1, "Personal address is required"),
  personalCity: z.string().min(1, "Personal city is required"),
  personalProvince: z.string().min(1, "Personal province is required"),
  personalPostalCode: z.string().min(1, "Personal postal code is required"),
  sameAddress: z.boolean().default(false),
  
  // Social media
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  
  // Bio
  bio: z.string().min(1, "Bio is required"),
  note: z.string().optional(),
  
  // Signature
  signature: z.string().optional(),
});

type UnlicensedInfoFormData = z.infer<typeof unlicensedInfoSchema>;

export default function UnlicensedInformationPage() {
  const { userAuth } = useAuthContext();
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [charCount, setCharCount] = React.useState({ bio: 0, note: 0 });

  const form = useForm<UnlicensedInfoFormData>({
    resolver: zodResolver(unlicensedInfoSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      sin: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      personalAddress: "",
      personalCity: "",
      personalProvince: "",
      personalPostalCode: "",
      sameAddress: false,
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      bio: "",
      note: "",
      signature: "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // Load existing form data
  React.useEffect(() => {
    if (forms.unlicensedInfo) {
      const formData = forms.unlicensedInfo;
      Object.keys(formData).forEach((key) => {
        if (key in watchedValues) {
          setValue(key as keyof UnlicensedInfoFormData, formData[key as keyof typeof formData] as any);
        }
      });
      
      if (formData.bio) {
        setCharCount(prev => ({ ...prev, bio: formData.bio?.length || 0 }));
      }
      if (formData.note) {
        setCharCount(prev => ({ ...prev, note: formData.note?.length || 0 }));
      }
    }
  }, [forms.unlicensedInfo, setValue]);

  // Handle form submission
  const onSubmit = async (data: UnlicensedInfoFormData) => {
    setIsLoading(true);
    try {
      // Update form data in context
      updateForm('unlicensedInfo', {
        ...data,
        isFormComplete: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to backend
      await saveForm('unlicensedInfo');
      
      toast.success("Unlicensed information saved successfully!");
    } catch (error) {
      console.error("Error saving unlicensed information:", error);
      toast.error("Failed to save unlicensed information");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle character counts
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharCount(prev => ({ ...prev, bio: value.length }));
    setValue('bio', value);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharCount(prev => ({ ...prev, note: value.length }));
    setValue('note', value);
  };

  // Handle same address toggle
  const handleSameAddressChange = (checked: boolean) => {
    setValue('sameAddress', checked);
    if (checked) {
      setValue('personalAddress', watchedValues.address);
      setValue('personalCity', watchedValues.city);
      setValue('personalProvince', watchedValues.province);
      setValue('personalPostalCode', watchedValues.postalCode);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Unlicensed Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <FormSectionTitle
                title="Personal Information"
                icon={<User className="h-5 w-5" />}
                description="Please provide your personal details"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="your.email@example.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    id="phone"
                    value={watchedValues.phone}
                    onChange={(e) => setValue('phone', e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
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

              <div className="mt-4">
                <Label htmlFor="note">Additional Notes</Label>
                <Textarea
                  id="note"
                  value={watchedValues.note}
                  onChange={handleNoteChange}
                  placeholder="Any additional information..."
                  className="min-h-[80px]"
                  maxLength={300}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {charCount.note}/300 characters
                </p>
              </div>
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
