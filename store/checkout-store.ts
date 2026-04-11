import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CheckoutFulfillmentType = 'PICKUP' | 'DELIVERY';
export type CheckoutPaymentMethod = 'CASH_ON_DELIVERY' | 'CARD';
export type DeliveryCheckStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'unavailable';

type CheckoutData = {
  restaurantLocationId: string | null;
  fulfillmentType: CheckoutFulfillmentType;
  customerName: string;
  customerEmail: string;
  phone: string;
  notes: string;
  paymentMethod: CheckoutPaymentMethod | null;
  deliveryAddressQuery: string;
  deliveryPlaceId: string | null;
  deliverySessionToken: string | null;
  deliveryFormattedAddress: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  deliveryCheckStatus: DeliveryCheckStatus;
  deliveryCheckMessage: string | null;
  deliveryDistanceKm: number | null;
};

type DeliveryCheckResult = {
  status: Exclude<DeliveryCheckStatus, 'idle' | 'checking'>;
  message: string;
  distanceKm: number | null;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
};

interface CheckoutStore extends CheckoutData {
  updateCheckout: (patch: Partial<CheckoutData>) => void;
  setDeliveryCheckStatus: (status: DeliveryCheckStatus) => void;
  setDeliveryCheckResult: (result: DeliveryCheckResult) => void;
  invalidateDeliveryCheck: () => void;
  resetCheckout: () => void;
}

const initialCheckoutState: CheckoutData = {
  restaurantLocationId: null,
  fulfillmentType: 'PICKUP',
  customerName: '',
  customerEmail: '',
  phone: '',
  notes: '',
  paymentMethod: null,
  deliveryAddressQuery: '',
  deliveryPlaceId: null,
  deliverySessionToken: null,
  deliveryFormattedAddress: null,
  deliveryLatitude: null,
  deliveryLongitude: null,
  deliveryCheckStatus: 'idle',
  deliveryCheckMessage: null,
  deliveryDistanceKm: null,
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      ...initialCheckoutState,
      updateCheckout: (patch) => set((state) => ({ ...state, ...patch })),
      setDeliveryCheckStatus: (status) => set({ deliveryCheckStatus: status }),
      setDeliveryCheckResult: (result) =>
        set({
          deliveryCheckStatus: result.status,
          deliveryCheckMessage: result.message,
          deliveryDistanceKm: result.distanceKm,
          deliveryFormattedAddress: result.formattedAddress,
          deliveryLatitude: result.latitude,
          deliveryLongitude: result.longitude,
        }),
      invalidateDeliveryCheck: () =>
        set((state) =>
          state.deliveryCheckStatus === 'idle' &&
          state.deliveryCheckMessage === null &&
          state.deliveryDistanceKm === null &&
          state.deliveryFormattedAddress === null &&
          state.deliveryLatitude === null &&
          state.deliveryLongitude === null
            ? state
            : {
                deliveryCheckStatus: 'idle',
                deliveryCheckMessage: null,
                deliveryDistanceKm: null,
                deliveryFormattedAddress: null,
                deliveryLatitude: null,
                deliveryLongitude: null,
              }
        ),
      resetCheckout: () => set(initialCheckoutState),
    }),
    {
      name: 'cafio-checkout',
    }
  )
);
