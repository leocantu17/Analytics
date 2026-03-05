import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Si no hay usuario
  if (!user) {
    if (path !== "/") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // Obtener rol
  const { data: profile } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = profile?.rol || "user";

  let rutaDestino = "/user";

  if (rol === "admin") rutaDestino = "/admin";
  if (rol === "empleado") rutaDestino = "/empleado";

  // Si entra a login y ya tiene sesión
  if (path === "/") {
    return NextResponse.redirect(new URL(rutaDestino, request.url));
  }

  // Protección de rutas
  if (path.startsWith("/admin") && rol !== "admin") {
    return NextResponse.redirect(new URL(rutaDestino, request.url));
  }

  if (path.startsWith("/empleado") && rol !== "empleado") {
    return NextResponse.redirect(new URL(rutaDestino, request.url));
  }

  if (path.startsWith("/user") && rol !== "user") {
    return NextResponse.redirect(new URL(rutaDestino, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};