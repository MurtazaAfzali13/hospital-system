// 📁 components/booking/ModernBookingSection.tsx
"use client";

import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { I18nContext } from "@/context/I18nContext";
import { BookingProvider, useBooking } from "@/context/BookingContext";
import { CalendarDays, Loader2, AlertCircle, RefreshCw, Lock } from "lucide-react";
import DateSelector from "./DateSelector";
import TimeSlotGrid from "./TimeSlotGrid";
import PatientRegistrationDialog from "./PatientRegistrationDialog";

// Types
type Schedule = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  doctor_id: string;
};

type Appointment = {
  appointment_time: string;
  patient_name: string;
  patient_phone: string;
  verification_code?: string;
  status: string;
};

type BookingSectionProps = {
  schedules: Schedule[];
  doctorId: string;
  doctorName: string;
  currentUserPhone?: string;
};

// Helper function to generate time slots
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  slotDuration: number,
  bookedSlots: string[],
  reservedSlots: string[] // اضافه کردن reservedSlots
): string[] => {
  const slots: string[] = [];
  
  // فرمت زمان: HH:MM یا HH:MM:SS را به HH:MM تبدیل کن
  const formatTime = (time: string) => {
    if (!time) return '00:00';
    return time.includes(':') ? time.slice(0, 5) : time;
  };
  
  const formattedStart = formatTime(startTime);
  const formattedEnd = formatTime(endTime);
  
  const [startHour, startMinute] = formattedStart.split(":").map(Number);
  const [endHour, endMinute] = formattedEnd.split(":").map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // فقط اضافه کن اگر قبلاً رزرو یا رزرو موقت نشده باشد
    if (!bookedSlots.includes(timeStr) && !reservedSlots.includes(timeStr)) {
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

// تابع برای تبدیل زمان با ثانیه به زمان بدون ثانیه
const removeSeconds = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') {
    return '';
  }
  
  // اگر زمان شامل ثانیه باشد (HH:MM:SS) آن را به HH:MM تبدیل کن
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  
  return timeString;
};

