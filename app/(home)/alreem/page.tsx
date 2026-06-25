import HomeFooter from '@/components/home/HomeFooter';
import Menu from '@/components/home/Menu';
import ProductCard from '@/components/home/ProductCard';
import BranchSetter from '@/components/home/BranchSetter';
import BranchSeoSection from '@/components/home/BranchSeoSection';
import JsonLd from '@/components/seo/JsonLd';
import { getRestaurantLocationBySlug } from '@/lib/db-actions';
import { resolveDbSlug } from '@/lib/branch-slugs';
import { buildBranchMetadata, buildRestaurantJsonLd } from '@/lib/seo';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = buildBranchMetadata('alreem');

export default async function Page() {
  const branch = await getRestaurantLocationBySlug(resolveDbSlug('alreem'));

  if (!branch) {
    notFound();
  }

  return (
    <div className="mt-10 min-h-screen px-5 font-sans">
      <JsonLd data={buildRestaurantJsonLd(branch, 'alreem')} />
      <BranchSetter slug="alreem" id={branch.id} />
      <BranchSeoSection branch={branch} slug="alreem" />
      <div className="flex w-full items-center justify-between">
        <Menu branchSlug="alreem" />
      </div>
      <div className="min-h-[70vh] md:px-12">
        <ProductCard branchId={branch.id} branchSlug="alreem" />
      </div>
      <div className="bg-cafio my-5 h-px w-full"></div>
      <HomeFooter />
    </div>
  );
}
