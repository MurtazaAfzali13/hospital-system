// 📁 `app/api/health/route.ts`
import { NextRequest, NextResponse } from "next/server";
import { checkSupabaseConnection } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseStatus = await checkSupabaseConnection();
    
    // بررسی APIهای دیگر
    const apis = [
      { name: 'Supabase Database', status: supabaseStatus.connected },
      { name: 'Appointments API', status: true }, // می‌توانید تست واقعی اضافه کنید
      { name: 'Patients API', status: true },
      { name: 'Doctors API', status: true }
    ];

    const allHealthy = apis.every(api => api.status);

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: apis,
      database: supabaseStatus
    }, {
      status: allHealthy ? 200 : 503
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}