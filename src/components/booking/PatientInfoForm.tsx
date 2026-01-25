"use client";

import { motion } from "framer-motion";
import { UserPlus, CheckCircle, Phone, Mail, Home, PhoneCall, Droplets } from "lucide-react";
import { useState } from "react";
type Patient = {
    first_name?: string;
    last_name?: string;
    phone_number: string;
    email?: string;
    birth_date?: string;
    gender?: string;
    blood_group?: string;
    address?: string;
    emergency_contact?: string;
};

type PatientInfoFormProps = {
    patientData: Patient;
    onUpdate: (data: Patient) => void;
    onSubmit: (data: Patient) => void;
    onBack: () => void;
    loading: boolean;
    isRTL: boolean;
    t: (key: string) => string;
    showPhoneField?: boolean;
};

export default function PatientInfoForm({
    patientData,
    onUpdate,
    onSubmit,
    onBack,
    loading,
    isRTL,
    t,
    showPhoneField = false
}: PatientInfoFormProps) {
    
    const [phoneError, setPhoneError] = useState<string>("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // اعتبارسنجی تلفن افغانی
    const validateAfghanPhone = (phone: string): { valid: boolean; message: string; formatted?: string } => {
        if (!phone) {
            return { valid: false, message: isRTL ? "شماره تلفن الزامی است" : "Phone number is required" };
        }
        
        const digits = phone.replace(/\D/g, '');
        
        if (digits.length < 9) {
            return { 
                valid: false, 
                message: isRTL 
                    ? `شماره تلفن باید حداقل ۹ رقم باشد (${digits.length} رقم وارد شده)`
                    : `Phone number must be at least 9 digits (${digits.length} digits entered)`
            };
        }
        
        if (digits.length > 10) {
            return { 
                valid: false, 
                message: isRTL 
                    ? `شماره تلفن باید حداکثر ۱۰ رقم باشد (${digits.length} رقم وارد شده)`
                    : `Phone number must be at most 10 digits (${digits.length} digits entered)`
            };
        }
        
        // بررسی فرمت
        if (digits.length === 10 && !digits.startsWith('07')) {
            return { 
                valid: false, 
                message: isRTL 
                    ? "شماره ۱۰ رقمی باید با ۰۷ شروع شود"
                    : "10-digit number must start with 07"
            };
        }
        
        if (digits.length === 9 && !digits.startsWith('7')) {
            return { 
                valid: false, 
                message: isRTL 
                    ? "شماره ۹ رقمی باید با ۷ شروع شود"
                    : "9-digit number must start with 7"
            };
        }
        
        // فرمت استاندارد
        const formattedPhone = digits.length === 9 ? '0' + digits : digits;
        
        return { 
            valid: true, 
            message: isRTL ? "شماره تلفن معتبر است ✓" : "Valid phone number ✓",
            formatted: formattedPhone
        };
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // فقط اعداد و + را قبول کن
        const cleanedValue = value.replace(/[^\d+]/g, '');
        
        // اگر بیشتر از 10 رقم شد، قطع کن
        const digits = cleanedValue.replace(/\D/g, '');
        if (digits.length > 10) {
            return;
        }
        
        const newData = { ...patientData, phone_number: cleanedValue };
        onUpdate(newData);
        
        // اعتبارسنجی real-time
        if (showPhoneField) {
            const validation = validateAfghanPhone(cleanedValue);
            setPhoneError(validation.valid ? "" : validation.message);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors: Record<string, string> = {};
        
        // اعتبارسنجی تلفن
        if (showPhoneField) {
            const phoneValidation = validateAfghanPhone(patientData.phone_number);
            if (!phoneValidation.valid) {
                errors.phone = phoneValidation.message;
                setPhoneError(phoneValidation.message);
            }
        }
        
        // اعتبارسنجی نام
        if (!patientData.first_name?.trim()) {
            errors.first_name = isRTL ? "نام الزامی است" : "First name is required";
        }
        
        // اعتبارسنجی نام خانوادگی
        if (!patientData.last_name?.trim()) {
            errors.last_name = isRTL ? "نام خانوادگی الزامی است" : "Last name is required";
        }
        
        // اگر خطا داریم، نمایش بده و متوقف شو
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            
            // اولین خطا را به کاربر نشان بده
            const firstError = Object.values(errors)[0];
            alert(firstError);
            
            return;
        }
        
        // فرمت شماره تلفن قبل از ارسال
        let finalData = { ...patientData };
        if (showPhoneField) {
            const phoneValidation = validateAfghanPhone(patientData.phone_number);
            if (phoneValidation.formatted) {
                finalData = { ...finalData, phone_number: phoneValidation.formatted };
            }
        }
        
        onSubmit(finalData);
    };

    const formatPhoneInput = (value: string): string => {
        const digits = value.replace(/\D/g, '');
        
        if (digits.length <= 3) {
            return digits;
        }
        
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                    <div className="inline-flex p-3 bg-amber-900/30 rounded-full mb-4 border border-amber-800/50">
                        <UserPlus className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        {t('booking.completePersonalInfo') || "تکمیل اطلاعات شخصی"}
                    </h4>
                    <p className="text-slate-400 text-sm">
                        {t('booking.completeInfoPrompt') || "لطفاً اطلاعات خود را برای ثبت‌نام تکمیل کنید"}
                    </p>
                </div>

                {/* راهنمای شماره تلفن */}
                {showPhoneField && (
                    <div className="mb-4 p-3 bg-amber-900/20 rounded-lg border border-amber-800/30">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-amber-800/50 rounded">
                                    <Phone className="w-3 h-3 text-amber-400" />
                                </div>
                                <span className="text-amber-300 text-sm font-medium">
                                    {isRTL ? "فرمت صحیح شماره تلفن:" : "Correct phone number format:"}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-slate-400 text-xs">•</span>
                                    <code className="bg-black/30 px-2 py-1 rounded text-amber-100 font-mono text-xs">
                                        {isRTL ? "۰۷۸۳۰۰۰۲۴۷" : "0783000247"}
                                    </code>
                                    <span className="text-slate-500 text-xs">(۱۰ رقم)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-slate-400 text-xs">•</span>
                                    <code className="bg-black/30 px-2 py-1 rounded text-amber-100 font-mono text-xs">
                                        {isRTL ? "۷۸۳۰۰۰۲۴۷" : "783000247"}
                                    </code>
                                    <span className="text-slate-500 text-xs">(۹ رقم)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Phone Field (فقط اگر نیاز باشد) */}
                    {showPhoneField && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t('booking.phone') || "شماره تماس"} <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={patientData.phone_number}
                                    onChange={handlePhoneChange}
                                    required
                                    className={`w-full p-3 rounded-xl bg-slate-800/50 border ${
                                        phoneError && patientData.phone_number
                                            ? 'border-red-500/50'
                                            : patientData.phone_number && !phoneError
                                            ? 'border-green-500/50'
                                            : 'border-slate-600'
                                    } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10`}
                                    placeholder={isRTL ? "۰۷۸۳۰۰۰۲۴۷" : "0783000247"}
                                    dir="ltr"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                />
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            </div>
                            
                            {/* وضعیت و خطا */}
                            <div className="mt-2">
                                {phoneError && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <span className="text-red-400 text-xs">✗</span>
                                        </div>
                                        <p className="text-red-400 text-xs">{phoneError}</p>
                                    </div>
                                )}
                                
                                {patientData.phone_number && !phoneError && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <span className="text-green-400 text-xs">✓</span>
                                        </div>
                                        <p className="text-green-400 text-xs">
                                            {isRTL 
                                                ? `شماره معتبر (${patientData.phone_number.replace(/\D/g, '').length} رقم)`
                                                : `Valid number (${patientData.phone_number.replace(/\D/g, '').length} digits)`
                                            }
                                        </p>
                                    </div>
                                )}
                                
                                {/* شمارشگر ارقام */}
                                {patientData.phone_number && (
                                    <div className="mt-1 flex justify-between items-center">
                                        <span className="text-slate-500 text-xs">
                                            {isRTL ? "تعداد ارقام:" : "Digits count:"}
                                        </span>
                                        <span className={`text-xs font-mono ${
                                            patientData.phone_number.replace(/\D/g, '').length >= 9
                                                ? 'text-green-400'
                                                : 'text-amber-400'
                                        }`}>
                                            {patientData.phone_number.replace(/\D/g, '').length} / 9-10
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t('booking.firstName') || "نام"} <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={patientData.first_name || ""}
                                onChange={(e) => onUpdate({ ...patientData, first_name: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                                placeholder={isRTL ? "علی" : "Ali"}
                            />
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
                                value={patientData.last_name || ""}
                                onChange={(e) => onUpdate({ ...patientData, last_name: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                                placeholder={isRTL ? "محمدی" : "Mohammadi"}
                            />
                            {formErrors.last_name && (
                                <p className="text-red-400 text-xs mt-1">{formErrors.last_name}</p>
                            )}
                        </div>
                    </div>

                    {/* بقیه فیلدها بدون تغییر... */}
                    {/* ... */}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition"
                        disabled={loading}
                    >
                        {t('booking.back') || "بازگشت"}
                    </button>
                    <button
                        type="submit"
                        disabled={
                            loading || 
                            (showPhoneField && (!patientData.phone_number || !!phoneError)) ||
                            !patientData.first_name ||
                            !patientData.last_name
                        }
                        className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {t('booking.registering') || "در حال ثبت‌نام..."}
                            </>
                        ) : (
                            <>
                                {t('booking.registerAndBook') || "ثبت‌نام و رزرو نوبت"}
                                <CheckCircle className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
                
                <div className="pt-4 border-t border-slate-700/50">
                    <div className="text-slate-500 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-red-400">*</span>
                            <span>{isRTL ? "فیلدهای الزامی" : "Required fields"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span>{isRTL ? "تلفن معتبر" : "Valid phone"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400">⚠</span>
                            <span>{isRTL ? "حداقل ۹ رقم لازم است" : "Minimum 9 digits required"}</span>
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}