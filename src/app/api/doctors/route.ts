import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


export async function GET(){
   try{
     const supabase=createServerSupabaseClient();
     const { data, error } = await supabase
      .from('doctors')
      .select('id, full_name, bio, image_url, instagram_url, facebook_url, phone_number, specialization_id')
      .order('full_name', { ascending: true });
      
      if(error) throw error

      return NextResponse.json(data);
   }catch(error){
    return NextResponse.json("somthing went wrong",{status:500})
   }
  
}