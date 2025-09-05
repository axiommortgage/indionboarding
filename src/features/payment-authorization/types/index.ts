export type { PaymentAuthFormData } from '../lib/validation';

export interface PaymentAuthFormProps {
  initialData?: Partial<PaymentAuthFormData>;
  onSubmit?: (data: PaymentAuthFormData) => void;
  isLoading?: boolean;
}