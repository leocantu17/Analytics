import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase.from("productos").select(`
    nombre,
    ventas (
      total,
      creado_en
    )
  `);
      
    if (error) throw error;

    const datosProcesados = data.map((producto) => {
      const sumaTotal = producto.ventas.reduce(
        (acumulador, venta) => acumulador + venta.total,
        0,
      );

      return {
        nombre: producto.nombre,
        totalVendido: sumaTotal,
      };
    });
    return NextResponse.json({ data: datosProcesados });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
