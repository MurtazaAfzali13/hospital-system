// Helper functions for booking

export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  slotDuration: number,
  bookedSlots: string[]
): string[] => {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // فقط اضافه کن اگر قبلاً رزرو نشده باشد
    if (!bookedSlots.includes(timeStr)) {
      slots.push(timeStr);
    }
    
    // اضافه کردن مدت زمان اسلات
    currentMinute += slotDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
};

// اعتبارسنجی تلفن افغانی
export const isValidAfghanPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  const digits = phone.replace(/\D/g, '');
  
  return (digits.length === 9 && digits.startsWith('7')) || 
         (digits.length === 10 && digits.startsWith('07'));
};

export const formatAfghanPhone = (phone: string): string => {
  if (!phone) return '';
  
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 9 && digits.startsWith('7')) {
    return '0' + digits;
  }
  
  if (digits.length === 10 && digits.startsWith('07')) {
    return digits;
  }
  
  return digits;
};