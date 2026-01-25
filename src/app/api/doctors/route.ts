// src/app/api/doctors/route.ts
import { createClientSupabaseClient } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClientSupabaseClient();

    const { data, error } = await supabase
      .from("doctors")
      .select("id, full_name, bio, image_url, instagram_url, facebook_url, phone_number, specialization_id")
      .order("full_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
