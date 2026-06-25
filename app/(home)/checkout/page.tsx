import { redirect } from 'next/navigation';
import { buildNoIndexMetadata } from '@/lib/seo';

export const metadata = buildNoIndexMetadata('Checkout');

export default function CheckoutPage() {
  redirect('/');
}
 
