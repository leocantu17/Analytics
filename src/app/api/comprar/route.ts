import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Procesa la compra simulada de un carrito de productos.
 * Implementa concurrencia mediante Promise.all para manejar múltiples 
 * operaciones simultáneas (inserción en historial de ventas y actualización de stock).
 * @param {Request} request - Objeto HTTP con el payload JSON (carrito y perfil_id).
 * @returns {NextResponse} Confirmación del procesamiento de la transacción.
 */
export async function POST(request: Request) {
  try {
    const { carrito, perfil_id } = await request.json();

    // Validaciones estrictas de seguridad 
    if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío o el formato es inválido" }, { status: 400 });
    }

    if (!perfil_id) {
      return NextResponse.json({ error: "Se requiere la autenticación del usuario (perfil_id)" }, { status: 401 });
    }

    // Preparación de transacciones concurrentes
    const promesasVentas = carrito.map(async (item: any) => {
      
      // Inserción del registro histórico en la tabla 'ventas'
      const { error: errorVenta } = await supabase
        .from("ventas")
        .insert({
          producto_id: item.id,
          cantidad: item.cantidad,
          perfil_id: perfil_id,
          precio_unitario: item.precio 
        });

      if (errorVenta) throw errorVenta;

      // Actualización del stock en la tabla 'productos'
      const { error: errorStock } = await supabase
        .from("productos")
        .update({ stock: item.stock - item.cantidad })
        .eq("id", item.id);

      if (errorStock) throw errorStock;
    });

    // Ejecución en paralelo para minimizar latencia de red
    await Promise.all(promesasVentas);

    return NextResponse.json({ message: "Compra procesada con éxito" }, { status: 201 });

  } catch (error: any) {
    console.error("[POST /api/comprar] Error transaccional:", error.message || error);
    return NextResponse.json({ error: "Error interno al procesar la compra en la base de datos" }, { status: 500 });
  }
}