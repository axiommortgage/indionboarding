export type { PhotosFormData } from '../lib/validation';

export interface PhotosFormProps {
  initialData?: Partial<PhotosFormData>;
  onSubmit?: (data: PhotosFormData) => void;
  isLoading?: boolean;
}