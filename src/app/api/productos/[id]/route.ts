import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("productos")
      .select(`
        *,
        categorias (
          id,
          nombre,
          descripcion
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Producto no encontrado", error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error("Error en GET producto:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
}

const extraerRutaDeURL = (url: string) => {
  const partes = url.split("/public/productos-imagenes/");
  return partes.length > 1 ? partes[1] : null;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: producto, error: fetchError } = await supabase
      .from("productos")
      .select("imagen_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (producto?.imagen_url) {
      const rutaArchivo = extraerRutaDeURL(producto.imagen_url);

      if (rutaArchivo) {
        await supabase.storage.from("productos").remove([rutaArchivo]);
      }
    }

    const { error: deleteError } = await supabase
      .from("productos")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Producto e imagen eliminados" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const nombre = formData.get("nombre") as string;
    const precio = formData.get("precio") as string;
    const stock = formData.get("stock") as string;
    const categoria_id = formData.get("categoria_id") as string;
    const imageFile = formData.get("image") as File | null;

    const { data: productoActual, error: errorFetch } = await supabase
      .from("productos")
      .select("imagen_url")
      .eq("id", id)
      .single();

    if (errorFetch) throw new Error("Producto no encontrado");

    let nueva_imagen_url = productoActual.imagen_url;

    if (imageFile && imageFile.size > 0) {
      if (productoActual.imagen_url) {
        const urlPartes = productoActual.imagen_url.split("/");
        const nombreArchivoViejo = urlPartes[urlPartes.length - 1];
        await supabase.storage.from("productos-imagenes").remove([nombreArchivoViejo]);
      }

      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${id}-${Math.random()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("productos-imagenes")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("productos-imagenes")
        .getPublicUrl(fileName);
      
      nueva_imagen_url = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("productos")
      .update({
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoria_id,
        imagen_url: nueva_imagen_url,
      })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Producto actualizado correctamente" });

  } catch (error: any) {
    console.error("Error en PUT:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}