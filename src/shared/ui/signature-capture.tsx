"use client";

import * as React from "react";
import SignatureCanvas from "react-signature-canvas";
import * as htmlToImage from "html-to-image";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

interface SignatureCaptureProps {
  onSignatureChange: (signature: string | null) => void;
  value?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SignatureCapture({
  onSignatureChange,
  value,
  label = "Signature",
  required = false,
  className,
  disabled = false,
}: SignatureCaptureProps) {
  const signaturePadRef = React.useRef<SignatureCanvas>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hasSignature, setHasSignature] = React.useState(false);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasSignature(false);
      onSignatureChange(null);
    }
  };

  const handleEnd = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setHasSignature(true);
      const dataURL = signaturePadRef.current.toDataURL();
      onSignatureChange(dataURL);
    }
  };

  // Capture signature as blob for upload
  const captureSignature = async (): Promise<Blob | null> => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      throw new Error('Signature is empty');
    }

    try {
      let signatureBlob: Blob;

      // Safari-specific handling
      if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        // Get the canvas element and its data directly
        const canvas = signaturePadRef.current.getCanvas();
        const dataUrl = canvas.toDataURL('image/png');

        // Convert base64 to blob
        const base64Response = await fetch(dataUrl);
        signatureBlob = await base64Response.blob();
      } else {
        // For other browsers, use html-to-image
        if (!containerRef.current) {
          throw new Error('Container reference not found');
        }
        const blob = await htmlToImage.toBlob(containerRef.current);
        if (!blob) {
          throw new Error('Failed to generate signature blob');
        }
        signatureBlob = blob;
      }

      // Validate blob
      if (!signatureBlob || signatureBlob.size < 1000) {
        throw new Error('Generated signature appears to be empty or invalid');
      }

      return signatureBlob;
    } catch (error) {
      throw new Error(`Failed to capture signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Create FormData for signature upload
  const createSignatureFormData = (signatureBlob: Blob, user: any, fieldName = 'signature'): FormData => {
    const formData = new FormData();
    formData.append('files', signatureBlob, `applicantSignature-${user.firstname}-${user.lastname}.png`);
    formData.append('refId', user.id);
    formData.append('source', 'users-permissions');
    formData.append('ref', 'user');
    formData.append('field', fieldName);
    return formData;
  };

  // Load existing signature if provided
  React.useEffect(() => {
    if (value && signaturePadRef.current) {
      signaturePadRef.current.fromDataURL(value);
      setHasSignature(true);
    }
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="signature">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div 
        ref={containerRef}
        className={cn(
          "border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-background",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <SignatureCanvas
          ref={signaturePadRef}
          canvasProps={{
            width: 500,
            height: 200,
            className: "signature-canvas w-full h-full border rounded",
          }}
          onEnd={handleEnd}
          backgroundColor="rgb(255, 255, 255)"
        />
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground">
            {hasSignature ? "Signature captured" : "Please sign above"}
          </p>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export helper functions for use in forms
export { SignatureCapture as default };
export type { SignatureCaptureProps };
