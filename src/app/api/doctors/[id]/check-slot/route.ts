// 📁 app/api/doctors/[id]/check-slot/route.ts
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params;
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const time = url.searchParams.get("time");
    const body = await request.json();
    const action = body.action; // 'reserve' یا 'release'

    if (!doctorId || !date || !time) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 1. اول بررسی کن آیا این زمان در appointments رزرو شده
    const { data: existingAppointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, patient_name, patient_phone")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .eq("appointment_time", time + ':00') // اضافه کردن ثانیه
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (appointmentError) {
      console.error("Appointment check error:", appointmentError);
      throw appointmentError;
    }

    // اگر نوبت قبلاً ثبت شده باشد
    if (existingAppointment) {
      return NextResponse.json({
        success: false,
        available: false,
        error: "این زمان قبلاً رزرو شده است",
        appointment: {
          patient_name: existingAppointment.patient_name,
          patient_phone: existingAppointment.patient_phone
        },
        code: "ALREADY_BOOKED"
      });
    }

    // 2. بررسی lockهای فعال
    const { data: locks, error: lockError } = await supabase
      .from("time_slot_locks")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("slot_date", date)
      .eq("slot_time", time + ':00')
      .gt("expires_at", new Date().toISOString());

    if (lockError) {
      console.error("Lock check error:", lockError);
      throw lockError;
    }

    // اگر زمان قبلاً lock شده باشد
    if (locks && locks.length > 0) {
      return NextResponse.json({
        success: false,
        available: false,
        error: "این زمان در حال رزرو است",
        lockedBy: locks[0].locked_by,
        expiresAt: locks[0].expires_at,
        code: "ALREADY_RESERVED"
      });
    }

    // اگر action = 'reserve' باشد، یک lock جدید ایجاد کن
    if (action === 'reserve') {
      const lockId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه اعتبار

      const { error: insertError } = await supabase
        .from("time_slot_locks")
        .insert([{
          id: lockId,
          doctor_id: doctorId,
          slot_date: date,
          slot_time: time + ':00',
          locked_by: body.userId || body.sessionId || 'anonymous',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error("Insert lock error:", insertError);
        throw insertError;
      }

      return NextResponse.json({
        success: true,
        available: true,
        lockId,
        expiresAt,
        message: "زمان با موفقیت رزرو شد"
      });
    }

    // اگر action = 'release' باشد، lock را حذف کن
    if (action === 'release') {
      const { error: deleteError } = await supabase
        .from("time_slot_locks")
        .delete()
        .eq("doctor_id", doctorId)
        .eq("slot_date", date)
        .eq("slot_time", time + ':00')
        .eq("locked_by", body.userId || body.sessionId || 'anonymous');

      if (deleteError) {
        console.error("Delete lock error:", deleteError);
        throw deleteError;
      }

      return NextResponse.json({ 
        success: true, 
        released: true,
        message: "رزرو آزاد شد"
      });
    }

    return NextResponse.json({ 
      success: true, 
      available: true,
      message: "زمان در دسترس است"
    });

  } catch (err: any) {
    console.error("Slot check error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: err.message || "Internal server error",
        available: false
      },
      { status: 500 }
    );
  }
}