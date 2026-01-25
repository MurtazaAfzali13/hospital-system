// 📁 `utils/supabase/server.ts`
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies() // ❗ **اضافه کردن await اینجا**

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// تابع کمکی برای بررسی اتصال
export async function checkSupabaseConnection() {
  try {
    const supabase = await createServerSupabaseClient(); // ❗ اضافه کردن await
    const { data, error } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return {
      connected: true,
      message: 'Connected to Supabase successfully'
    };
  } catch (error: any) {
    console.error('Supabase connection error:', error);
    return {
      connected: false,
      message: error.message
    };
  }
}