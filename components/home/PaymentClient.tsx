'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  Store,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

import type { RestaurantLocationListItem } from '@/lib/db-actions';
import { useCheckoutStore } from '@/store/checkout-store';
import { useStore } from '@/store';

function formatPrice(value: number) {
  return `AED ${value.toFixed(2)}`;
}

export default function PaymentClient({
  restaurantLocations,
}: {
  restaurantLocations: RestaurantLocationListItem[];
}) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = useStore((state) => state.cartItems);
  const clearCart = useStore((state) => state.clearCart);

  const restaurantLocationId = useCheckoutStore(
    (state) => state.restaurantLocationId
  );
  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const customerName = useCheckoutStore((state) => state.customerName);
  const customerEmail = useCheckoutStore((state) => state.customerEmail);
  const phone = useCheckoutStore((state) => state.phone);
  const notes = useCheckoutStore((state) => state.notes);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const deliveryAddressQuery = useCheckoutStore(
    (state) => state.deliveryAddressQuery
  );
  const deliveryPlaceId = useCheckoutStore((state) => state.deliveryPlaceId);
  const deliverySessionToken = useCheckoutStore(
    (state) => state.deliverySessionToken
  );
  const deliveryCheckStatus = useCheckoutStore(
    (state) => state.deliveryCheckStatus
  );
  const deliveryDistanceKm = useCheckoutStore(
    (state) => state.deliveryDistanceKm
  );
  const deliveryFormattedAddress = useCheckoutStore(
    (state) => state.deliveryFormattedAddress
  );
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  const [successWhatsappUrl, setSuccessWhatsappUrl] = useState<string | null>(null);

  useEffect(() => {
    const syncHydration = () => {
      if (
        useStore.persist.hasHydrated() &&
        useCheckoutStore.persist.hasHydrated()
      ) {
        setIsHydrated(true);
      }
    };

    syncHydration();

    const unsubscribeCart = useStore.persist.onFinishHydration(syncHydration);
    const unsubscribeCheckout =
      useCheckoutStore.persist.onFinishHydration(syncHydration);

    return () => {
      unsubscribeCart();
      unsubscribeCheckout();
    };
  }, []);

  const selectedRestaurant = useMemo(
    () =>
      restaurantLocations.find(
        (location) => location.id === restaurantLocationId
      ) ?? null,
    [restaurantLocationId, restaurantLocations]
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const serviceFee = cartItems.length > 0 ? 5 : 0;
  const deliveryFee =
    fulfillmentType === 'DELIVERY' && deliveryCheckStatus === 'available'
      ? 12
      : 0;
  const total = subtotal + serviceFee + deliveryFee;

  useEffect(() => {
    if (!isHydrated || successWhatsappUrl) {
      return;
    }

    const hasValidCustomer =
      customerName.trim() && customerEmail.trim() && phone.trim();
    const hasValidRestaurant = Boolean(restaurantLocationId);
    const hasValidDelivery =
      fulfillmentType === 'PICKUP' || deliveryCheckStatus === 'available';
    const hasValidPaymentMethod = Boolean(paymentMethod);

    if (
      cartItems.length === 0 ||
      !hasValidCustomer ||
      !hasValidRestaurant ||
      !hasValidDelivery ||
      !hasValidPaymentMethod
    ) {
      router.replace('/checkout');
    }
  }, [
    cartItems.length,
    customerEmail,
    customerName,
    deliveryCheckStatus,
    fulfillmentType,
    isHydrated,
    paymentMethod,
    phone,
    restaurantLocationId,
    router,
    successWhatsappUrl,
  ]);

  async function handleConfirmPayment() {
    if (!paymentMethod) {
      toast.error('Please choose a payment method in checkout first.', {
        position: 'bottom-right',
      });
      return;
    }

    if (paymentMethod === 'CARD') {
      toast.info('Stripe secure payment is the next step to implement.', {
        position: 'bottom-right',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders/cod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantLocationId,
          customerName,
          customerEmail,
          phone,
          notes,
          fulfillmentType,
          deliveryPlaceId,
          deliverySessionToken,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = (await response.json()) as {
        whatsappUrl?: string;
        message?: string;
      };

      if (!response.ok || !result.whatsappUrl) {
        throw new Error(
          result.message ?? 'Could not create the COD order right now.'
        );
      }

      clearCart();
      resetCheckout();
      toast.success('Order created successfully!', {
        position: 'bottom-right',
      });

      setSuccessWhatsappUrl(result.whatsappUrl);
      setIsSubmitting(false);
    } catch (error) {
      console.error('COD order error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not complete the order. Please try again.',
        {
          position: 'bottom-right',
        }
      );
      setIsSubmitting(false);
    }
  }

  const paymentMethodLabel =
    paymentMethod === 'CASH_ON_DELIVERY'
      ? 'Cash on Delivery'
      : paymentMethod === 'CARD'
        ? 'Card Payment'
        : 'Not selected';

  const paymentMethodDescription =
    paymentMethod === 'CASH_ON_DELIVERY'
      ? 'We will create your order and open WhatsApp with the selected branch.'
      : paymentMethod === 'CARD'
        ? 'This will continue to Stripe secure checkout once that step is wired.'
        : 'Choose your payment method in checkout to continue.';

  const actionLabel =
    paymentMethod === 'CASH_ON_DELIVERY'
      ? 'Place Order via WhatsApp'
      : paymentMethod === 'CARD'
        ? 'Proceed to Secure Payment'
        : 'Confirm Payment';

  const submittingLabel =
    paymentMethod === 'CASH_ON_DELIVERY'
      ? 'Creating COD Order...'
      : 'Processing Payment...';

  if (successWhatsappUrl) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-10 md:py-12">
        <div className="flex flex-col items-center justify-center space-y-6 rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] px-6 py-16 text-center shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#3f2418]">
              Order Placed Successfully!
            </h1>
            <p className="max-w-md text-sm text-[#7d6658]">
              Your order has been recorded. Click the button below to send your
              order details securely to our team via WhatsApp.
            </p>
          </div>
          <a
            href={successWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#1ebd5a] active:bg-[#1ca851]"
          >
            <MessageCircle className="h-5 w-5 fill-current" />
            Open WhatsApp to Confirm
          </a>
        </div>
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-10 md:py-12">
        <div className="rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-8 text-sm text-[#7d6658] shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
          Preparing payment details...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-10 md:py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6e58]">
            Payment
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#3f2418]">
            Review and confirm your order
          </h1>
        </div>
        <Link
          href="/checkout"
          className="inline-flex items-center rounded-full border border-[#ddcdbf] px-4 py-2 text-sm font-semibold text-[#4a281b] transition-colors hover:bg-[#f8f1ea]"
        >
          Back to Checkout
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="space-y-5 rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f6e58]">
              Order Details
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#eadfd6] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a281b] text-white">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3f2418]">
                      {selectedRestaurant?.name ?? 'Branch not selected'}
                    </p>
                    {selectedRestaurant ? (
                      <p className="mt-1 text-sm text-[#7d6658]">
                        {selectedRestaurant.addressLine}, {selectedRestaurant.city}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#eadfd6] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a281b] text-white">
                    {fulfillmentType === 'DELIVERY' ? (
                      <Truck className="h-4 w-4" />
                    ) : (
                      <Store className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3f2418]">
                      {fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}
                    </p>
                    <p className="mt-1 text-sm text-[#7d6658]">
                      {fulfillmentType === 'DELIVERY'
                        ? `Validated for ${deliveryDistanceKm?.toFixed(2) ?? '0.00'} km from branch`
                        : 'Collect directly from the selected branch'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[#eadfd6] bg-white p-4">
              <p className="text-sm font-semibold text-[#3f2418]">
                Customer
              </p>
              <p className="mt-2 text-sm text-[#7d6658]">{customerName}</p>
              <p className="mt-1 text-sm text-[#7d6658]">{customerEmail}</p>
              <p className="mt-1 text-sm text-[#7d6658]">{phone}</p>
              {notes.trim() ? (
                <p className="mt-3 text-sm text-[#7d6658]">Notes: {notes}</p>
              ) : null}
            </div>

            {fulfillmentType === 'DELIVERY' ? (
              <div className="mt-5 rounded-[1.5rem] border border-[#eadfd6] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a281b] text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3f2418]">
                      Delivery Address
                    </p>
                    <p className="mt-2 text-sm text-[#7d6658]">
                      {deliveryFormattedAddress ?? deliveryAddressQuery}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f6e58]">
              Items
            </p>
            <div className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[72px_1fr_auto] gap-4 rounded-[1.5rem] border border-[#eadfd6] bg-white p-4"
                >
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded-2xl bg-[#f3eee8]">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3f2418]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-[#7d6658]">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="self-center text-sm font-semibold text-[#4a281b]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f6e58]">
            Payment Summary
          </p>

          <div className="mt-5 space-y-3 text-sm text-[#5d463a]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Service Fee</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
            {fulfillmentType === 'DELIVERY' ? (
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-5 border-t border-[#eadfd6] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#5d463a]">Total</span>
              <span className="text-2xl font-semibold text-[#3f2418]">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-white p-4 text-sm text-[#7d6658]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#4a281b] text-white">
                {paymentMethod === 'CASH_ON_DELIVERY' ? (
                  <MessageCircle className="h-4 w-4" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-semibold text-[#3f2418]">{paymentMethodLabel}</p>
                <p className="mt-1">{paymentMethodDescription}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4a281b] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#34180f] disabled:cursor-not-allowed disabled:bg-[#bca89c]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {submittingLabel}
              </>
            ) : (
              actionLabel
            )}
          </button>
        </aside>
      </div>
    </div>
  );
}
