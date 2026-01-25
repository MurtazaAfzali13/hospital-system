"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, UserPlus, X, CheckCircle,
  Mail, Home, PhoneCall, Droplets, Calendar,
  Clock, Hash, Loader2, AlertCircle, Shield,
  Heart, MapPin, Cake // ✅ تغییر BirthdayCake به Cake
} from "lucide-react";

type Patient = {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  blood_group?: string;
  address?: string;
  emergency_contact?: string;
};

type PatientRegistrationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string | null;
  selectedDate: Date;
  doctorId: string;
  doctorName: string;
  isRTL: boolean;
  t: (key: string) => string;
  onSuccess: (appointment: any) => void;
  currentUserPhone?: string;
};

const isValidAfghanPhone = (phone: string): boolean => {
  if (!phone) return false;

  const digits = phone.replace(/\D/g, '');

  return (digits.length === 9 && digits.startsWith('7')) ||
    (digits.length === 10 && digits.startsWith('07'));
};

const formatAfghanPhone = (phone: string): string => {
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

const getPhoneValidationMessage = (phone: string, lang: 'fa' | 'en' = 'fa'): string => {
  if (!phone || phone.trim() === '') {
    return lang === 'fa' ? 'شماره تلفن الزامی است' : 'Phone number is required';
  }

  const digits = phone.replace(/\D/g, '');

  if (digits.length !== 9 && digits.length !== 10) {
    return lang === 'fa'
      ? `شماره تلفن باید ۹ یا ۱۰ رقم باشد (${digits.length} رقم)`
      : `Phone number must be 9 or 10 digits (${digits.length} digits)`;
  }

  if (digits.length === 10 && !digits.startsWith('07')) {
    return lang === 'fa'
      ? 'شماره ۱۰ رقمی باید با ۰۷ شروع شود'
      : '10-digit number must start with 07';
  }

  if (digits.length === 9 && !digits.startsWith('7')) {
    return lang === 'fa'
      ? 'شماره ۹ رقمی باید با ۷ شروع شود'
      : '9-digit number must start with 7';
  }

  return lang === 'fa'
    ? 'شماره تلفن معتبر است ✓'
    : 'Valid phone number ✓';
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// تابع برای ایجاد metadata مطابق API
const createMetadata = (patientData: Patient) => {
  const metadata: Record<string, any> = {};

  if (patientData.email) metadata.email = patientData.email;
  if (patientData.gender) metadata.gender = patientData.gender;
  if (patientData.address) metadata.address = patientData.address;
  if (patientData.birth_date) metadata.birth_date = patientData.birth_date;
  if (patientData.blood_group) metadata.blood_group = patientData.blood_group;
  if (patientData.emergency_contact) metadata.emergency_contact = patientData.emergency_contact;

  return metadata;
};

// تابع برای format تاریخ به YYYY-MM-DD
const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  return dateString; // API شما تاریخ را به همین فرمت می‌خواهد
};

export default function PatientRegistrationDialog({
  isOpen,
  onClose,
  selectedTime,
  selectedDate,
  doctorId,
  doctorName,
  isRTL,
  t,
  onSuccess,
  currentUserPhone
}: PatientRegistrationDialogProps) {
  // هر بار که dialog باز می‌شود، state را ریست کن
  const [step, setStep] = useState<"initial" | "form" | "success">("initial");
  const [patientData, setPatientData] = useState<Patient>({
    first_name: "",
    last_name: "",
    phone_number: currentUserPhone || "",
    email: "",
    birth_date: "",
    gender: "",
    blood_group: "",
    address: "",
    emergency_contact: ""
  });
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  // 🔴 **مهم: وقتی dialog باز یا بسته می‌شود state را ریست کن**
  useEffect(() => {
    if (isOpen) {
      console.log("🔵 Dialog opened for time:", selectedTime);
      // ریست state به مقادیر اولیه
      setStep("initial");
      setPatientData({
        first_name: "",
        last_name: "",
        phone_number: currentUserPhone || "",
        email: "",
        birth_date: "",
        gender: "",
        blood_group: "",
        address: "",
        emergency_contact: ""
      });
      setVerificationCode("");
      setFormErrors({});
      setLoading(false);
      setAppointmentDetails(null);
    }
  }, [isOpen, selectedTime, currentUserPhone]);

  const handleInitialChoice = () => {
    setStep("form");
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // اعتبارسنجی نام
    if (!patientData.first_name?.trim()) {
      errors.first_name = isRTL ? "نام الزامی است" : "First name is required";
    }

    // اعتبارسنجی نام خانوادگی
    if (!patientData.last_name?.trim()) {
      errors.last_name = isRTL ? "نام خانوادگی الزامی است" : "Last name is required";
    }

    // اعتبارسنجی تلفن
    if (!patientData.phone_number?.trim()) {
      errors.phone_number = isRTL ? "شماره تلفن الزامی است" : "Phone number is required";
    } else if (!isValidAfghanPhone(patientData.phone_number)) {
      errors.phone_number = getPhoneValidationMessage(patientData.phone_number, isRTL ? 'fa' : 'en');
    }

    // اعتبارسنجی ایمیل (اگر وارد شده)
    if (patientData.email && !isValidEmail(patientData.email)) {
      errors.email = isRTL ? "فرمت ایمیل معتبر نیست" : "Invalid email format";
    }

    // اعتبارسنجی تاریخ تولد (اگر وارد شده)
    if (patientData.birth_date) {
      const birthDate = new Date(patientData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        errors.birth_date = isRTL ? "تاریخ تولد نمی‌تواند در آینده باشد" : "Birth date cannot be in the future";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      alert(firstError);
      return;
    }

    if (!selectedTime) {
      alert(isRTL ? "زمان انتخاب نشده است" : "Time not selected");
      return;
    }

    setLoading(true);
    try {
      // فرمت شماره تلفن
      const formattedPhone = formatAfghanPhone(patientData.phone_number);
      const fullName = `${patientData.first_name} ${patientData.last_name}`;

      console.log("📅 Booking appointment with data:", {
        time: selectedTime,
        date: selectedDate.toISOString().split('T')[0],
        patient_name: fullName,
        patient_phone: formattedPhone,
        doctorId,
        metadata: createMetadata(patientData)
      });

      // 🔴 **مهم: بررسی double booking قبل از ارسال**
      const dateStr = selectedDate.toISOString().split('T')[0];
      const quickCheckRes = await fetch(
        `/api/doctors/${doctorId}/appointments?date=${dateStr}`
      );

      if (quickCheckRes.ok) {
        const existingAppointments = await quickCheckRes.json();
        const timeWithoutSeconds = selectedTime.slice(0, 5);
        const isAlreadyBooked = existingAppointments.some(
          (appt: any) => {
            const appointmentTime = appt.appointment_time?.slice(0, 5);
            const isSameTime = appointmentTime === timeWithoutSeconds;
            const isConfirmed = appt.status === "confirmed" || appt.status === "pending";
            return isSameTime && isConfirmed;
          }
        );

        if (isAlreadyBooked) {
          alert(isRTL ?
            "❌ متأسفانه این زمان توسط شخص دیگری رزرو شده است. لطفاً زمان دیگری انتخاب کنید." :
            "❌ This time slot has been booked by someone else. Please choose another time."
          );
          setLoading(false);
          return;
        }
      }

      // ساخت metadata مطابق API شما
      const metadata = createMetadata(patientData);

      console.log("📦 Sending metadata to API:", metadata);

      // ثبت نوبت با تمام اطلاعات
      const bookingRes = await fetch(`/api/doctors/${doctorId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: selectedTime,
          date: dateStr,
          patient_name: fullName, // API شما این فیلد را می‌خواهد
          patient_phone: formattedPhone,
          email: patientData.email || undefined,
          birth_date: patientData.birth_date ? formatDateForAPI(patientData.birth_date) : undefined,
          gender: patientData.gender || undefined,
          blood_group: patientData.blood_group || undefined,
          address: patientData.address || undefined,
          emergency_contact: patientData.emergency_contact || undefined
          // metadata در API شما به طور خودکار از این فیلدها ساخته می‌شود
        })
      });

      const bookingResult = await bookingRes.json();
      console.log("📅 Booking result:", bookingResult);

      if (!bookingResult.success) {
        throw new Error(bookingResult.error || (isRTL ? "خطا در ثبت نوبت" : "Error booking appointment"));
      }

      // موفقیت
      // 🔴 **مهم: کد رهگیری واقعی از API را ذخیره کن**
      const realVerificationCode = bookingResult.appointment?.verification_code;
      console.log("✅ Real verification code:", realVerificationCode);

      if (!realVerificationCode) {
        console.warn("⚠️ No verification code in API response");
      }

      // ذخیره جزئیات نوبت برای نمایش
      setAppointmentDetails({
        ...bookingResult.appointment,
        patient_full_name: fullName,
        patient_data: patientData
      });

      setVerificationCode(realVerificationCode || "ERROR");
      setStep("success");

      // داده‌های جدید را به parent ارسال کن
      onSuccess({
        ...bookingResult.appointment,
        time: selectedTime,
        patient_name: fullName,
        patient_phone: formattedPhone,
        verification_code: realVerificationCode
      });

    } catch (error: any) {
      console.error("❌ Booking error:", error);
      alert(`${t('booking.error') || 'خطا'}: ${error.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Patient, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));

    // پاک کردن خطای این فیلد
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const resetDialog = () => {
    // 🔴 **مهم: همه stateها را کاملاً ریست کن**
    setStep("initial");
    setPatientData({
      first_name: "",
      last_name: "",
      phone_number: currentUserPhone || "",
      email: "",
      birth_date: "",
      gender: "",
      blood_group: "",
      address: "",
      emergency_contact: ""
    });
    setFormErrors({});
    setVerificationCode("");
    setLoading(false);
    setAppointmentDetails(null);
    onClose();
  };

  const formatDate = (date: Date) => {
    const locale = isRTL ? "fa-IR" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // فرمت تاریخ برای نمایش
  const formatBirthDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'fa-IR' : 'en-US');
  };

  // 🔴 **مهم: اگر زمان انتخاب نشده، dialog را نشان نده**
  if (!isOpen || !selectedTime) return null;

  return (
    <AnimatePresence>
      {isOpen && selectedTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    <User className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {step === "success"
                        ? (t('booking.successTitle') || (isRTL ? "نوبت با موفقیت ثبت شد!" : "Appointment Booked Successfully!"))
                        : (t('booking.completeInfo') || (isRTL ? "تکمیل اطلاعات رزرو" : "Complete Booking"))
                      }
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTime}</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedDate)}</span>
                      {step === "success" && verificationCode && verificationCode !== "ERROR" && (
                        <>
                          <span>•</span>
                          <Shield className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">{isRTL ? "کد: " : "Code: "}{verificationCode}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetDialog}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition"
                  disabled={loading}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === "initial" && (
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex p-3 bg-cyan-900/30 rounded-full mb-4 border border-cyan-800/50">
                      <User className="w-12 h-12 text-cyan-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3">
                      {t('booking.welcome') || (isRTL ? "رزرو نوبت پزشکی" : "Medical Appointment Booking")}
                    </h4>
                    <p className="text-slate-300 mb-2">
                      {doctorName}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 font-medium">{selectedTime}</span>
                      <span className="text-slate-500">•</span>
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300">{formatDate(selectedDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <h5 className="font-semibold text-white mb-3">
                        {isRTL ? "برای رزرو نوبت اطلاعات خود را وارد کنید:" : "Enter your information to book an appointment:"}
                      </h5>

                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={handleInitialChoice}
                          className="w-full p-4 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-800/50 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-900/40 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-900/50 rounded-lg">
                              <UserPlus className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                              <h6 className="font-bold text-white text-lg">
                                {isRTL ? "ثبت اطلاعات و رزرو" : "Enter Information & Book"}
                              </h6>
                              <p className="text-sm text-slate-300 mt-1">
                                {isRTL
                                  ? "اطلاعات شخصی خود را وارد کرده و نوبت را رزرو کنید"
                                  : "Enter your personal information and book the appointment"}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <button
                      onClick={resetDialog}
                      className="w-full py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition"
                    >
                      {t('booking.cancel') || (isRTL ? "انصراف" : "Cancel")}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "form" && (
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex p-3 bg-amber-900/30 rounded-full mb-4 border border-amber-800/50">
                      <User className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {t('booking.personalInfo') || (isRTL ? "اطلاعات شخصی" : "Personal Information")}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {isRTL ? "لطفاً اطلاعات خود را با دقت وارد کنید" : "Please enter your information carefully"}
                    </p>

                    {/* نمایش زمان و تاریخ */}
                    <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-800/30">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300 font-medium">{selectedTime}</span>
                        </div>
                        <div className="h-4 w-px bg-amber-800/50"></div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300">{formatDate(selectedDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* فرم اطلاعات کامل */}
                  <div className="space-y-4">
                    {/* نام و نام خانوادگی */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {t('booking.firstName') || "نام"} <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={patientData.first_name}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            className={`w-full p-3 rounded-xl bg-slate-800/50 border ${formErrors.first_name ? 'border-red-500/50' : 'border-slate-600'
                              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10`}
                            placeholder={isRTL ? "علی" : "Ali"}
                            disabled={loading}
                          />
                          <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        </div>
                        {formErrors.first_name && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.first_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {t('booking.lastName') || "نام خانوادگی"} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={patientData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className={`w-full p-3 rounded-xl bg-slate-800/50 border ${formErrors.last_name ? 'border-red-500/50' : 'border-slate-600'
                            } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition`}
                          placeholder={isRTL ? "محمدی" : "Mohammadi"}
                          disabled={loading}
                        />
                        {formErrors.last_name && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    {/* تلفن */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('booking.phone') || "شماره تماس"} <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={patientData.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          className={`w-full p-3 rounded-xl bg-slate-800/50 border ${formErrors.phone_number ? 'border-red-500/50' : 'border-slate-600'
                            } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10`}
                          placeholder={isRTL ? "۰۷۸۳۰۰۰۲۴۷" : "0783000247"}
                          dir="ltr"
                          disabled={!!currentUserPhone || loading}
                        />
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      </div>
                      {formErrors.phone_number ? (
                        <p className="text-red-400 text-xs mt-1">{formErrors.phone_number}</p>
                      ) : patientData.phone_number && isValidAfghanPhone(patientData.phone_number) && (
                        <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {isRTL ? "شماره تلفن معتبر است" : "Valid phone number"}
                        </p>
                      )}
                      {currentUserPhone && (
                        <p className="text-cyan-400 text-xs mt-1">
                          {isRTL ? "شماره تلفن از حساب کاربری شما استفاده می‌شود" : "Phone number from your account will be used"}
                        </p>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        {isRTL ? "فرمت: ۰۷۸۳۰۰۰۲۴۷ یا ۷۸۳۰۰۰۲۴۷" : "Format: 0783000247 or 783000247"}
                      </p>
                    </div>

                    {/* ایمیل */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('booking.email') || "ایمیل"} <span className="text-slate-500">(اختیاری)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={patientData.email || ""}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full p-3 rounded-xl bg-slate-800/50 border ${formErrors.email ? 'border-red-500/50' : 'border-slate-600'
                            } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10`}
                          placeholder={isRTL ? "example@email.com" : "example@email.com"}
                          disabled={loading}
                        />
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      </div>
                      {formErrors.email && (
                        <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    {/* تاریخ تولد و جنسیت */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {t('booking.birthDate') || "تاریخ تولد"} <span className="text-slate-500">(اختیاری)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={patientData.birth_date || ""}
                            onChange={(e) => handleInputChange('birth_date', e.target.value)}
                            className={`w-full p-3 rounded-xl bg-slate-800/50 border ${formErrors.birth_date ? 'border-red-500/50' : 'border-slate-600'
                              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10`}
                            disabled={loading}
                            max={new Date().toISOString().split('T')[0]}
                          />
                          <Cake className="absolute left-3 top-3 w-4 h-4 text-slate-500" /> {/* ✅ این خط باید Cake باشد */}
                        </div>
                        {formErrors.birth_date && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.birth_date}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {t('booking.gender') || "جنسیت"} <span className="text-slate-500">(اختیاری)</span>
                        </label>
                        <div className="relative">
                          <select
                            value={patientData.gender || ""}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition appearance-none pr-10"
                            disabled={loading}
                          >
                            <option value="">{isRTL ? "انتخاب کنید" : "Select"}</option>
                            <option value="male">{isRTL ? "مرد" : "Male"}</option>
                            <option value="female">{isRTL ? "زن" : "Female"}</option>
                            <option value="other">{isRTL ? "سایر" : "Other"}</option>
                          </select>
                          <User className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                    </div>

                    {/* گروه خونی */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('booking.bloodGroup') || "گروه خونی"} <span className="text-slate-500">(اختیاری)</span>
                      </label>
                      <div className="relative">
                        <select
                          value={patientData.blood_group || ""}
                          onChange={(e) => handleInputChange('blood_group', e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition appearance-none pr-10"
                          disabled={loading}
                        >
                          <option value="">{isRTL ? "انتخاب کنید" : "Select"}</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="unknown">{isRTL ? "نامشخص" : "Unknown"}</option>
                        </select>
                        <Droplets className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    {/* آدرس */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('booking.address') || "آدرس"} <span className="text-slate-500">(اختیاری)</span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={patientData.address || ""}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={3}
                          className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10"
                          placeholder={isRTL ? "آدرس کامل محل سکونت" : "Complete residential address"}
                          disabled={loading}
                        />
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    {/* شماره اضطراری */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('booking.emergencyContact') || "شماره تماس اضطراری"} <span className="text-slate-500">(اختیاری)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={patientData.emergency_contact || ""}
                          onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10"
                          placeholder={isRTL ? "۰۷۸۳۰۰۰۲۴۷" : "0783000247"}
                          dir="ltr"
                          disabled={loading}
                        />
                        <PhoneCall className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* اطلاعاتی که ذخیره خواهد شد */}
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      {isRTL ? "اطلاعاتی که ذخیره خواهد شد:" : "Information that will be saved:"}
                    </h5>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>• {isRTL ? "نام کامل بیمار" : "Patient full name"}: <span className="text-slate-300">{patientData.first_name} {patientData.last_name}</span></p>
                      <p>• {isRTL ? "شماره تلفن" : "Phone number"}: <span className="text-slate-300">{patientData.phone_number || "-"}</span></p>
                      <p>• {isRTL ? "ایمیل" : "Email"}: <span className="text-slate-300">{patientData.email || "-"}</span></p>
                      <p>• {isRTL ? "تاریخ تولد" : "Birth date"}: <span className="text-slate-300">{patientData.birth_date ? formatBirthDate(patientData.birth_date) : "-"}</span></p>
                      <p>• {isRTL ? "جنسیت" : "Gender"}: <span className="text-slate-300">{patientData.gender || "-"}</span></p>
                      <p>• {isRTL ? "گروه خونی" : "Blood group"}: <span className="text-slate-300">{patientData.blood_group || "-"}</span></p>
                    </div>
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("initial")}
                      className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      {t('booking.back') || (isRTL ? "بازگشت" : "Back")}
                    </button>
                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('booking.booking') || (isRTL ? "در حال رزرو..." : "Booking...")}
                        </>
                      ) : (
                        <>
                          {t('booking.confirmBooking') || (isRTL ? "تأیید و رزرو نوبت" : "Confirm & Book")}
                          <CheckCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-slate-500 text-xs text-center">
                      {isRTL
                        ? "فیلدهای ستاره‌دار (*) الزامی هستند. اطلاعات شما به صورت امن ذخیره خواهد شد."
                        : "Fields with (*) are required. Your information will be stored securely."
                      }
                    </p>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex p-4 bg-green-900/30 rounded-full mb-4 border border-green-800/50">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {t('booking.successTitle') || (isRTL ? "نوبت با موفقیت ثبت شد!" : "Appointment Booked Successfully!")}
                    </h4>
                    <p className="text-slate-300">
                      {doctorName}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full mt-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 font-medium">{selectedTime}</span>
                      <span className="text-slate-500">•</span>
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-green-300">{formatDate(selectedDate)}</span>
                    </div>
                  </div>

                  {/* کد رهگیری - فقط اگر کد واقعی وجود دارد */}
                  {verificationCode && verificationCode !== "ERROR" ? (
                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-5 border border-cyan-800/50">
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Hash className="w-5 h-5 text-cyan-400" />
                          <h5 className="font-semibold text-white">
                            {t('booking.trackingCode') || (isRTL ? "کد رهگیری نوبت" : "Appointment Tracking Code")}
                          </h5>
                        </div>
                        <div className="bg-black/30 px-6 py-4 rounded-lg border border-cyan-700/50">
                          <code className="text-3xl font-bold tracking-widest text-cyan-400">
                            {verificationCode}
                          </code>
                        </div>
                        <p className="text-slate-400 text-sm mt-3">
                          {isRTL
                            ? "این کد را برای پیگیری و ورود به کلینیک نگه دارید"
                            : "Keep this code for tracking and clinic entry"
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl p-5 border border-amber-800/50">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                        <h5 className="font-semibold text-white mb-2">
                          {isRTL ? "کد رهگیری در دسترس نیست" : "Tracking Code Not Available"}
                        </h5>
                        <p className="text-amber-300 text-sm">
                          {isRTL
                            ? "نوبت شما ثبت شد اما کد رهگیری دریافت نشد. لطفاً با پشتیبانی تماس بگیرید."
                            : "Your appointment was booked but tracking code wasn't received. Please contact support."
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* اطلاعات کامل نوبت */}
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-400" />
                      {isRTL ? "اطلاعات کامل نوبت:" : "Complete Appointment Details:"}
                    </h5>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">{isRTL ? "پزشک:" : "Doctor:"}</div>
                          <div className="text-white font-medium">{doctorName}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">{isRTL ? "زمان:" : "Time:"}</div>
                          <div className="text-white font-medium">{selectedTime}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">{isRTL ? "تاریخ:" : "Date:"}</div>
                          <div className="text-white font-medium">{formatDate(selectedDate)}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">{isRTL ? "کد رهگیری:" : "Tracking Code:"}</div>
                          <div className="text-cyan-400 font-bold">{verificationCode || "-"}</div>
                        </div>
                      </div>

                      {/* اطلاعات بیمار */}
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h6 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-400" />
                          {isRTL ? "اطلاعات بیمار:" : "Patient Information:"}
                        </h6>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">{isRTL ? "نام کامل:" : "Full Name:"} </span>
                            <span className="text-white">{patientData.first_name} {patientData.last_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">{isRTL ? "تلفن:" : "Phone:"} </span>
                            <span className="text-white">{patientData.phone_number}</span>
                          </div>
                          {patientData.email && (
                            <div>
                              <span className="text-slate-400">{isRTL ? "ایمیل:" : "Email:"} </span>
                              <span className="text-white">{patientData.email}</span>
                            </div>
                          )}
                          {patientData.gender && (
                            <div>
                              <span className="text-slate-400">{isRTL ? "جنسیت:" : "Gender:"} </span>
                              <span className="text-white">{patientData.gender === 'male' ? (isRTL ? 'مرد' : 'Male') : isRTL ? 'زن' : 'Female'}</span>
                            </div>
                          )}
                          {patientData.birth_date && (
                            <div>
                              <span className="text-slate-400">{isRTL ? "تاریخ تولد:" : "Birth Date:"} </span>
                              <span className="text-white">{formatBirthDate(patientData.birth_date)}</span>
                            </div>
                          )}
                          {patientData.blood_group && (
                            <div>
                              <span className="text-slate-400">{isRTL ? "گروه خونی:" : "Blood Group:"} </span>
                              <span className="text-white">{patientData.blood_group}</span>
                            </div>
                          )}
                          {patientData.address && (
                            <div className="col-span-2">
                              <span className="text-slate-400">{isRTL ? "آدرس:" : "Address:"} </span>
                              <span className="text-white">{patientData.address}</span>
                            </div>
                          )}
                          {patientData.emergency_contact && (
                            <div>
                              <span className="text-slate-400">{isRTL ? "تماس اضطراری:" : "Emergency Contact:"} </span>
                              <span className="text-white">{patientData.emergency_contact}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* نکات مهم */}
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">
                      {isRTL ? "نکات مهم:" : "Important Notes:"}
                    </h5>
                    <ul className="text-sm text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{isRTL ? "۱۵ دقیقه قبل از وقت مقرر در کلینیک حضور داشته باشید" : "Arrive 15 minutes before your scheduled time"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{isRTL ? "کارت شناسایی معتبر همراه داشته باشید" : "Bring valid identification with you"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{isRTL ? "کد رهگیری بالا را به مسئول پذیرش ارائه دهید" : "Present the tracking code above at reception"}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={resetDialog}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {t('booking.done') || (isRTL ? "تأیید و بستن" : "Done")}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}