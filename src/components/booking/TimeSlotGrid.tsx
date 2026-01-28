// 📁 components/booking/TimeSlotGrid.tsx
"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, User, Lock, AlertCircle, Key, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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

type TimeSlotGridProps = {
  scheduleForDay: Schedule | undefined;
  selectedDate: Date;
  timeSlots: string[];
  selectedTime: string | null;
  bookedSlots: string[];
  reservedSlots: string[]; // ✅ اضافه شدن reservedSlots
  appointments: Appointment[];
  currentUserPhone?: string;
  onTimeSelect: (time: string) => void;
  isRTL: boolean;
  t: (key: string) => string;
};

export default function TimeSlotGrid({
  scheduleForDay,
  selectedDate,
  timeSlots,
  selectedTime,
  bookedSlots,
  reservedSlots, // ✅ دریافت reservedSlots
  appointments,
  currentUserPhone,
  onTimeSelect,
  isRTL,
  t
}: TimeSlotGridProps) {

  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<Set<string>>(new Set());

  const formatDate = (date: Date): string => {
    if (isRTL) {
      const weekday = date.toLocaleDateString('fa-IR', { weekday: 'long' });
      const month = date.toLocaleDateString('fa-IR', { month: 'long' });
      const day = date.getDate();
      return `${weekday}، ${day} ${month}`;
    } else {
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const day = date.getDate();
      return `${weekday}, ${month} ${day}`;
    }
  };

  // ✅ بررسی اینکه آیا زمان متعلق به کاربر فعلی است
  const isBookedByCurrentUser = (time: string): boolean => {
    if (!currentUserPhone) return false;

    return appointments.some(
      (appt) =>
        appt.appointment_time === time &&
        appt.patient_phone === currentUserPhone &&
        (appt.status === "confirmed" || appt.status === "pending")
    );
  };

  // ✅ گرفتن اطلاعات نوبت کاربر فعلی
  const getCurrentUserAppointment = (time: string): Appointment | null => {
    if (!currentUserPhone) return null;

    return appointments.find(
      (appt) =>
        appt.appointment_time === time &&
        appt.patient_phone === currentUserPhone &&
        (appt.status === "confirmed" || appt.status === "pending")
    ) || null;
  };

  // ✅ بررسی اینکه آیا زمان توسط دیگران رزرو شده
  const isBookedByOthers = (time: string): boolean => {
    return bookedSlots.includes(time) && !isBookedByCurrentUser(time);
  };

  // ✅ بررسی اینکه آیا زمان در حال رزرو است (reserved)
  const isReserved = (time: string): boolean => {
    return reservedSlots.includes(time) && !isBookedByCurrentUser(time) && !isBookedByOthers(time);
  };

  // ✅ بررسی اینکه آیا زمان در حال پردازش است (loading)
  const isLoading = (time: string): boolean => {
    return loadingSlots.has(time);
  };

  // ✅ گرفتن متن وضعیت زمان
  const getAppointmentStatusText = (time: string): string => {
    if (isBookedByCurrentUser(time)) {
      return t('booking.myAppointment') || "نوبت من";
    }

    if (isReserved(time)) {
      return t('booking.reserving') || "در حال رزرو...";
    }

    if (isBookedByOthers(time)) {
      return t('booking.booked') || "رزرو شده";
    }

    if (selectedTime === time) {
      return t('booking.selected') || "انتخاب شده";
    }

    return t('booking.available') || "خالی";
  };

  // ✅ گرفتن نام بیمار برای زمان‌های رزرو شده
  const getBookedByInfo = (time: string): string => {
    const appointment = appointments.find(appt => appt.appointment_time === time);
    if (!appointment) return "";

    // اگر نوبت کاربر فعلی است
    if (currentUserPhone && appointment.patient_phone === currentUserPhone) {
      return t('booking.you') || "شما";
    }

    // نمایش نام اول بیمار
    const firstName = appointment.patient_name.split(' ')[0];
    return firstName || t('booking.anotherPatient') || "بیمار دیگر";
  };

  // 📁 components/booking/TimeSlotGrid.tsx
  // در تابع handleTimeClick:

  const handleTimeClick = async (time: string) => {
    if (isBookedByCurrentUser(time)) {
      const myAppointment = getCurrentUserAppointment(time);
      const code = myAppointment?.verification_code
        ? `${t('booking.code') || "کد"}: ${myAppointment.verification_code}`
        : '';

      // نمایش اطلاعات کامل نوبت کاربر
      alert(
        `🏥 ${t('booking.myAppointmentDetail') || "نوبت متعلق به شما"}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${t('booking.patient') || "بیمار"}: ${myAppointment?.patient_name || 'نامشخص'}\n` +
        `📞 ${t('booking.phone') || "تلفن"}: ${myAppointment?.patient_phone || 'ندارد'}\n` +
        `⏰ ${t('booking.time') || "زمان"}: ${time}\n` +
        `🔒 ${t('booking.status') || "وضعیت"}: ${t('booking.confirmed') || "تأیید شده"}\n` +
        `${code ? `🔐 ${code}\n` : ''}` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ ${t('booking.youCanView') || "می‌توانید اطلاعات نوبت خود را مشاهده کنید"}`
      );
      return;
    }

    if (isBookedByOthers(time)) {
      const appointment = appointments.find(appt => appt.appointment_time === time);
      const patientName = appointment?.patient_name || t('booking.unknownPatient') || "بیمار ناشناس";

      // استخراج نام و تخلص
      const nameParts = patientName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      alert(
        `🔒 ${t('booking.slotBooked') || "این زمان رزرو شده است"}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${t('booking.bookedFor') || "رزرو شده برای"}: ${patientName}\n` +
        `📝 ${t('booking.firstName') || "نام"}: ${firstName}\n` +
        `📝 ${t('booking.lastName') || "تخلص"}: ${lastName}\n` +
        `⏰ ${t('booking.time') || "زمان"}: ${time}\n` +
        `📞 ${t('booking.phone') || "تلفن"}: ${appointment?.patient_phone?.slice(-4) ? `***${appointment.patient_phone.slice(-4)}` : 'ندارد'}\n` +
        `🔒 ${t('booking.status') || "وضعیت"}: ${t('booking.booked') || "رزرو شده"}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ ${t('booking.cannotSelect') || "این زمان قابل انتخاب نیست. لطفاً زمان دیگری انتخاب کنید."}`
      );
      return;
    }

    if (isReserved(time)) {
      alert(
        `⏳ ${t('booking.slotReserved') || "این زمان در حال رزرو است"}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🚫 ${t('booking.reservedWarning') || "شخص دیگری در حال ثبت‌نام برای این زمان است"}\n` +
        `⏰ ${t('booking.time') || "زمان"}: ${time}\n` +
        `⏱️ ${t('booking.pleaseWait') || "لطفاً ۵ دقیقه صبر کنید"}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🔄 ${t('booking.autoRelease') || "اگر رزرو تکمیل نشود، این زمان به طور خودکار آزاد می‌شود"}`
      );
      return;
    }

    // نشان دادن loading state
    setLoadingSlots(prev => new Set([...prev, time]));

    try {
      await onTimeSelect(time);
    } finally {
      setTimeout(() => {
        setLoadingSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(time);
          return newSet;
        });
      }, 500);
    }
  };

  if (!scheduleForDay) {
    return (
      <div className="text-center py-8 bg-amber-900/20 rounded-xl border border-amber-800/50 backdrop-blur-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-amber-300 font-medium">
          {t('booking.noSchedule') || "دکتر در این تاریخ برنامه کاری ندارد"}
        </p>
        <p className="text-amber-400/80 text-sm mt-2">
          {t('booking.chooseAnotherDate') || "لطفاً تاریخ دیگری را انتخاب کنید"}
        </p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    // بررسی اینکه آیا هیچ زمان‌بندی وجود ندارد یا همه رزرو شده‌اند
    const hasAppointments = appointments.length > 0;
    const hasReservedSlots = reservedSlots.length > 0;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          {t('booking.availableSlots') || "زمان‌های موجود"} - {formatDate(selectedDate)}
        </h3>
        <div className="text-center py-8 bg-slate-700/30 rounded-xl backdrop-blur-sm">
          <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            {hasAppointments
              ? (t('booking.allSlotsBooked') || "تمام زمان‌ها رزرو شده‌اند")
              : (t('booking.noAvailableSlots') || "هیچ زمانی برای رزرو وجود ندارد")
            }
          </p>

          {hasReservedSlots && (
            <div className="mt-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-900/30 rounded-lg">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-amber-300 text-sm">
                  {reservedSlots.length} {t('booking.slotsReserving') || "زمان در حال رزرو"}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-slate-500">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-purple-600 to-indigo-500"></div>
                <span>{t('booking.bookedSlots') || "رزرو شده"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-700 to-orange-700 animate-pulse"></div>
                <span>{t('booking.reservingSlots') || "در حال رزرو"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>{t('booking.locked') || "قفل شده"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-cyan-400" />
        {t('booking.availableSlots') || "زمان‌های موجود"} - {formatDate(selectedDate)}
        <span className="text-xs bg-slate-700/50 px-2 py-1 rounded-lg">
          {bookedSlots.length} {t('booking.booked') || "رزرو شده"} / {timeSlots.length + bookedSlots.length + reservedSlots.length} {t('booking.total') || "کل"}
        </span>
        {reservedSlots.length > 0 && (
          <span className="text-xs bg-amber-900/50 px-2 py-1 rounded-lg flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {reservedSlots.length} {t('booking.reserving') || "در حال رزرو"}
          </span>
        )}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {timeSlots.map((time) => {
          const isMyAppointment = isBookedByCurrentUser(time);
          const isBooked = isBookedByOthers(time);
          const isReservedSlot = isReserved(time);
          const isLoadingSlot = isLoading(time);
          const isSelected = selectedTime === time;
          const myAppointment = getCurrentUserAppointment(time);
          const bookedBy = getBookedByInfo(time);

          const isDisabled = isBooked || isReservedSlot || isMyAppointment || isLoadingSlot;

          return (
            <motion.button
              key={time}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              onClick={() => handleTimeClick(time)}
              onMouseEnter={() => !isDisabled && setHoveredTime(time)}
              onMouseLeave={() => setHoveredTime(null)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-xl text-center transition-all duration-300
                backdrop-blur-sm overflow-hidden group min-h-[100px]
                ${isLoadingSlot
                  ? 'bg-gradient-to-br from-cyan-700/60 to-blue-700/60 text-cyan-200 cursor-wait border border-cyan-600/50'
                  : isMyAppointment
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/20 border border-purple-500/50 cursor-pointer hover:shadow-purple-500/30'
                    : isReservedSlot
                      ? 'bg-gradient-to-br from-amber-700/60 to-orange-700/60 text-amber-200 cursor-wait border border-amber-600/50 animate-pulse'
                      : isBooked
                        ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700 opacity-80'
                        : isSelected
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
                          : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-700/70 hover:shadow-md hover:shadow-cyan-500/10'
                }
              `}
            >
              {/* Loading Spinner */}
              {isLoadingSlot && (
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-900/30 rounded-xl">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              )}

              {/* کد رهگیری برای نوبت کاربر */}
              {isMyAppointment && myAppointment?.verification_code && (
                <div className="absolute top-1 right-1">
                  <div className="bg-black/40 px-2 py-1 rounded text-xs font-bold text-purple-300 border border-purple-500/40">
                    <Key className="w-3 h-3 inline mr-1" />
                    {myAppointment.verification_code.slice(0, 3)}
                  </div>
                </div>
              )}

              {/* زمان */}
              <div className={`text-lg font-bold mb-1 ${isLoadingSlot ? 'opacity-50' : ''
                }`}>
                {time}
              </div>

              {/* آیکون وضعیت */}
              <div className="absolute top-2 left-2">
                {isLoadingSlot ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : isMyAppointment ? (
                  <User className="w-4 h-4 text-purple-300" />
                ) : isReservedSlot ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : isBooked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : null}
              </div>

              {/* متن وضعیت */}
              <div className={`text-xs font-medium mt-2 ${isMyAppointment ? 'text-purple-200' :
                  isReservedSlot ? 'text-amber-300' :
                    isBooked ? 'text-slate-400' :
                      isSelected ? 'text-emerald-200' : 'text-slate-400'
                } ${isLoadingSlot ? 'opacity-50' : ''}`}>
                {getAppointmentStatusText(time)}

                {/* اطلاعات اضافی */}
                {isMyAppointment && myAppointment?.verification_code && (
                  <div className="mt-1 text-[10px] text-purple-300 font-mono">
                    {t('booking.code') || "کد"}: {myAppointment.verification_code}
                  </div>
                )}

                {isBooked && bookedBy && (
                  <div className="mt-1 text-[10px] text-slate-500">
                    {t('booking.by') || "توسط"}: {bookedBy}
                  </div>
                )}

                {isReservedSlot && (
                  <div className="mt-1 text-[10px] text-amber-400 animate-pulse">
                    {t('booking.pleaseWait') || "لطفاً صبر کنید..."}
                  </div>
                )}
              </div>

              {/* افکت برای نوبت کاربر */}
              {isMyAppointment && !isLoadingSlot && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl" />
              )}

              {/* افکت برای زمان‌های در حال رزرو */}
              {isReservedSlot && !isLoadingSlot && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-900/10 animate-pulse rounded-xl" />
                  <Lock className="w-8 h-8 text-amber-600/50" />
                </div>
              )}

              {/* افکت قفل برای زمان‌های رزرو شده */}
              {isBooked && !isMyAppointment && !isLoadingSlot && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl flex items-center justify-center">
                  <Lock className="w-8 h-8 text-slate-600/50" />
                </div>
              )}

              {/* افکت انتخاب */}
              {isSelected && !isBooked && !isMyAppointment && !isReservedSlot && !isLoadingSlot && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-emerald-400/50"
                  initial={false}
                  animate={{ borderColor: "rgba(52, 211, 153, 0.5)" }}
                />
              )}

              {/* Tooltip on hover */}
              {hoveredTime === time && !isDisabled && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg whitespace-nowrap z-10 shadow-lg border border-slate-700">
                  {t('booking.clickToBook') || "برای رزرو کلیک کنید"}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-700"></div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* راهنمای رنگ‌ها */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-purple-600 to-indigo-500"></div>
            <span>{t('booking.myAppointment') || "نوبت من"} ({t('booking.canView') || "مشاهده"})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-700 to-orange-700 animate-pulse"></div>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{t('booking.reserving') || "در حال رزرو"} ({t('booking.waiting') || "منتظر بمانید"})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-800/60 border border-slate-700"></div>
            <Lock className="w-3 h-3" />
            <span>{t('booking.bookedByOthers') || "رزرو شده توسط دیگران"} ({t('booking.locked') || "قفل شده"})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-600 to-teal-500"></div>
            <span>{t('booking.selectedSlot') || "انتخاب شده"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-700/50 border border-slate-600"></div>
            <span>{t('booking.availableSlot') || "خالی"} ({t('booking.canBook') || "قابل رزرو"})</span>
          </div>
        </div>

        <p className="text-slate-500 text-xs">
          {t('booking.slotHelp') || "زمان‌های رزرو شده قفل می‌شوند و قابل انتخاب مجدد نیستند."}
        </p>

        {/* توضیح برای reserved slots */}
        {reservedSlots.length > 0 && (
          <div className="mt-3 p-2 bg-amber-900/20 rounded-lg border border-amber-800/30">
            <p className="text-amber-300 text-xs flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              {t('booking.reservedInfo') || `${reservedSlots.length} زمان در حال رزرو هستند. این زمان‌ها ممکن است پس از ۵ دقیقه آزاد شوند اگر رزرو تکمیل نشود.`}
            </p>
          </div>
        )}

        {/* توضیح برای کاربران لاگین کرده */}
        {currentUserPhone && (
          <div className="mt-3 p-2 bg-purple-900/20 rounded-lg border border-purple-800/30">
            <p className="text-purple-300 text-xs flex items-center gap-2">
              <User className="w-3 h-3" />
              {t('booking.loggedInHelp') || "شما با شماره وارد شده‌اید. نوبت‌های قبلی شما با رنگ بنفش نشان داده می‌شوند."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}