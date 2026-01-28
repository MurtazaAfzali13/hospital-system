// 📁 app/api/doctors/[id]/check-slot/route.ts
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// این API برای lock کردن موقت زمان‌ها استفاده می‌شود
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

    // ایجاد جدول locks اگر وجود ندارد
    // این جدول برای lock کردن موقت زمان‌ها استفاده می‌شود
    const { data: locks, error } = await supabase
      .from("time_slot_locks")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("slot_date", date)
      .eq("slot_time", time)
      .gt("expires_at", new Date().toISOString());

    if (error) {
      console.error("Lock check error:", error);
      throw error;
    }

    // اگر زمان قبلاً lock شده باشد
    if (locks && locks.length > 0) {
      return NextResponse.json({
        available: false,
        lockedBy: locks[0].locked_by,
        expiresAt: locks[0].expires_at
      });
    }

    // اگر action = 'reserve' باشد، یک lock جدید ایجاد کن
    if (action === 'reserve') {
      const lockId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه اعتبار

      await supabase
        .from("time_slot_locks")
        .insert([{
          id: lockId,
          doctor_id: doctorId,
          slot_date: date,
          slot_time: time,
          locked_by: body.userId || 'anonymous',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }]);

      return NextResponse.json({
        available: true,
        lockId,
        expiresAt
      });
    }

    // اگر action = 'release' باشد، lock را حذف کن
    if (action === 'release') {
      await supabase
        .from("time_slot_locks")
        .delete()
        .eq("doctor_id", doctorId)
        .eq("slot_date", date)
        .eq("slot_time", time);

      return NextResponse.json({ released: true });
    }

    return NextResponse.json({ available: true });

  } catch (err: any) {
    console.error("Slot check error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}