import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const {data,error}=await supabase
        .from('categorias')
        .select('id,nombre')
        .order("nombre",{ascending:true})

        if(error) throw error

        return NextResponse.json(data,{status:200})
    }catch(error:any){
        return NextResponse.json({
            error:error.message
        },
    {status:500})
    }
}