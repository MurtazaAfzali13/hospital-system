import DoctorsGrid from "@/components/doctors/DoctorsGrid";
import { generateTimeSlots } from '@/utils/bookingHelper';




export default async function DoctorsPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params; // unwrap the promise
  const lang = resolvedParams.lang === 'fa' || resolvedParams.lang === 'en' ? resolvedParams.lang : 'en';
console.log(
  'Test Slots:', 
  generateTimeSlots('08:00', '09:00', 20, ['08:20'])
);
  return (
    <div>
     
      <DoctorsGrid />
    </div>
  );
}
