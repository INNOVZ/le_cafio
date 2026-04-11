'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

import type { RestaurantLocationListItem } from '@/lib/db-actions';
import type { AddressSuggestion } from '@/lib/google-places';
import { useCheckoutStore } from '@/store/checkout-store';
import { useStore } from '@/store';

function formatPrice(value: number) {
  return `AED ${value.toFixed(2)}`;
}

function createSessionToken() {
  return globalThis.crypto?.randomUUID?.() ?? `cafio-${Date.now()}`;
}

export default function CheckoutClient({
  restaurantLocations,
}: {
  restaurantLocations: RestaurantLocationListItem[];
}) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const cartItems = useStore((state) => state.cartItems);
  const incrementCartItem = useStore((state) => state.incrementCartItem);
  const decrementCartItem = useStore((state) => state.decrementCartItem);
  const removeCartItem = useStore((state) => state.removeCartItem);

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
  const deliveryCheckMessage = useCheckoutStore(
    (state) => state.deliveryCheckMessage
  );
  const deliveryDistanceKm = useCheckoutStore(
    (state) => state.deliveryDistanceKm
  );
  const deliveryFormattedAddress = useCheckoutStore(
    (state) => state.deliveryFormattedAddress
  );
  const updateCheckout = useCheckoutStore((state) => state.updateCheckout);
  const setDeliveryCheckStatus = useCheckoutStore(
    (state) => state.setDeliveryCheckStatus
  );
  const setDeliveryCheckResult = useCheckoutStore(
    (state) => state.setDeliveryCheckResult
  );
  const invalidateDeliveryCheck = useCheckoutStore(
    (state) => state.invalidateDeliveryCheck
  );

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
    if (
      fulfillmentType !== 'DELIVERY' ||
      !selectedRestaurant ||
      deliveryAddressQuery.trim().length < 3 ||
      deliveryPlaceId
    ) {
      setSuggestions([]);
      setIsFetchingSuggestions(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setIsFetchingSuggestions(true);
        const response = await fetch('/api/address-autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: deliveryAddressQuery,
            sessionToken: deliverySessionToken,
            originLatitude: selectedRestaurant.latitude,
            originLongitude: selectedRestaurant.longitude,
          }),
        });

        const result = (await response.json()) as {
          suggestions?: AddressSuggestion[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(
            result.message ?? 'Could not fetch address suggestions.'
          );
        }

        if (!cancelled) {
          setSuggestions(result.suggestions ?? []);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsFetchingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    deliveryAddressQuery,
    deliveryPlaceId,
    deliverySessionToken,
    fulfillmentType,
    selectedRestaurant,
  ]);

  function handleAddressInputChange(value: string) {
    updateCheckout({
      deliveryAddressQuery: value,
      deliveryPlaceId: null,
      deliveryFormattedAddress: null,
      deliveryLatitude: null,
      deliveryLongitude: null,
      deliverySessionToken: deliverySessionToken ?? createSessionToken(),
    });
    invalidateDeliveryCheck();
  }

  function handleSuggestionSelect(suggestion: AddressSuggestion) {
    updateCheckout({
      deliveryAddressQuery: suggestion.text,
      deliveryPlaceId: suggestion.placeId,
      deliveryFormattedAddress: suggestion.text,
    });
    invalidateDeliveryCheck();
    setSuggestions([]);
  }

  async function handleCheckAvailability() {
    if (!restaurantLocationId) {
      toast.error('Please select a restaurant branch first.', {
        position: 'bottom-right',
      });
      return;
    }

    if (!deliveryPlaceId) {
      toast.error('Please choose an address from the suggestions.', {
        position: 'bottom-right',
      });
      return;
    }

    setDeliveryCheckStatus('checking');

    try {
      const response = await fetch('/api/delivery-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantLocationId,
          placeId: deliveryPlaceId,
          sessionToken: deliverySessionToken,
        }),
      });

      const result = (await response.json()) as {
        available?: boolean;
        message: string;
        distanceKm?: number;
        normalizedAddress?: string;
        latitude?: number;
        longitude?: number;
      };

      if (!response.ok) {
        setDeliveryCheckResult({
          status: 'unavailable',
          message: result.message,
          distanceKm: null,
          formattedAddress: null,
          latitude: null,
          longitude: null,
        });
        return;
      }

      updateCheckout({
        deliveryAddressQuery: result.normalizedAddress ?? deliveryAddressQuery,
        deliveryFormattedAddress:
          result.normalizedAddress ?? deliveryFormattedAddress,
        deliverySessionToken: createSessionToken(),
      });

      setDeliveryCheckResult({
        status: result.available ? 'available' : 'unavailable',
        message: result.message,
        distanceKm: result.distanceKm ?? null,
        formattedAddress: result.normalizedAddress ?? null,
        latitude: result.latitude ?? null,
        longitude: result.longitude ?? null,
      });
    } catch (error) {
      console.error('Check availability error:', error);
      setDeliveryCheckResult({
        status: 'unavailable',
        message: 'Could not verify delivery right now. Please try again.',
        distanceKm: null,
        formattedAddress: null,
        latitude: null,
        longitude: null,
      });
    }
  }

  function handleContinueToPayment() {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.', { position: 'bottom-right' });
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !phone.trim()) {
      toast.error('Please enter your name, email, and phone number.', {
        position: 'bottom-right',
      });
      return;
    }

    if (!restaurantLocationId) {
      toast.error('Please select a restaurant branch.', {
        position: 'bottom-right',
      });
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method.', {
        position: 'bottom-right',
      });
      return;
    }

    if (fulfillmentType === 'DELIVERY') {
      if (!deliveryPlaceId) {
        toast.error('Please choose a delivery address first.', {
          position: 'bottom-right',
        });
        return;
      }

      if (deliveryCheckStatus !== 'available') {
        toast.error(
          'Please validate delivery availability before continuing.',
          {
            position: 'bottom-right',
          }
        );
        return;
      }
    }

    router.push('/payment');
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-10 md:py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-[#694b43] uppercase">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#3f2418]">
            Choose a branch and confirm delivery
          </h1>
        </div>
        <Link
          href="/menu"
          className="inline-flex items-center rounded-full border border-[#ddcdbf] px-4 py-2 text-sm font-semibold text-[#4a281b] transition-colors hover:bg-[#f8f1ea]"
        >
          Back to Menu
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[#ddcdbf] bg-[#fffaf5] px-6 py-16 text-center">
          <p className="text-lg font-medium text-[#4a281b]">
            Your cart is empty.
          </p>
          <p className="mt-2 text-sm text-[#7d6658]">
            Add a few menu items before proceeding to checkout.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center rounded-full bg-[#694b43] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#34180f]"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.8fr]">
          <section className="space-y-6">
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {restaurantLocations.map((location) => {
                const isSelected = restaurantLocationId === location.id;

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      updateCheckout({ restaurantLocationId: location.id });
                      invalidateDeliveryCheck();
                    }}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-[#7e1208] bg-[#fff5ef] shadow-[0_12px_30px_rgba(126,18,8,0.08)]'
                        : 'border-[#eadfd6] bg-white hover:border-[#d7c2b3]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#694b43] text-white">
                        <Store className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#694b43]">
                          {location.name}
                        </p>
                        <p className="mt-1 text-sm text-[#694b43]">
                          {location.addressLine}, {location.city}
                        </p>
                        <p className="mt-2 text-xs font-medium tracking-[0.14em] text-[#8f6e58] uppercase">
                          Delivery radius {location.deliveryRadiusKm} km
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#8f6e58] uppercase">
                Fulfillment
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {(['PICKUP', 'DELIVERY'] as const).map((mode) => {
                  const isActive = fulfillmentType === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        updateCheckout({ fulfillmentType: mode });
                        invalidateDeliveryCheck();
                      }}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        isActive
                          ? 'border-[#7e1208] bg-[#fff5ef] shadow-[0_12px_30px_rgba(126,18,8,0.08)]'
                          : 'border-[#eadfd6] bg-white hover:border-[#d7c2b3]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#694b43] text-white">
                          {mode === 'PICKUP' ? (
                            <Store className="h-4 w-4" />
                          ) : (
                            <Truck className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#3f2418]">
                            {mode === 'PICKUP' ? 'Pickup' : 'Delivery'}
                          </p>
                          <p className="mt-1 text-sm text-[#7d6658]">
                            {mode === 'PICKUP'
                              ? 'Collect from your chosen branch.'
                              : 'Select an address from Google suggestions and validate the branch radius.'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {fulfillmentType === 'DELIVERY' ? (
              <div className="rounded-xl border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#8f6e58] uppercase">
                  Delivery Address
                </p>
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4a281b]">
                        Search Address
                      </span>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8f6e58]" />
                        <input
                          value={deliveryAddressQuery}
                          onChange={(event) =>
                            handleAddressInputChange(event.target.value)
                          }
                          className="w-full rounded-xl border border-[#d8c8bb] bg-white py-3 pr-4 pl-11 text-sm text-[#3f2418] transition-colors outline-none focus:border-[#8c5d46]"
                          placeholder="Start typing your delivery address"
                        />
                      </div>
                    </label>

                    {deliveryPlaceId && deliveryAddressQuery ? (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#edf8f0] px-3 py-1.5 text-xs font-medium text-[#1d5b2d]">
                        <Check className="h-3.5 w-3.5" />
                        Address selected
                      </div>
                    ) : null}

                    {isFetchingSuggestions ? (
                      <div className="mt-3 flex items-center gap-2 text-sm text-[#7d6658]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching addresses...
                      </div>
                    ) : null}

                    {!deliveryPlaceId &&
                    deliveryAddressQuery.trim().length >= 3 &&
                    suggestions.length > 0 ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#eadfd6] bg-white shadow-[0_18px_45px_rgba(74,45,27,0.08)]">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.placeId}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="block w-full border-b border-[#f1e7df] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#fff5ef]"
                          >
                            <p className="text-sm font-medium text-[#3f2418]">
                              {suggestion.mainText || suggestion.text}
                            </p>
                            {suggestion.secondaryText ? (
                              <p className="mt-1 text-xs text-[#7d6658]">
                                {suggestion.secondaryText}
                              </p>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleCheckAvailability}
                    disabled={
                      deliveryCheckStatus === 'checking' || !deliveryPlaceId
                    }
                    className="inline-flex items-center rounded-full bg-[#694b43] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#34180f] disabled:cursor-not-allowed disabled:bg-[#bca89c]"
                  >
                    {deliveryCheckStatus === 'checking'
                      ? 'Checking...'
                      : 'Check Delivery Availability'}
                  </button>
                </div>

                {deliveryCheckMessage ? (
                  <div
                    className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                      deliveryCheckStatus === 'available'
                        ? 'bg-[#edf8f0] text-[#1d5b2d]'
                        : 'bg-[#fff1ee] text-[#8a2d21]'
                    }`}
                  >
                    <p className="font-medium">{deliveryCheckMessage}</p>
                    {deliveryDistanceKm !== null ? (
                      <p className="mt-1">
                        Distance from {selectedRestaurant?.name}:{' '}
                        {deliveryDistanceKm} km
                      </p>
                    ) : null}
                    {deliveryFormattedAddress ? (
                      <p className="mt-1 text-xs opacity-80">
                        Validated address: {deliveryFormattedAddress}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-xl border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#8f6e58] uppercase">
                Customer Details
              </p>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4a281b]">
                    Full Name
                  </span>
                  <input
                    value={customerName}
                    onChange={(event) =>
                      updateCheckout({ customerName: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#d8c8bb] bg-white px-4 py-3 text-sm text-[#3f2418] transition-colors outline-none focus:border-[#8c5d46]"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4a281b]">
                    Email Address
                  </span>
                  <input
                    value={customerEmail}
                    onChange={(event) =>
                      updateCheckout({ customerEmail: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#d8c8bb] bg-white px-4 py-3 text-sm text-[#3f2418] transition-colors outline-none focus:border-[#8c5d46]"
                    placeholder="you@example.com"
                    type="email"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4a281b]">
                    Phone Number
                  </span>
                  <input
                    value={phone}
                    onChange={(event) =>
                      updateCheckout({ phone: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#d8c8bb] bg-white px-4 py-3 text-sm text-[#3f2418] transition-colors outline-none focus:border-[#8c5d46]"
                    placeholder="+971 ..."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4a281b]">
                    Notes
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) =>
                      updateCheckout({ notes: event.target.value })
                    }
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#d8c8bb] bg-white px-4 py-3 text-sm text-[#3f2418] transition-colors outline-none focus:border-[#8c5d46]"
                    placeholder="Any delivery or preparation notes"
                  />
                </label>
              </div>
            </div>
          </section>

          <aside className="h-fit space-y-4 rounded-xl border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
            <section className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[56px_1fr_auto] gap-3 rounded-2xl border border-[#eadfd6] bg-white/90 p-3"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#f3eee8]">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-cafio truncate text-sm font-bold">
                      {item.name}
                    </p>
                    <p className="text-cafio mt-1 text-xs font-medium">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-3 inline-flex items-center rounded-full border border-[#d8c8bb] bg-[#fffaf5]">
                      <button
                        type="button"
                        onClick={() => decrementCartItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center text-[#6e4636] transition-colors hover:bg-[#f5ede7]"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-xs font-semibold text-[#4a281b]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementCartItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center text-[#6e4636] transition-colors hover:bg-[#f5ede7]"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="text-[#a56c3f] transition-colors hover:text-[#694b43]"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-bold text-[#4a281b]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </section>
            <section className="rounded-xl border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-[0_18px_45px_rgba(74,45,27,0.06)]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#8f6e58] uppercase">
                Payment Method
              </p>
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                {(
                  [
                    {
                      id: 'CASH_ON_DELIVERY',
                      title: 'Cash on Delivery',
                    },
                    {
                      id: 'CARD',
                      title: 'Card Payment',
                    },
                  ] as const
                ).map((method) => {
                  const isActive = paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() =>
                        updateCheckout({ paymentMethod: method.id })
                      }
                      className={`flex cursor-pointer items-center justify-center rounded-xl border p-2 transition-all ${
                        isActive
                          ? 'border-[#7e1208] bg-[#fff5ef] shadow-[0_12px_30px_rgba(126,18,8,0.08)]'
                          : 'border-[#eadfd6] bg-white hover:border-[#d7c2b3]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#3f2418]">
                        {method.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#8f6e58] uppercase">
                Summary
              </p>

              <div className="mt-5 space-y-3 text-sm text-[#5d463a]">
                <div className="flex items-center justify-between">
                  <span>Branch</span>
                  <span className="max-w-[55%] text-right font-medium text-[#3f2418]">
                    {selectedRestaurant?.name ?? 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fulfillment</span>
                  <span className="font-medium text-[#3f2418]">
                    {fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment</span>
                  <span className="font-medium text-[#3f2418]">
                    {paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'Cash on Delivery'
                      : paymentMethod === 'CARD'
                        ? 'Card'
                        : 'Not selected'}
                  </span>
                </div>
                {fulfillmentType === 'DELIVERY' ? (
                  <div className="rounded-xl bg-white p-3 text-xs text-[#7d6658]">
                    {deliveryFormattedAddress ??
                      (deliveryAddressQuery ||
                        'Choose a delivery address from the suggestions.')}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 space-y-3 text-sm text-[#5d463a]">
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

              <div className="mt-6 border-t border-[#eadfd6] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5d463a]">
                    Total
                  </span>
                  <span className="text-2xl font-semibold text-[#3f2418]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueToPayment}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#694b43] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#34180f]"
              >
                {paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'Review COD Order'
                  : 'Continue to Payment'}
              </button>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
