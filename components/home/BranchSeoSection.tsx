import Link from 'next/link';
import { MapPin, ShoppingBag, Truck } from 'lucide-react';

import type { RestaurantLocationListItem } from '@/lib/db-actions';
import {
  formatLocationAddress,
  publicBranchSeo,
  type PublicBranchSlug,
} from '@/lib/seo';

export default function BranchSeoSection({
  branch,
  slug,
}: {
  branch: RestaurantLocationListItem;
  slug: PublicBranchSlug;
}) {
  const seo = publicBranchSeo[slug];
  const address = formatLocationAddress(branch);
  const otherBranchSlug = slug === 'alreem' ? 'adnec' : 'alreem';
  const otherBranch = publicBranchSeo[otherBranchSlug];

  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-1 md:px-12">
      <div className="border-y border-[#eadfd6] bg-[#fffaf3] px-4 py-6 md:px-6">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#7e1208] uppercase">
          {seo.eyebrow}
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-normal text-[#3B1C15] md:text-4xl">
              {branch.name} cafe
            </h1>
            {/* <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6e584d] md:text-base">
              {seo.intro} {seo.serviceArea}
            </p> */}
          </div>

          <div className="grid gap-3 text-sm text-[#4f3c34]">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#2c2b2b]" />
              <span>{address}</span>
            </div>
            {/* {branch.phone ? (
              <a
                href={phoneHref ?? undefined}
                className="flex gap-3 transition-colors hover:text-[#7e1208]"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-[#7e1208]" />
                <span>{branch.phone.trim()}</span>
              </a>
            ) : null} */}
            <div className="flex gap-3">
              <Truck className="mt-0.5 size-4 shrink-0 text-[#7e1208]" />
              <span>
                Delivery radius: {branch.deliveryRadiusKm.toFixed(0)} km from
                this branch.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${slug}/checkout`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#694b43] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B1C15] sm:w-auto"
          >
            <ShoppingBag className="size-4" />
            Order from this branch
          </Link>
          <Link
            href={otherBranch.path}
            className="inline-flex w-full items-center justify-center rounded-md border border-[#d9cabe] px-4 py-3 text-sm font-semibold text-[#694b43] transition-colors hover:bg-white sm:w-auto"
          >
            Browse {otherBranch.areaName}
          </Link>
        </div>
      </div>
    </section>
  );
}
