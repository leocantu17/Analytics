"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import Swal from "sweetalert2";
import { Package, DollarSign, Layers, Upload, Pencil, Trash2 } from "lucide-react";
import { Categoria } from "@/types/database";

export default function PaginaEditarProducto() {
  const { id } = useParams();
  const router = useRouter();

  const [producto, setProducto] = useState({
    nombre: "",
    precio: "" as string | number,
    stock: "" as string | number,
    categoria_id: "",
    imagen_url: "",
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");
  
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resProd, resCats] = await Promise.all([
          fetch(`/api/productos/${id}`),
          fetch("/api/categorias"),
        ]);

        const jsonProd = await resProd.json();
        const jsonCats = await resCats.json();
        const prod = jsonProd.data;
        const cats = Array.isArray(jsonCats) ? jsonCats : jsonCats.data;

        if (prod) {
          setProducto({
            nombre: prod.nombre ?? "",
            precio: prod.precio ?? "",
            stock: prod.stock ?? "",
            categoria_id: prod.categoria_id ?? "",
            imagen_url: prod.imagen_url ?? "",
          });
          setImagenPreview(prod.imagen_url || "");
        }

        setCategorias(cats || []);
      } catch (err) {
        setError("Error al cargar los datos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
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

    if (!value || isNaN(num) || num < 0) num = 0;
    if (name === "stock") num = Math.floor(num);

    setProducto((prev) => ({ ...prev, [name]: num }));
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setImagenPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntentoEnvio(true);
    setError("");

    if (!producto.nombre || !producto.precio || Number(producto.precio) <= 0 || !producto.categoria_id) {
      Swal.fire("Incompleto", "Por favor llena todos los campos obligatorios.", "warning");
      return;
    }

    setGuardando(true);
    Swal.fire({
      title: "Actualizando...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    try {
      const formData = new FormData();
      formData.append("nombre", producto.nombre);
      formData.append("precio", producto.precio.toString());
      formData.append("stock", producto.stock.toString());
      formData.append("categoria_id", producto.categoria_id);

      if (file) formData.append("image", file);

      const res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      Swal.fire({ icon: "success", title: "¡Actualizado!", text: "Los cambios se guardaron correctamente.", timer: 2000 });
      router.push("/admin"); 
    } catch (err: any) {
      Swal.fire("Error", err.message || "Ocurrió un error al guardar.", "error");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#000d2d]" />
          <p className="text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">Cargando producto...</p>
        </div>
      </div>
    );
  }

  const labelStyle = "text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2";
  const inputStyle = "w-full border border-slate-200 rounded-xl px-5 py-4 text-lg text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#000d2d] px-8 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-400 rounded-full" />
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-0.5">
              Panel de Administración · Productos
            </p>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Editar Producto
            </h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-8 py-10 pb-28">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Card: Información General */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#000d2d] to-[#001a5c] px-6 py-4 flex items-center gap-2">
              <span className="text-blue-300 text-sm font-bold uppercase tracking-widest">01</span>
              <h2 className="text-white font-semibold text-sm tracking-wide">Información General</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nombre */}
              <div className="md:col-span-2 flex flex-col">
                <label className={labelStyle}><Package size={16}/> Nombre del Producto *</label>
                <input
                  name="nombre"
                  type="text"
                  value={producto.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Laptop Gaming ROG Strix"
                  className={`${inputStyle} ${intentoEnvio && !producto.nombre ? "border-red-500 bg-red-50" : ""}`}
                />
                {intentoEnvio && !producto.nombre && (
                  <span className="text-red-400 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
                    El nombre es requerido
                  </span>
                )}
              </div>

              {/* Precio */}
              <div className="flex flex-col">
                <label className={labelStyle}><DollarSign size={16}/> Precio (MXN) *</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    value={producto.precio}
                    onChange={handleChange}
                    onBlur={handleNumberBlur}
                    placeholder="0.00"
                    className={`${inputStyle} pl-10 ${intentoEnvio && (!producto.precio || Number(producto.precio) <= 0) ? "border-red-500 bg-red-50" : ""}`}
                  />
                </div>
                {intentoEnvio && (!producto.precio || Number(producto.precio) <= 0) && (
                  <span className="text-red-400 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
                    El precio es requerido
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="flex flex-col">
                <label className={labelStyle}><Layers size={16}/> Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={producto.stock}
                  onChange={handleChange}
                  onBlur={handleNumberBlur}
                  placeholder="0"
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Card: Clasificación */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#000d2d] to-[#001a5c] px-6 py-4 flex items-center gap-2">
              <span className="text-blue-300 text-sm font-bold uppercase tracking-widest">02</span>
              <h2 className="text-white font-semibold text-sm tracking-wide">Clasificación</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col">
                <label className={labelStyle}>Categoría *</label>
                <select
                  name="categoria_id"
                  value={producto.categoria_id}
                  onChange={handleChange}
                  className={`${inputStyle} appearance-none cursor-pointer`}
                >
                  <option value="">Selecciona una categoría...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card: Imagen con Preview (Estilo Edición) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#000d2d] to-[#001a5c] px-6 py-4 flex items-center gap-2">
              <span className="text-blue-300 text-sm font-bold uppercase tracking-widest">03</span>
              <h2 className="text-white font-semibold text-sm tracking-wide">Imagen del Producto</h2>
            </div>

            <div className="p-6">
              <label className={labelStyle}><Upload size={16}/> Fotografía Actual</label>
              <div className="mt-4 flex flex-col md:flex-row items-center gap-8">
                
                {imagenPreview ? (
                  <div className="relative group w-48 h-48 flex-shrink-0">
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-2xl border border-slate-200 shadow-md"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/turing.webp"; }}
                    />
                    <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                      <label className="flex items-center gap-2 bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors shadow-lg">
                        <Pencil size={14} /> Cambiar
                        <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleImagenChange} className="hidden" />
                      </label>
                      <button type="button" onClick={() => setImagenPreview("")} className="flex items-center gap-2 bg-white text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors shadow-lg">
                        <Trash2 size={14} /> Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer text-slate-400 hover:text-blue-500 group"
                    onClick={() => document.getElementById('editFileInput')?.click()}
                  >
                    <Upload size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest text-center px-4">Subir Fotografía</span>
                    <input id="editFileInput" type="file" className="hidden" onChange={handleImagenChange} accept=".png,.jpg,.jpeg,.webp" />
                  </div>
                )}
                
                <div className="text-sm text-slate-500 font-medium bg-slate-100 p-4 rounded-xl border border-slate-200 flex-1">
                  <p className="text-[#000d2d] font-bold mb-1">Recomendaciones:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Formatos soportados: <strong>JPG, PNG, WEBP</strong>.</li>
                    <li>Utiliza imágenes con fondo transparente o blanco.</li>
                    <li>Se recomienda una resolución cuadrada (ej. 800x800px).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar fijo */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-10 py-5 shadow-[0_-4px_24px_rgba(0,13,45,0.08)] flex justify-end gap-4 z-50">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-8 py-3 bg-[#000d2d] hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}