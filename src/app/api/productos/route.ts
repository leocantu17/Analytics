import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
) {
    const {data, error}= await supabase
    .from("productos")
    .select(`
        *,
        categorias(
        id,
        nombre,
        descripcion
        )    
    `
    );

    if(error){
        return NextResponse.json({message:"Error"},{status:500})
    }
    return NextResponse.json({data})
}