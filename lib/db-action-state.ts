export type ProductActionState = {
  error: string | null;
  success: boolean;
};

export const initialProductActionState: ProductActionState = {
  error: null,
  success: false,
};
