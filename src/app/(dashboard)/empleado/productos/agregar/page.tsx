"use client";
import { useRouter } from "next/navigation";
import FormProducto from "@/components/FormProducto"; 

export default function PaginaAgregarProducto() {
  const router = useRouter();

  const handleSuccess = () => {
    setTimeout(() => {
      router.push("/empleado"); 
    }, 2000);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Estilizado */}
      <div className="bg-[#000d2d] px-8 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-400 rounded-full" />
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-0.5">
              Panel de Administración · Inventario
            </p>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Configuración de Producto
            </h1>
          </div>
        </div>
      </div>

      {/* Contenedor del Formulario */}
      <div className="max-w-4xl mx-auto px-8 py-10 pb-28">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <FormProducto 
            onSuccess={handleSuccess} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
      
      {/* Footer Informativo */}
      <footer className="max-w-4xl mx-auto px-8 pb-10 text-center">
        <p className="text-slate-400 text-sm">
          Asegúrese de que todos los campos marcados con (*) estén completos antes de guardar.
        </p>
      </footer>
    </div>
  );
}