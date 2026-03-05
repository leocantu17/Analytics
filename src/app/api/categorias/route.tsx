import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Obtiene el listado de categorías disponibles para clasificar los productos.
 * Los resultados se devuelven ordenados alfabéticamente para optimizar 
 * el renderizado y la experiencia de usuario (UX) en los selectores del Frontend.
 * * @returns {NextResponse} Respuesta JSON con un arreglo de categorías (id, nombre).
 */
export async function GET() {
  try {
    // Solicitamos estrictamente los campos necesarios
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order("nombre", { ascending: true });

    if (error) throw error;

    // Retorno de datos directo para alimentar los selects
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("[GET /api/categorias] Error al consultar:", error.message);
    return NextResponse.json(
      { error: "Error interno al obtener la lista de categorías" }, 
      { status: 500 }
    );
  }
}