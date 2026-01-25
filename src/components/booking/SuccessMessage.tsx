"use client";

import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock, User, Copy, Share2 } from "lucide-react";
import { useState } from "react";

type SuccessMessageProps = {
    verificationCode: string;
    selectedTime: string | null;
    selectedDate: Date;
    doctorName: string;
    onClose: () => void;
    isRTL: boolean;
    t: (key: string) => string;
};

export default function SuccessMessage({
    verificationCode,
    selectedTime,
    selectedDate,
    doctorName,
    onClose,
    isRTL,
    t
}: SuccessMessageProps) {
    const [copied, setCopied] = useState(false);

    const formatDate = (date: Date) => {
        const locale = isRTL ? "fa-IR" : "en-US";
        return new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(verificationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const shareData = {
            title: isRTL ? "رزرو نوبت پزشکی" : "Medical Appointment Booking",
            text: isRTL 
                ? `نوبت پزشکی من: دکتر ${doctorName} - ${selectedTime} - ${formatDate(selectedDate)} - کد رهگیری: ${verificationCode}`
                : `My medical appointment: Dr. ${doctorName} - ${selectedTime} - ${formatDate(selectedDate)} - Tracking Code: ${verificationCode}`,
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(shareData.text);
            alert(isRTL ? "متن کپی شد!" : "Text copied!");
        }
    };

    return (
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
                    {t('booking.successMessage') || (isRTL ? "نوبت شما با موفقیت ثبت شده است" : "Your appointment has been successfully booked")}
                </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <User className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{isRTL ? "پزشک" : "Doctor"}</p>
                            <p className="font-semibold text-white">{doctorName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{isRTL ? "تاریخ" : "Date"}</p>
                            <p className="font-semibold text-white">{formatDate(selectedDate)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{isRTL ? "زمان" : "Time"}</p>
                            <p className="font-semibold text-white">{selectedTime}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-5 border border-cyan-800/50">
                <div className="text-center mb-4">
                    <p className="text-slate-300 mb-2">
                        {t('booking.trackingCode') || (isRTL ? "کد رهگیری نوبت" : "Appointment Tracking Code")}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="bg-black/30 px-6 py-3 rounded-lg border border-cyan-700/50">
                            <code className="text-2xl font-bold tracking-widest text-cyan-400">
                                {verificationCode}
                            </code>
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600 transition"
                            title={isRTL ? "کپی کردن کد" : "Copy code"}
                        >
                            <Copy className="w-5 h-5 text-slate-300" />
                        </button>
                    </div>
                    {copied && (
                        <p className="text-green-400 text-sm mt-2">
                            {isRTL ? "کد کپی شد!" : "Code copied!"}
                        </p>
                    )}
                </div>
                
                <div className="text-center">
                    <p className="text-sm text-slate-400 mb-3">
                        {isRTL 
                            ? "این کد را برای پیگیری و ورود به کلینیک نگه دارید"
                            : "Keep this code for tracking and clinic entry"
                        }
                    </p>
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition"
                    >
                        <Share2 className="w-4 h-4" />
                        {isRTL ? "اشتراک‌گذاری" : "Share"}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">
                        {isRTL ? "نکات مهم:" : "Important Notes:"}
                    </h5>
                    <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                        <li>
                            {isRTL 
                                ? "لطفاً ۱۵ دقیقه قبل از وقت مقرر در کلینیک حضور داشته باشید"
                                : "Please arrive at the clinic 15 minutes before your scheduled time"
                            }
                        </li>
                        <li>
                            {isRTL 
                                ? "کارت شناسایی معتبر همراه داشته باشید"
                                : "Bring valid identification with you"
                            }
                        </li>
                        <li>
                            {isRTL 
                                ? "کد رهگیری را به مسئول پذیرش ارائه دهید"
                                : "Present your tracking code to the receptionist"
                            }
                        </li>
                    </ul>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
            >
                <CheckCircle className="w-5 h-5" />
                {t('booking.done') || (isRTL ? "تأیید و بستن" : "Done")}
            </button>
        </motion.div>
    );
}