"use client";

import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { I18nContext } from "@/context/I18nContext";
import { CalendarDays, Loader2, AlertCircle, RefreshCw } from "lucide-react";
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
  bookedSlots: string[]
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

export default function ModernBookingSection({
  schedules,
  doctorId,
  doctorName,
  currentUserPhone
}: BookingSectionProps) {
  const { lang, t } = useContext(I18nContext);
  const isRTL = lang === 'fa';
  
  // State Management
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ اضافه کردن trigger برای رفرش

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

  // Fetch appointments data
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
        
        // استخراج ساعت‌های رزرو شده (بدون ثانیه)
        const bookedTimes = data
          .filter((appt: any) => {
            const hasValidStatus = appt.status === "confirmed" || appt.status === "pending";
            return hasValidStatus;
          })
          .map((appointment: any) => {
            return removeSeconds(appointment.appointment_time);
          });
        
        console.log("📊 Final booked slots:", bookedTimes);
        setBookedSlots(bookedTimes);
        
        // ذخیره اطلاعات کامل appointments
        const fullAppointments: Appointment[] = data.map((appointment: any) => ({
          appointment_time: removeSeconds(appointment.appointment_time),
          patient_name: appointment.patient_name,
          patient_phone: appointment.patient_phone,
          verification_code: appointment.verification_code,
          status: appointment.status || "confirmed"
        }));
        
        console.log("📊 Full appointments:", fullAppointments);
        setAppointments(fullAppointments);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch appointments:", err);
      setError(err.message || "خطا در دریافت اطلاعات");
      setBookedSlots([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, doctorId]);

  useEffect(() => {
    console.log("🔁 useEffect triggered:", {
      selectedDate: selectedDate.toDateString(),
      doctorId,
      scheduleForDay,
      refreshTrigger // ✅ اضافه شدن refreshTrigger
    });
    
    if (doctorId) {
      fetchAppointmentsData();
    }
  }, [selectedDate, doctorId, refreshTrigger, fetchAppointmentsData]); // ✅ اضافه شدن refreshTrigger

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
      bookedSlots
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
  }, [scheduleForDay, bookedSlots, selectedDate]);

  // Handle time slot selection
  const handleTimeSelect = (time: string) => {
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
    
    // اگر قبلاً توسط کس دیگری رزرو شده باشد
    if (bookedSlots.includes(time)) {
      const bookedAppointment = appointments.find(appt => appt.appointment_time === time);
      alert(
        `${t?.('booking.alreadyBooked') || "این زمان قبلاً رزرو شده است."}\n` +
        (bookedAppointment?.patient_name ? `توسط: ${bookedAppointment.patient_name}` : "")
      );
      return;
    }
    
    setSelectedTime(time);
    setShowDialog(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowDialog(false);
    setSelectedTime(null);
  };

  // ✅ **مهم: Handle booking success با auto-refresh**
  const handleBookingSuccess = useCallback((newAppointment: any) => {
    console.log("🎉 Booking success callback:", newAppointment);
    
    // تبدیل زمان به فرمت بدون ثانیه
    const appointmentTime = removeSeconds(newAppointment.time || newAppointment.appointment_time);
    
    console.log("🔄 Adding to state immediately:", {
      time: appointmentTime,
      phone: newAppointment.patient_phone,
      code: newAppointment.verification_code
    });
    
    // 1. اضافه کردن فوری به state برای نمایش سریع
    const newAppointmentData: Appointment = {
      appointment_time: appointmentTime,
      patient_name: newAppointment.patient_name,
      patient_phone: newAppointment.patient_phone,
      verification_code: newAppointment.verification_code,
      status: newAppointment.status || "confirmed"
    };
    
    setBookedSlots(prev => {
      const newSlots = [...prev, appointmentTime];
      console.log("🔒 Booked slots updated:", newSlots);
      return newSlots;
    });
    
    setAppointments(prev => {
      const newAppointments = [...prev, newAppointmentData];
      console.log("📋 Appointments updated:", newAppointments);
      return newAppointments;
    });
    
    // 2. رفرش دستی داده‌ها از سرور
    console.log("🔄 Manual refresh triggered");
    setRefreshTrigger(prev => prev + 1);
    
    // 3. بستن dialog و reset
    setSelectedTime(null);
    setShowDialog(false);
    
    // 4. نمایش پیام موفقیت
    setTimeout(() => {
      alert(t?.('booking.refreshSuccess') || "نوبت با موفقیت ثبت شد! لیست ساعت‌ها به‌روز شد.");
    }, 300);
    
  }, [t]);

  // Handle date change
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
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
          </div>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div>تاریخ: {selectedDate.toLocaleDateString('fa-IR')}</div>
            <div>زمان‌های رزرو شده: <span className="text-red-300">{bookedSlots.length}</span></div>
            <div>زمان‌های موجود: <span className="text-green-300">{timeSlots.length}</span></div>
            <div>کل نوبت‌ها: {appointments.length}</div>
          </div>
          {bookedSlots.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-cyan-400 mb-1">ساعت‌های رزرو شده:</div>
              <div className="flex flex-wrap gap-1">
                {bookedSlots.map((time, index) => (
                  <span key={index} className="px-2 py-1 bg-red-900/30 rounded text-red-300">
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