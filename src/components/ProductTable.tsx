"use client";
import { useEffect, useState } from "react";
import { Pencil, PlusCircle, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthProvider";
import { Producto} from "@/types/database";

export default function ProductTable() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/productos");
        const result = await res.json();
        if (result && Array.isArray(result.data)) {
          setProductos(result.data);
        }
      } catch (err) {
        console.error("Error al cargar los datos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Loader2 className="h-10 w-10 text-[#000d2d] animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Cargando inventario
        </p>
      </div>
    );
  }

  const confirmarEliminacion = async (id: string, nombre: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      text: "Esta acción borrará el registro de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl px-6 py-3 font-bold",
        cancelButton: "rounded-xl px-6 py-3 font-bold",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });

        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El producto ha sido removido.",
            timer: 1500,
            showConfirmButton: false,
          });

          setProductos((prev) => prev.filter((p) => p.id !== id));
        } else {
          throw new Error();
        }
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#000d2d] rounded-full" />
          <h2 className="text-lg font-bold text-slate-800">
            Inventario de Productos
          </h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
            {productos.length} artículos
          </span>
        </div>

        <Link
          href="/admin/productos/agregar"
          className="inline-flex items-center gap-2 bg-[#000d2d] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 border border-blue-900/30"
        >
          <PlusCircle size={17} strokeWidth={2.5} />
          Agregar Producto
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest w-16">
                Imagen
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                Producto
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                Categoría
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                Precio
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                Stock
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                Estado
              </th>

              {profile?.rol === "admin" && (
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.map((prod) => (
              <tr
                key={prod.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-5 py-4">
                  {prod.imagen_url ? (
                    <img
                      src={prod.imagen_url || "/turing.webp"}
                      alt={prod.nombre}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/turing.webp";
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 text-xs font-bold">
                      N/A
                    </div>
                  )}
                </td>

                <td className="px-5 py-4">
                  <p className="text-slate-800 font-semibold text-sm">
                    {prod.nombre}
                  </p>
                </td>

                <td className="px-5 py-4">
                  {prod.categorias?.nombre ? (
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                      {prod.categorias.nombre}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <p className="text-slate-800 font-bold text-sm">
                    ${prod.precio.toLocaleString()}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-slate-500 text-sm">{prod.stock} uds.</p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      prod.stock > 20
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-orange-50 text-orange-700 border border-orange-100"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        prod.stock > 20 ? "bg-green-500" : "bg-orange-400"
                      }`}
                    />
                    {prod.stock > 20 ? "Disponible" : "Stock Bajo"}
                  </span>
                </td>

                {profile?.rol === "admin" && (
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/productos/${prod.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#000d2d] hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-slate-200"
                      title="Editar producto"
                    >
                      <Pencil size={13} strokeWidth={2.2} />
                    </Link>
                    <button
                      onClick={() => confirmarEliminacion(prod.id, prod.nombre)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {productos.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            No hay productos registrados aún.
          </div>
        )}
      </div>
    </div>
  );
}
