'use server'

import { createServerSupabaseClient } from '@/utils/supabase/server'
import {z} from "zod"

export type RegisterState = {
  error?: string
  success?: string
}

const RegisterSchema=z.object({
  email:z.string().email(),
  password:z.string().min(6),
  firstName:z.string().trim().min(1),
  lastName:z.string().trim().min(1)
})

export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {

  const rawData={
      email: formData.get('email'),
     password : formData.get('password'),
    firstName : formData.get('firstName'),
    lastName : formData.get('lastName'),
  }

 
   const parsed = RegisterSchema.safeParse(rawData);
   if(!parsed.success){
    return {
      error:parsed.error.issues[0].message
    }
   }
  
   const {email,password,firstName,lastName}=parsed.data;

  const supabase = createServerSupabaseClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Account created successfully. Check your email.' }
}
