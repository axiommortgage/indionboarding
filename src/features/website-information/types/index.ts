export type { WebsiteInfoFormData } from '../lib/validation';

export interface WebsiteInfoFormProps {
  initialData?: Partial<WebsiteInfoFormData>;
  onSubmit?: (data: WebsiteInfoFormData) => void;
  isLoading?: boolean;
}