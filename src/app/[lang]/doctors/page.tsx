import DoctorsGrid from "@/components/doctors/DoctorsGrid";


export default async function DoctorsPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params; // unwrap the promise
  const lang = resolvedParams.lang === 'fa' || resolvedParams.lang === 'en' ? resolvedParams.lang : 'en';

  return (
    <div>
     
      <DoctorsGrid />
    </div>
  );
}
