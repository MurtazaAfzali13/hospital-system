// 📁 `app/api/doctors/[id]/appointments/route.ts`
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ------------------- GET -------------------
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: doctorId } = await context.params;

        if (!doctorId || doctorId === 'undefined') {
            return NextResponse.json(
                { error: "Doctor ID is required" },
                { status: 400 }
            );
        }

        const url = new URL(request.url);
        const date = url.searchParams.get("date"); // YYYY-MM-DD
        
        if (!date) {
            return NextResponse.json(
                { error: "Date parameter is required" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();
        
        // 🔴 تغییر این بخش: اطلاعات کامل appointments را بگیر
        const { data, error } = await supabase
            .from("appointments")
            .select("appointment_time, patient_name, patient_phone, verification_code, status")
            .eq("doctor_id", doctorId)
            .eq("appointment_date", date)
            .in("status", ["pending", "confirmed"]);

        if (error) {
            console.error("Database error:", error);
            throw error;
        }

        // برگرداندن اطلاعات کامل appointments
        return NextResponse.json(data || []);

    } catch (err: any) {
        console.error("Appointments GET error:", err);
        return NextResponse.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// ------------------- POST -------------------
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: doctorId } = await context.params;
        
        // اعتبارسنجی doctorId
        if (!doctorId || doctorId === 'undefined') {
            return NextResponse.json(
                { error: "Doctor ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        console.log("📅 Booking appointment - Request:", body);
        
        const { time, patient_name, patient_phone, date, email, birth_date, gender, blood_group, address, emergency_contact } = body;

        // اعتبارسنجی فیلدهای الزامی
        const errors = [];
        if (!time) errors.push("time");
        if (!patient_name) errors.push("patient_name");
        if (!patient_phone) errors.push("patient_phone");
        if (!date) errors.push("date");

        if (errors.length > 0) {
            return NextResponse.json(
                { 
                    success: false,
                    error: `فیلدهای الزامی: ${errors.join(", ")}` 
                },
                { status: 400 }
            );
        }

        // اعتبارسنجی شماره تلفن
        const digits = patient_phone.replace(/\D/g, '');
        
        if (digits.length !== 9 && digits.length !== 10) {
            return NextResponse.json(
                { 
                    success: false,
                    error: `شماره تلفن باید ۹ یا ۱۰ رقم باشد (${digits.length} رقم وارد شده)` 
                },
                { status: 400 }
            );
        }

        // فرمت استاندارد تلفن
        const formattedPhone = digits.length === 9 ? '0' + digits : digits;
        
        // اعتبارسنجی فرمت تلفن
        if (formattedPhone.length === 10 && !formattedPhone.startsWith('07')) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "شماره ۱۰ رقمی باید با ۰۷ شروع شود" 
                },
                { status: 400 }
            );
        }
        
        if (formattedPhone.length === 9 && !formattedPhone.startsWith('7')) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "شماره ۹ رقمی باید با ۷ شروع شود" 
                },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        // 🎯 **۱. چک double booking**
        console.log("🔍 Checking for existing appointment...");
        const { data: existingAppointment, error: checkError } = await supabase
            .from("appointments")
            .select("id")
            .eq("doctor_id", doctorId)
            .eq("appointment_date", date)
            .eq("appointment_time", time)
            .in("status", ["pending", "confirmed"])
            .maybeSingle();

        if (checkError) {
            console.error("Check error:", checkError);
            throw checkError;
        }

        if (existingAppointment) {
            console.log("⚠️ Time slot already booked");
            return NextResponse.json(
                { 
                    success: false,
                    error: "این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.",
                    code: "TIME_ALREADY_BOOKED"
                },
                { status: 409 }
            );
        }

        // 🎯 **۲. ایجاد کد تأیید**
        const verificationCode = Math.random().toString().slice(2, 8);
        
        console.log("✅ Creating appointment with verification code:", verificationCode);

        // 🎯 **۳. ثبت نوبت - فقط اطلاعات ضروری**
        const { data: appointment, error: insertError } = await supabase
            .from("appointments")
            .insert([{
                doctor_id: doctorId,
                appointment_time: time,
                patient_name,
                patient_phone: formattedPhone,
                appointment_date: date,
                // اطلاعات اضافی را در metadata ذخیره می‌کنیم (اختیاری)
                metadata: {
                    email: email || null,
                    birth_date: birth_date || null,
                    gender: gender || null,
                    blood_group: blood_group || null,
                    address: address || null,
                    emergency_contact: emergency_contact || null
                },
                status: "confirmed",
                verification_code: verificationCode,
                created_at: new Date().toISOString()
            }])
            .select(`
                id,
                doctor_id,
                appointment_time,
                patient_name,
                patient_phone,
                appointment_date,
                status,
                verification_code,
                metadata,
                created_at
            `)
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            throw insertError;
        }

        if (!appointment) {
            throw new Error("Appointment not created");
        }

        console.log("✅ Appointment created successfully:", appointment.id);

        return NextResponse.json({
            success: true,
            appointment: {
                id: appointment.id,
                doctor_id: appointment.doctor_id,
                time: appointment.appointment_time,
                date: appointment.appointment_date,
                patient_name: appointment.patient_name,
                patient_phone: appointment.patient_phone,
                status: appointment.status,
                verification_code: appointment.verification_code,
                metadata: appointment.metadata,
                created_at: appointment.created_at
            },
            message: "نوبت با موفقیت ثبت شد"
        });

    } catch (err: any) {
        console.error("Appointments POST error:", err);
        
        let statusCode = 500;
        let errorMessage = err.message || "خطا در ثبت نوبت";
        
        if (err.message?.includes("foreign key constraint")) {
            statusCode = 400;
            errorMessage = "دکتر معتبر نیست";
        }
        
        if (err.message?.includes("duplicate key")) {
            statusCode = 409;
            errorMessage = "این نوبت قبلاً ثبت شده است";
        }

        return NextResponse.json(
            { 
                success: false,
                error: errorMessage,
                code: err.code
            },
            { status: statusCode }
        );
    }
}