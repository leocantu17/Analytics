import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";


/**
 * Obtiene y procesa los datos de ventas para el dashboard Analitico.
 * Realiza una consulta relacional de las tablas ventas y productos y realiza el calculo para enviar el total al cliente
 * ligero y formateado listo para ser consumido
 * @returns {NextResponse} Respuesta JSON con un arreglo de objetos
 */
export async function GET() {
  try {
    //Consulta relacional hacia las tablas productos con su historico de ventas.
    const { data, error } = await supabase.from("productos").select(`
    nombre,
    ventas (
      total,
      creado_en
    )
  `);
      
    if (error) throw error;
    //Calculo de total de ingresos por productos
    const datosProcesados = data.map((producto) => {
      const sumaTotal = producto.ventas.reduce(
        (acumulador, venta) => acumulador + venta.total,
        0,
      );
      //Enviamos la respuesta del nombre del producto con su total
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
