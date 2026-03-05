import { NextResponse } from "next/server";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { UsuarioBloqueado, UsuarioDB } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getSupabaseBrowser();

    const { data, error } = await supabase
      .from("control_accesos")
      .select("email, intentos, bloqueado_hasta")
      .gt("intentos", 0)
      .order("intentos", { ascending: false });

    if (error) throw error;

    const usuariosBloqueados: UsuarioBloqueado[] = data.map((u: UsuarioDB) => ({
      id: u.email,
      email: u.email,
      intentos_fallidos: u.intentos,
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

export async function PUT(request: Request) {
  try {
    const supabase = await getSupabaseBrowser();
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const { error, count } = await supabase
      .from("control_accesos")
      .delete({ count: "exact" })
      .eq("email", email);

    if (error) throw error;

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
