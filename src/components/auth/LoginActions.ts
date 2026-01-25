'use server'

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { z } from 'zod'

export type LoginState = {
  error?: string
  success?: string
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
    }
  }

  const { email, password } = parsed.data

  // ✅ FIX
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }

  return { success: 'Login successful' }
}
