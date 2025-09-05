export type { PoliciesFormData } from '../lib/validation';

export interface PoliciesFormProps {
  initialData?: Partial<PoliciesFormData>;
  onSubmit?: (data: PoliciesFormData) => void;
  isLoading?: boolean;
}