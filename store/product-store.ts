import { create } from 'zustand';

interface ProductState {
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  setSubmitting: (value: boolean) => void;
  setSubmitError: (error: string | null) => void;
  setSubmitSuccess: (success: boolean) => void;
  resetState: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  isSubmitting: false,
  submitError: null,
  submitSuccess: false,
  setSubmitting: (value) => set({ isSubmitting: value }),
  setSubmitError: (error) => set({ submitError: error }),
  setSubmitSuccess: (success) => set({ submitSuccess: success }),
  resetState: () =>
    set({ isSubmitting: false, submitError: null, submitSuccess: false }),
}));
