import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
try{
    const [resPerfil, resVentas] = await Promise.all([
      supabase.from("perfiles").select("*").eq("id", user.id).single(),

      supabase
        .from("ventas")
        .select("*, productos(nombre, imagen_url)")
        .eq("perfil_id", user.id)
        .order("creado_en", { ascending: false }),
    ]);

    return NextResponse.json({
      perfil: resPerfil.data,
      historial: resVentas.data || [],
    });
  } catch (error) {
    console.error("API perfil error:", error);

    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
