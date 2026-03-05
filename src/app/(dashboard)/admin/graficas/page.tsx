"use client";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import GraficasInventario from "@/components/GraficasInventario";
import Sidebar from "@/components/Sidebar";
import { Producto, Ventas } from "@/types/database";

export default function GraficasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Ventas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resVentas] = await Promise.all([
          fetch("/api/productos"),
          fetch("/api/ventas"),
        ]);
        const result = await resProd.json();
        const resultVentas = await resVentas.json();
        if (result && Array.isArray(result.data)) {
          setProductos(result.data);
        }
        if (resultVentas && Array.isArray(resultVentas.data)) {
          setVentas(resultVentas.data);
        }
      } catch (err) {
        console.error("Error al cargar los datos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Mensaje mientras carga */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-[80vh] w-full gap-4">
            <Loader2 className="h-12 w-12 text-[#000d2d] animate-spin" />
            <p className="text-[#000d2d] font-bold tracking-widest animate-pulse">
              Cargando datos...
            </p>
          </div>
        ) : (
          <>
            <header className="mb-10 flex justify-between items-end animate-in fade-in duration-500">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="text-blue-600" size={24} />
                  <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">
                    Business Intelligence
                  </span>
                </div>
                <h1 className="text-4xl font-black text-[#000d2d] tracking-tight">
                  Panel <span className="text-blue-600">Analítico</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                  Monitoreo de rendimiento y proyección de inventario en tiempo
                  real.
                </p>
              </div>

              <div className="hidden md:flex gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Total Productos
                    </p>
                    <p className="text-xl font-black text-[#000d2d]">
                      {productos.length}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Sección de Gráficas */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <GraficasInventario productos={productos} ventas={ventas} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
