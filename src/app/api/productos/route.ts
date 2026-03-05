import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
) {
    try{
        const {data, error}= await supabase
    .from("productos")
    .select(`
        *,
        categorias(
        id,
        nombre,
        descripcion
        )    
    `
    );

    return NextResponse.json({data})
    }catch(error){
        return NextResponse.json({message:"Error"},{status:500})
    }
    
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const nombre = formData.get('nombre') as string;
    const precio = Number(formData.get('precio'));
    const stock = Number(formData.get('stock'));
    const categoria_id = formData.get('categoria_id') as string;
    const image = formData.get('image') as File;

    if (!nombre || nombre.trim().length < 3) {
      return NextResponse.json({ error: "El nombre debe tener al menos 3 caracteres" }, { status: 400 });
    }

    if (isNaN(precio) || precio <= 0) {
      return NextResponse.json({ error: "El precio debe ser un número mayor a 0" }, { status: 400 });
    }

    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "El stock no puede ser menor a 0" }, { status: 400 });
    }

    if (!categoria_id) {
      return NextResponse.json({ error: "Debes seleccionar una categoría válida" }, { status: 400 });
    }

    let publicUrl = '';

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('productos-imagenes')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('productos-imagenes').getPublicUrl(fileName);
      publicUrl = data.publicUrl;
    }

    const { error: dbError } = await supabase
      .from('productos')
      .insert([{
        nombre,
        precio,
        stock,
        categoria_id,
        imagen_url: publicUrl
      }]);

    if (dbError) throw dbError;

    return NextResponse.json({ message: "Producto creado con éxito" }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}