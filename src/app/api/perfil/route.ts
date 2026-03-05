import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * Obtiene la información del perfil del usuario autenticado y su historial de compras.
 * Utiliza validación de sesión segura en el servidor y concurrencia (Promise.all) 
 * para optimizar el tiempo de respuesta al consultar múltiples tablas simultáneamente.
 * @returns {NextResponse} Respuesta JSON con los datos del perfil y el array del historial.
 */
export async function GET() {
  try {
    // Instanciar el cliente de Supabase optimizado para el servidor (Singleton)
    const supabase = await getSupabaseServer();

    // Validación estricta de sesión (Autenticación)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado. Sesión inválida o expirada." }, { status: 401 });
    }

    // Ejecución concurrente de consultas a la base de datos
    // Se trae el perfil y el historial de ventas al mismo tiempo para reducir la latencia de red
    const [resPerfil, resVentas] = await Promise.all([
      supabase.from("perfiles").select("*").eq("id", user.id).single(),
      supabase
        .from("ventas")
        .select("*, productos(nombre, imagen_url)")
        .eq("perfil_id", user.id)
        .order("creado_en", { ascending: false }),
    ]);

    // Verificación de errores internos en las promesas resueltas
    if (resPerfil.error) throw resPerfil.error;
    if (resVentas.error) throw resVentas.error;

    // Retorno del payload estructurado
    return NextResponse.json({
      perfil: resPerfil.data,
      historial: resVentas.data || [],
    }, { status: 200 });

  } catch (error: any) {
    console.error("[GET /api/perfil] Error:", error.message);
    return NextResponse.json({ error: "Error interno al obtener los datos del perfil" }, { status: 500 });
  }
}