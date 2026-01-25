import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // اعتبارسنجی doctorId
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient(); // ❗ اضافه کردن await
    
    const { data, error } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", id)
      .order("day_of_week", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return NextResponse.json(data || []);

  } catch (err: any) {
    console.error("Error in schedules API:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}