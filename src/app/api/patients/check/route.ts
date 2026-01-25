// 📁 `app/api/patients/check/route.ts`
import { NextRequest,NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    
    console.log("🔍 Patients check API called with phone:", phone);

    // اعتبارسنجی
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // پاکسازی شماره
    const digits = phone.replace(/\D/g, '');
    
    console.log("🔍 Clean digits:", digits, "Length:", digits.length);
    
    // اعتبارسنجی طول
    if (digits.length !== 9 && digits.length !== 10) {
      console.log("❌ Invalid phone length:", digits.length);
      return NextResponse.json(
        { 
          error: "Phone number must be 9 or 10 digits",
          details: `Your number has ${digits.length} digits after cleaning`,
          original: phone,
          cleaned: digits
        },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت
    if (digits.length === 10 && !digits.startsWith('07')) {
      console.log("❌ Invalid 10-digit format");
      return NextResponse.json(
        { 
          error: "10-digit number must start with 07",
          details: `Your number starts with ${digits.substring(0, 2)}`
        },
        { status: 400 }
      );
    }
    
    if (digits.length === 9 && !digits.startsWith('7')) {
      console.log("❌ Invalid 9-digit format");
      return NextResponse.json(
        { 
          error: "9-digit number must start with 7",
          details: `Your number starts with ${digits.substring(0, 1)}`
        },
        { status: 400 }
      );
    }

    // فرمت استاندارد
    const formattedPhone = digits.length === 9 ? '0' + digits : digits;
    console.log("✅ Phone is valid:", formattedPhone);
    
    console.log("🔍 Searching for phone:", formattedPhone);

    const supabase = await createServerSupabaseClient();
    
    console.log("🔍 Querying database...");
    
    const { data: patient, error } = await supabase
      .from("patients")
      .select(`
        id,
        phone_number,
        first_name,
        last_name,
        email,
        birth_date,
        gender,
        blood_group,
        address,
        emergency_contact,
        is_guest,
        created_at
      `)
      .eq("phone_number", formattedPhone)
      .maybeSingle();

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Query result:", patient ? "Found patient" : "No patient found");

    if (patient) {
      return NextResponse.json({
        exists: true,
        patient: {
          id: patient.id,
          phone_number: patient.phone_number,
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          birth_date: patient.birth_date,
          gender: patient.gender,
          blood_group: patient.blood_group,
          address: patient.address,
          emergency_contact: patient.emergency_contact,
          is_guest: patient.is_guest
        }
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: "Patient not found"
      });
    }

  } catch (error: any) {
    console.error("❌ Check API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}