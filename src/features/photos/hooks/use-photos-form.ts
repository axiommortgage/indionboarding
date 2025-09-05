"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { photosSchema, PhotosFormData } from "../lib/validation";
import { useFormsContext } from "@/shared/contexts/forms-context";
import { toast } from "@/shared/lib/toast";

export function usePhotosForm() {
  const { forms, updateForm, saveForm } = useFormsContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [digitalPhotoPreview, setDigitalPhotoPreview] = React.useState<string | null>(null);
  const [printPhotoPreview, setPrintPhotoPreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState({ digital: false, print: false });
  const [files, setFiles] = React.useState<{ digital?: File, print?: File }>({});

  const form = useForm<PhotosFormData>({
    resolver: zodResolver(photosSchema) as any,
    defaultValues: {
      photo: forms.photos?.photo || "",
      printPhoto: forms.photos?.printPhoto || "",
      useDefaultPhoto: forms.photos?.useDefaultPhoto ?? false,
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

  return {
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
    handleSubmit: handleSubmit(onSubmit),
  };
}