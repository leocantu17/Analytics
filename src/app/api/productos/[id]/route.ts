import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

/**
 * Obtiene los detalles exactos de un producto específico.
 * Realiza un JOIN con la tabla de categorías para entregar 
 * la información completa en una sola petición.
 * @param {Request} request - Objeto HTTP.
 * @param {Object} params - Parámetros de la ruta que contienen el ID (UUID) del producto.
 * @returns {NextResponse} Respuesta JSON con los datos del producto.
 */
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

    return NextResponse.json({ data }, { status: 200 });

  } catch (error: any) {
    console.error("[GET /api/productos/[id]] Error:", error.message);
    return NextResponse.json(
      { message: "Error interno del servidor al consultar el producto" },
      { status: 500 }
    );
  }
}

/**
 * Utilidad pura para extraer el nombre del archivo exacto 
 * desde la URL pública generada por Supabase Storage.
 */
const extraerRutaDeURL = (url: string) => {
  const partes = url.split("/public/productos-imagenes/");
  return partes.length > 1 ? partes[1] : null;
};

/**
 * Elimina un producto del catálogo de forma permanente.
 * Incluye lógica de limpieza automática: detecta si el producto 
 * tiene una imagen asociada y la elimina del bucket de almacenamiento 
 * en la nube para optimizar el espacio y evitar archivos huérfanos.
 * @param {NextRequest} request - Objeto HTTP.
 * @param {Object} params - ID del producto a eliminar.
 * @returns {NextResponse} Confirmación de eliminación.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener la referencia de la imagen actual antes de borrar el registro
    const { data: producto, error: fetchError } = await supabase
      .from("productos")
      .select("imagen_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Limpieza en el Storage (Bucket)
    if (producto?.imagen_url) {
      const rutaArchivo = extraerRutaDeURL(producto.imagen_url);

      if (rutaArchivo) {
        // Bug corregido: El bucket correcto es 'productos-imagenes', no 'productos'
        await supabase.storage.from("productos-imagenes").remove([rutaArchivo]);
      }
    }

    // Eliminación del registro en la base de datos relacional
    const { error: deleteError } = await supabase
      .from("productos")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Producto e imagen eliminados correctamente" }, { status: 200 });

  } catch (error: any) {
    console.error("[DELETE /api/productos/[id]] Error:", error.message);
    return NextResponse.json({ error: "Fallo interno al intentar eliminar el producto" }, { status: 500 });
  }
}

/**
 * Actualiza la información de un producto existente.
 * Soporta actualización parcial de texto y reemplazo seguro de imagen 
 * (eliminando la anterior del bucket automáticamente).
 * @param {Request} request - Objeto HTTP con el payload (FormData).
 * @param {Object} params - ID del producto a actualizar.
 * @returns {NextResponse} Respuesta JSON confirmando la actualización.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    // Extracción de datos
    const nombre = formData.get("nombre") as string;
    const precio = Number(formData.get("precio"));
    const stock = Number(formData.get("stock"));
    const categoria_id = formData.get("categoria_id") as string;
    const imageFile = formData.get("image") as File | null;

    // Validaciones estrictas
    if (!nombre || nombre.trim().length < 3) {
      return NextResponse.json({ error: "El nombre debe tener al menos 3 caracteres" }, { status: 400 });
    }
    if (isNaN(precio) || precio <= 0) {
      return NextResponse.json({ error: "El precio debe ser un número mayor a 0" }, { status: 400 });
    }
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "El stock no puede ser negativo" }, { status: 400 });
    }
    if (!categoria_id) {
      return NextResponse.json({ error: "Debes seleccionar una categoría válida" }, { status: 400 });
    }

    // Obtener el producto actual para referenciar su imagen
    const { data: productoActual, error: errorFetch } = await supabase
      .from("productos")
      .select("imagen_url")
      .eq("id", id)
      .single();

    if (errorFetch) throw new Error("Producto no encontrado");

    let nueva_imagen_url = productoActual.imagen_url;

    // Procesamiento de reemplazo de imagen
    if (imageFile && imageFile.size > 0) {
      // Borramos la imagen vieja para no saturar el servidor
      if (productoActual.imagen_url) {
        const rutaArchivoViejo = extraerRutaDeURL(productoActual.imagen_url);
        if (rutaArchivoViejo) {
          await supabase.storage.from("productos-imagenes").remove([rutaArchivoViejo]);
        }
      }

      // Subimos la nueva con nombre seguro
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("productos-imagenes")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("productos-imagenes")
        .getPublicUrl(fileName);
      
      nueva_imagen_url = urlData.publicUrl;
    }

    //Actualización final en base de datos
    const { error: updateError } = await supabase
      .from("productos")
      .update({
        nombre,
        precio,
        stock,
        categoria_id,
        imagen_url: nueva_imagen_url,
      })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Producto actualizado correctamente" }, { status: 200 });

  } catch (error: any) {
    console.error("[PUT /api/productos/[id]] Error:", error.message);
    return NextResponse.json({ error: "Ocurrió un error interno al actualizar el producto." }, { status: 500 });
  }
}