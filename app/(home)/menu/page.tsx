import HomeFooter from '@/components/home/HomeFooter';
import Menu from '@/components/home/Menu';
import ProductCard from '@/components/home/ProductCard';

export default function Page() {
  return (
    <div className="mt-10 min-h-screen px-5 font-sans">
      <div className="flex w-full items-center justify-between">
        <Menu />
      </div>
      <div className="min-h-[70vh] md:px-12">
        <ProductCard />
      </div>
      <div className="bg-cafio my-5 h-px w-full"></div>
      <HomeFooter />
    </div>
  );
}
