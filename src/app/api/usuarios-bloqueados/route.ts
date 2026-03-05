import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { UsuarioBloqueado, UsuarioDB } from "@/types/database";

//Elimanamos la cache para que no se guarde
export const dynamic = "force-dynamic";

/**
 * Obtiene la lista de usuarios con intentos fallidos de inicio de sesión.
 * Mapea los resultados de la BD para evaluar dinámicamente si el usuario esta bloquea en este instante.
 * @returns {NextResponse} Respuesta del JSON con el listado de usuarios bloqueados
 */

export async function GET() {
  try {
    const supabase = await getSupabaseBrowser();

    //Consulta de usuarios con al menos 1 intento fallido
    const { data, error } = await supabase
      .from("control_accesos")
      .select("email, intentos, bloqueado_hasta")
      .gt("intentos", 0)
      .order("intentos", { ascending: false });

    if (error) throw error;

    //Mapeo y cálculo de estado dinámico
    const usuariosBloqueados: UsuarioBloqueado[] = data.map((u: UsuarioDB) => ({
      id: u.email,
      email: u.email,
      intentos_fallidos: u.intentos,
      //Condicional para checar si la fecha es mayor a la fecha u hora actual
      bloqueado: u.bloqueado_hasta
        ? new Date(u.bloqueado_hasta) > new Date()
        : false,
      ultima_actividad: u.bloqueado_hasta,
    }));

    return NextResponse.json({ data: usuariosBloqueados });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Se desbloquea al usuario eliminando su registro de penalización
 * Delega la seguridad a las politicas RLS de supabase.
 * @param {Request} request Objeto HTTP con el payload
 * @returns {NextResponse} Confirmación de restauración de acceso.
 */

export async function PUT(request: Request) {
  try {
    const supabase = await getSupabaseBrowser();
    const { email } = await request.json();

    //Validación del correo
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    //Intento de eliminación en BD (Sujeto a RLS)
    const { error, count } = await supabase
      .from("control_accesos")
      .delete({ count: "exact" })
      .eq("email", email);

    if (error) throw error;
    
    // Validación de Políticas de Seguridad (RLS)
    if (count === 0) {
      return NextResponse.json(
        {
          message: "No se encontró el registro o RLS bloqueó el borrado",
          count,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Acceso restaurado exitosamente",
      email,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: "Fallo al desbloquear usuario" },
      { status: 500 },
    );
  }
}