// ==================== Inner Component ====================
function ModernBookingSectionContent({
  schedules,
  doctorId,
  doctorName,
  currentUserPhone
}: BookingSectionProps) {
  const { lang, t } = useContext(I18nContext);
  const isRTL = lang === 'fa';
  
  // استفاده از Booking Context
  const { 
    state, 
    reserveTimeSlot, 
    confirmBooking,
    cancelReservation,
    dispatch
  } = useBooking();
  
  // State Management
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // زمان‌های رزرو شده از context
  const bookedSlots = Array.from(state.bookedSlots);
  const reservedSlots = Array.from(state.reservedSlots);
  
  // ساخت appointments از timeSlots
  const appointments = useMemo(() => {
    return state.timeSlots
      .filter(slot => slot.status === 'booked' || slot.status === 'mine')
      .map(slot => ({
        appointment_time: slot.time,
        patient_name: slot.bookedBy || 'بیمار',
        patient_phone: slot.patientPhone || '',
        verification_code: slot.verificationCode,
        status: slot.status === 'mine' ? 'confirmed' : 'booked'
      }));
  }, [state.timeSlots]);

  // Available Dates (امروز تا ۷ روز آینده)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, []);

  // Schedule for selected day
  const scheduleForDay = useMemo(() => {
    const dayOfWeek = selectedDate.getDay();
    return schedules.find(s => Number(s.day_of_week) === dayOfWeek);
  }, [selectedDate, schedules]);

  // Fetch appointments data - بدون استفاده از hook داخلی
  const fetchAppointmentsData = useCallback(async () => {
    if (!doctorId) {
      console.log("❌ No doctorId provided");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log("📡 Fetching appointments for:", {
        doctorId,
        date: dateStr,
        url: `/api/doctors/${doctorId}/appointments?date=${dateStr}`
      });
      
      const res = await fetch(
        `/api/doctors/${doctorId}/appointments?date=${dateStr}`
      );

      console.log("📡 API Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      console.log("📊 Raw API Data received:", data);
      
      if (Array.isArray(data)) {
        console.log("📊 Processing appointments array, length:", data.length);
        
        // تبدیل داده‌های سرور به فرمتی که reducer می‌پذیرد
        const serverData = data.map((appointment: any) => {
          const time = appointment.appointment_time?.slice(0, 5) || '';
          const isMine = currentUserPhone && appointment.patient_phone === currentUserPhone;
          
          return {
            time,
            appointment_time: time,
            patient_name: appointment.patient_name,
            patient_phone: appointment.patient_phone,
            verification_code: appointment.verification_code,
            status: isMine ? 'mine' : 'booked',
            isMine: isMine
          };
        });

        // آپدیت state با داده‌های جدید از سرور
        dispatch({ type: 'UPDATE_FROM_SERVER', payload: serverData });

        console.log("🔄 Updated time slots from server:", serverData.length);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch appointments:", err);
      setError(err.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, doctorId, currentUserPhone, dispatch]);

  useEffect(() => {
    console.log("🔁 useEffect triggered:", {
      selectedDate: selectedDate.toDateString(),
      doctorId,
      scheduleForDay,
      refreshTrigger
    });
    
    if (doctorId) {
      fetchAppointmentsData();
    }
  }, [selectedDate, doctorId, refreshTrigger, fetchAppointmentsData]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    if (!scheduleForDay) {
      console.log("❌ No schedule for this day");
      return [];
    }

    const slots = generateTimeSlots(
      scheduleForDay.start_time,
      scheduleForDay.end_time,
      scheduleForDay.slot_duration || 30,
      bookedSlots,
      reservedSlots
    );

    // Remove past times for today
    if (selectedDate.toDateString() === new Date().toDateString()) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const filteredSlots = slots.filter(time => {
        const [hours, minutes] = time.split(":").map(Number);
        const slotTime = hours * 60 + minutes;
        return slotTime > currentTime;
      });
      
      return filteredSlots;
    }

    return slots;
  }, [scheduleForDay, bookedSlots, reservedSlots, selectedDate]);

  // تغییر handler انتخاب زمان
  const handleTimeSelect = async (time: string) => {
    console.log("🖱️ Time selected:", time);
    
    // اگر این زمان متعلق به کاربر فعلی است
    const isMyAppointment = appointments.some(
      appt => 
        appt.appointment_time === time && 
        currentUserPhone && 
        appt.patient_phone === currentUserPhone
    );
    
    if (isMyAppointment) {
      const myAppointment = appointments.find(
        appt => 
          appt.appointment_time === time && 
          appt.patient_phone === currentUserPhone
      );
      
      alert(
        `${t?.('booking.alreadyBookedByYou') || "شما قبلاً این زمان را رزرو کرده‌اید."}\n` +
        `کد رهگیری: ${myAppointment?.verification_code || 'ندارد'}`
      );
      return;
    }
    
    // 1. رزرو موقت در frontend و backend
    const reserved = await reserveTimeSlot(time);
    
    if (!reserved) {
      alert(t?.('booking.slotTaken') || "این زمان در دسترس نیست. ممکن است شخص دیگری در حال رزرو آن باشد.");
      return;
    }
    
    // 2. باز کردن dialog ثبت اطلاعات
    setSelectedTime(time);
    setShowDialog(true);
  };

  // تغییر handler موفقیت رزرو
  const handleBookingSuccess = useCallback((newAppointment: any) => {
    console.log("🎉 Booking success callback:", newAppointment);
    
    const appointmentTime = newAppointment.time?.slice(0, 5) || newAppointment.appointment_time?.slice(0, 5) || '';
    
    // 1. تأیید رزرو در context
    confirmBooking(
      appointmentTime,
      newAppointment.patient_phone,
      newAppointment.verification_code
    );
    
    // 2. بستن dialog
    setSelectedTime(null);
    setShowDialog(false);
    
    // 3. رفرش داده‌ها از سرور
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 500);
    
    // 4. نمایش پیام موفقیت
    setTimeout(() => {
      alert(t?.('booking.success') || "نوبت با موفقیت ثبت شد!");
    }, 300);
    
  }, [confirmBooking, t]);

  // اگر کاربر از رزرو منصرف شد
  const handleDialogClose = () => {
    if (selectedTime) {
      // آزاد کردن lock از backend
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetch(`/api/doctors/${doctorId}/check-slot?date=${dateStr}&time=${selectedTime}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', userId: 'user-' + Date.now() })
      }).catch(console.error);
      
      // آزاد کردن در context
      cancelReservation(selectedTime);
    }
    setShowDialog(false);
    setSelectedTime(null);
  };

  // Handle date change
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowDialog(false);
    
    // آپدیت تاریخ در context
    dispatch({ type: 'SET_DATE', payload: date });
  };

  // Force refresh button for debugging
  const handleForceRefresh = () => {
    console.log("🔄 Force refreshing data...");
    setRefreshTrigger(prev => prev + 1);
  };

  // Render
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative rounded-2xl shadow-xl p-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 border border-slate-700/50"
    >
      {/* Debug Info */}
      <div className="mb-4 p-3 bg-slate-900/70 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-300 font-semibold">وضعیت سیستم</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleForceRefresh}
              className="text-xs px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {t?.('booking.refresh') || "رفرش"}
            </button>
            <div className="text-xs text-slate-400">
              Lockها: <span className="text-amber-300">{reservedSlots.length}</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div>تاریخ: {selectedDate.toLocaleDateString('fa-IR')}</div>
            <div>رزرو شده: <span className="text-red-300">{bookedSlots.length}</span></div>
            <div>در حال رزرو: <span className="text-amber-300">{reservedSlots.length}</span></div>
            <div>موجود: <span className="text-green-300">{timeSlots.length}</span></div>
          </div>
          {reservedSlots.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-amber-400 mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                زمان‌های در حال رزرو:
              </div>
              <div className="flex flex-wrap gap-1">
                {reservedSlots.map((time, index) => (
                  <span key={index} className="px-2 py-1 bg-amber-900/30 rounded text-amber-300 animate-pulse">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-700/50 rounded-lg backdrop-blur-sm">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {t?.('booking.title') || "رزرو نوبت"}
            </h2>
            <p className="text-slate-300">
              {t?.('booking.doctor') || "دکتر"} {doctorName}
            </p>
          </div>
        </div>
        
        {/* نمایش خطا */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Date Selection */}
      <DateSelector
        availableDates={availableDates}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        isRTL={isRTL}
        t={t || ((key: string) => key)}
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="text-slate-400">
            {t?.('booking.loading') || "در حال دریافت اطلاعات..."}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-red-900/20 rounded-xl border border-red-800/50">
          <p className="text-red-300 font-medium mb-3">
            {t?.('booking.fetchError') || "خطا در دریافت اطلاعات"}
          </p>
          <button
            onClick={handleForceRefresh}
            className="px-4 py-2 bg-red-700/50 text-white rounded-lg hover:bg-red-700/70 transition"
          >
            {t?.('booking.retry') || "تلاش مجدد"}
          </button>
        </div>
      ) : (
        /* Time Slots */
        <TimeSlotGrid
          scheduleForDay={scheduleForDay}
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          selectedTime={selectedTime}
          bookedSlots={bookedSlots}
          reservedSlots={reservedSlots} // ارسال reservedSlots به TimeSlotGrid
          appointments={appointments}
          currentUserPhone={currentUserPhone}
          onTimeSelect={handleTimeSelect}
          isRTL={isRTL}
          t={t || ((key: string) => key)}
        />
      )}

      {/* Patient Registration Dialog */}
      <PatientRegistrationDialog
        isOpen={showDialog}
        onClose={handleDialogClose}
        selectedTime={selectedTime}
        selectedDate={selectedDate}
        doctorId={doctorId}
        doctorName={doctorName}
        isRTL={isRTL}
        t={t || ((key: string) => key)}
        onSuccess={handleBookingSuccess}
        currentUserPhone={currentUserPhone}
      />
    </div>
  );
}

// ==================== Main Export with Provider ====================
export default function ModernBookingSection(props: BookingSectionProps) {
  return (
    <BookingProvider doctorId={props.doctorId}>
      <ModernBookingSectionContent {...props} />
    </BookingProvider>
  );
}