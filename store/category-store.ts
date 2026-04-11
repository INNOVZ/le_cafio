import { create } from 'zustand';

interface CategoryStore {
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmitSuccess: (success: boolean) => void;
  setSubmitError: (error: string | null) => void;
  resetState: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  isSubmitting: false,
  submitSuccess: false,
  submitError: null,
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmitSuccess: (success) => set({ submitSuccess: success }),
  setSubmitError: (error) => set({ submitError: error }),
  resetState: () => set({ isSubmitting: false, submitSuccess: false, submitError: null }),
}));
