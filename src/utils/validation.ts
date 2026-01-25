// 📁 utils/validation.ts
export const validatePhone = (phone: string, isRTL: boolean = true) => {
    if (!phone) {
        return { valid: false, message: isRTL ? "شماره تلفن الزامی است" : "Phone number is required" };
    }
    
    const digits = phone.replace(/\D/g, '');
    
    // طول
    if (digits.length < 9) {
        return { 
            valid: false, 
            message: isRTL 
                ? `شماره تلفن باید حداقل ۹ رقم باشد (${digits.length} رقم)`
                : `Phone number must be at least 9 digits (${digits.length} digits)`
        };
    }
    
    if (digits.length > 10) {
        return { 
            valid: false, 
            message: isRTL 
                ? `شماره تلفن باید حداکثر ۱۰ رقم باشد (${digits.length} رقم)`
                : `Phone number must be at most 10 digits (${digits.length} digits)`
        };
    }
    
    // فرمت
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
    
    const formatted = digits.length === 9 ? '0' + digits : digits;
    
    return { 
        valid: true, 
        message: isRTL ? "شماره تلفن معتبر است" : "Valid phone number",
        formatted,
        digits: digits.length
    };
};