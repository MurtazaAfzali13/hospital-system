import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'

function isValid(text?: string) {
  return typeof text === 'string' && text.trim() !== ''
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName } = body

    if (
      !isValid(email) ||
      !isValid(password) ||
      !isValid(firstName) ||
      !isValid(lastName)
    ) {
      return NextResponse.json(
        { message: 'Invalid input' },
        { status: 400 }
      )
    }

    // 👇 FIX HERE
    const supabase = await createServerSupabaseClient()

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
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Your registration is successful.' },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
