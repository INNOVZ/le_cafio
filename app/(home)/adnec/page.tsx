import HomeFooter from '@/components/home/HomeFooter';
import Menu from '@/components/home/Menu';
import ProductCard from '@/components/home/ProductCard';
import BranchSetter from '@/components/home/BranchSetter';
import { getRestaurantLocationBySlug } from '@/lib/db-actions';
import { resolveDbSlug } from '@/lib/branch-slugs';

export default async function Page() {
  const branch = await getRestaurantLocationBySlug(resolveDbSlug('adnec'));

  return (
    <div className="mt-10 min-h-screen px-5 font-sans">
      {branch ? <BranchSetter slug="adnec" id={branch.id} /> : null}
      <div className="flex w-full items-center justify-between">
        <Menu branchSlug="adnec" />
      </div>
      <div className="min-h-[70vh] md:px-12">
        <ProductCard branchSlug="adnec" />
      </div>
      <div className="bg-cafio my-5 h-px w-full"></div>
      <HomeFooter />
    </div>
  );
}
