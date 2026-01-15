import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // ساده‌ترین تست اتصال
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 }
      );
    }
   console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    return NextResponse.json(
      {
        status: "ok",
        supabase: "connected",
        sample: data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { status: "error", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
