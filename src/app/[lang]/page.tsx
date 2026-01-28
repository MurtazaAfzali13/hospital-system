

import ServicesSection from '@/components/ServicesSection';
import dynamic from 'next/dynamic';
const HeroSection=dynamic(() => import("@/components/HeroSection"))

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params; // unwrap the Promise
  const lang = resolvedParams.lang === 'fa' || resolvedParams.lang === 'en' ? resolvedParams.lang : 'en';

  return (
   <>
   
      <HeroSection />
      <ServicesSection />
   </>
  );
}
