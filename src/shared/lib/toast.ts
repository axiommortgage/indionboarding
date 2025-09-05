import { toast } from "sonner";

// Re-export the main toast function
export { toast };

// Convenience functions for common toast types
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

// Specific toast functions for listing sheet operations
export const showListingSheetCreated = () => {
  showSuccess("Listing Sheet Created", "Your listing sheet has been saved successfully.");
};

export const showListingSheetUpdated = () => {
  showSuccess("Listing Sheet Updated", "Your changes have been saved successfully.");
};

export const showListingSheetGenerated = () => {
  showSuccess("PDF Generated", "Your listing sheet PDF has been generated successfully.");
};

export const showListingSheetError = (error: string) => {
  showError("Operation Failed", error);
};
