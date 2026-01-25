import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔧 Register API - Request:", body);

    // اعتبارسنجی
    if (!body.phone_number || !body.first_name || !body.last_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: "شماره تلفن، نام و نام خانوادگی الزامی هستند" 
        },
        { status: 400 }
      );
    }

    // پاکسازی شماره
    const digits = body.phone_number.replace(/\D/g, '');
    
    if (digits.length !== 9 && digits.length !== 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: "شماره تلفن باید ۹ یا ۱۰ رقم باشد" 
        },
        { status: 400 }
      );
    }

    // فرمت استاندارد
    const formattedPhone = digits.length === 9 ? '0' + digits : digits;
    console.log("🔧 Formatted phone:", formattedPhone);

    const supabase = await createServerSupabaseClient()


    // چک کردن تکراری بودن
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("id")
      .eq("phone_number", formattedPhone)
      .maybeSingle();

    if (existingPatient) {
      console.log("⚠️ Phone already exists");
      return NextResponse.json(
        { 
          success: false, 
          error: "این شماره تلفن قبلاً ثبت شده است",
          patientId: existingPatient.id
        },
        { status: 409 }
      );
    }

    // 🎯 **ایجاد رکورد بیمار (اکنون همه فیلدها در patients هستند)**
    const patientId = crypto.randomUUID();
    
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert([{
        id: patientId,
        phone_number: formattedPhone,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email || `${formattedPhone}@guest.hospital.com`,
        birth_date: body.birth_date || null,
        gender: body.gender || null,
        blood_group: body.blood_group || null,
        address: body.address || null,
        emergency_contact: body.emergency_contact || null,
        is_guest: true,
        guest_identifier: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }])
      .select(`
        id,
        phone_number,
        first_name,
        last_name,
        email,
        is_guest
      `)
      .single();

    if (patientError) {
      console.error("❌ Patient creation error:", patientError);
      throw patientError;
    }

    // 🎯 **همچنین یک پروفایل هم ایجاد کن (اگر سیستم auth نیاز دارد)**
    try {
      await supabase
        .from("profiles")
        .insert([{
          id: patientId,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email || `${formattedPhone}@guest.hospital.com`,
          role: 'guest_patient',
          created_at: new Date().toISOString()
        }]);
    } catch (profileError) {
      console.warn("⚠️ Could not create profile (might already exist):", profileError);
      // ادامه بده حتی اگر پروفایل ایجاد نشد
    }

    console.log("✅ Registration successful:", patient);
    
    return NextResponse.json({
      success: true,
      patientId: patient.id,
      patient: {
        id: patient.id,
        phone_number: patient.phone_number,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
        is_guest: patient.is_guest
      }
    });

  } catch (error: any) {
    console.error("❌ Registration API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "خطا در ثبت اطلاعات" 
      },
      { status: 500 }
    );
  }
}