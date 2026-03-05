"use client";

import { useState, useEffect } from "react";
import React from "react";
import Swal from "sweetalert2";
import { Package, DollarSign, Layers, Upload } from "lucide-react";

interface FormProductoProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function FormProducto({ onSuccess, onCancel }: FormProductoProps) {
  const [producto, setProducto] = useState({
    nombre: "",
    precio: "" as any,
    stock: "" as any,
    categoria_id: "",
  });

  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("/api/categorias");
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error cargando categorias", error);
      }
    };
    fetchCategorias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    if (type === "file" && target.files && target.files[0]) {
      const selectedFile = target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else if (type === "number") {
      if (value === "") {
        setProducto({ ...producto, [name]: "" });
        return;
      }
      const numValue = parseFloat(value);
      setProducto({
        ...producto,
        [name]: numValue < 0 ? 0 : value, 
      });
    } else {
      setProducto({ ...producto, [name]: value });
    }
  };

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let num = parseFloat(value);

    // Si está vacío, es NaN, o es negativo, lo forzamos a 0
    if (!value || isNaN(num) || num < 0) {
      num = 0;
    }

    // Si es stock, lo forzamos a entero 
    if (name === "stock") {
      num = Math.floor(num);
    }

    setProducto((prev) => ({
      ...prev,
      [name]: num,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntentoEnvio(true);

    if (!producto.nombre || !producto.precio || Number(producto.precio) <= 0 || !producto.categoria_id) {
      Swal.fire("Incompleto", "Por favor llena todos los campos obligatorios.", "warning");
      return;
    }

    setLoading(true);
    Swal.fire({
      title: "Guardando...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    try {
      const formData = new FormData();
      Object.entries(producto).forEach(([key, value]) => formData.append(key, value.toString()));
      if (file) formData.append("image", file);

      const res = await fetch("/api/productos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "¡Éxito!", text: "Producto guardado.", timer: 1500 });
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        Swal.fire("Error", data.error || "No se pudo guardar.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de conexión con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = "text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2";
  const inputStyle = "w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-slate-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nombre */}
        <div className="md:col-span-2 flex flex-col">
          <label className={labelStyle}><Package size={14}/> Nombre del Producto *</label>
          <input
            name="nombre"
            type="text"
            value={producto.nombre}
            onChange={handleChange}
            placeholder="Ej. Laptop Gaming"
            className={`${inputStyle} ${intentoEnvio && !producto.nombre ? "border-red-500" : ""}`}
          />
        </div>

        {/* Precio */}
        <div className="flex flex-col">
          <label className={labelStyle}><DollarSign size={14}/> Precio (MXN) *</label>
          <input
            name="precio"
            type="number"
            step="0.01"
            value={producto.precio}
            onChange={handleChange}
            onBlur={handleNumberBlur} 
            className={`${inputStyle} ${intentoEnvio && (!producto.precio || Number(producto.precio) <= 0) ? "border-red-500" : ""}`}
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col">
          <label className={labelStyle}><Layers size={14}/> Stock Inicial</label>
          <input
            name="stock"
            type="number"
            value={producto.stock}
            onChange={handleChange}
            onBlur={handleNumberBlur} 
            className={inputStyle}
          />
        </div>

        {/* Categoria */}
        <div className="md:col-span-2 flex flex-col">
          <label className={labelStyle}>Categoría *</label>
          <select
            name="categoria_id"
            value={producto.categoria_id}
            onChange={handleChange}
            className={`${inputStyle} cursor-pointer`}
          >
            <option value="">Selecciona...</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
        </div>

        {/* Upload Imagen */}
        <div className="md:col-span-2">
          <label className={labelStyle}><Upload size={14}/> Imagen</label>
          <div 
            className="mt-2 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer relative min-h-[150px]"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-32 object-contain" />
            ) : (
              <p className="text-slate-400 text-sm">Haz clic para subir imagen</p>
            )}
            <input id="fileInput" type="file" className="hidden" onChange={handleChange} accept=".png,.jpg,.jpeg,.webp" />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-[#000d2d] text-white font-bold rounded-xl hover:bg-blue-900 transition-all disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Producto"}
        </button>
      </div>
    </form>
  );
}