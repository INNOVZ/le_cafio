import { redirect } from 'next/navigation';
import { buildNoIndexMetadata } from '@/lib/seo';

export const metadata = buildNoIndexMetadata('Payment');

export default function PaymentPage() {
  redirect('/');
}
