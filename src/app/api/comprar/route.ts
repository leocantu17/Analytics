import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { carrito, perfil_id } = await request.json();

    const promesasVentas = carrito.map(async (item: any) => {
      const { error: errorVenta } = await supabase
        .from("ventas")
        .insert({
          producto_id: item.id,
          cantidad: item.cantidad,
          perfil_id:perfil_id,
          precio_unitario: item.precio
        });

      if (errorVenta) throw errorVenta;

      await supabase.from("productos")
        .update({ stock: item.stock - item.cantidad })
        .eq("id", item.id);
    });

    await Promise.all(promesasVentas);

    return NextResponse.json({ message: "Compra procesada con éxito" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al procesar la compra" }, { status: 500 });
  }
}