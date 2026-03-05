"use client";
import Sidebar from "@/components/Sidebar";
import UserLock from "@/components/UserLock";
import { ShieldAlert, Info } from "lucide-react";

export default function SesionesPage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Área de Contenido */}
      <main className="flex-1 p-8 lg:p-12">
        <header className="max-w-5xl mx-auto mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-2xl text-red-600 shadow-sm">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#000d2d] tracking-tight">
                Centro de <span className="text-blue-600">Seguridad</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Gestión de cuentas bloqueadas por protocolos de fuerza bruta.
              </p>
            </div>
          </div>
          
          {/* Banner de información rápida */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-800 text-sm">
            <Info size={18} />
            <p>
              Los usuarios se bloquean automáticamente tras <strong>5 intentos fallidos</strong>. 
              Al desbloquearlos, sus intentos se reinician a cero.
            </p>
          </div>
        </header>

        <section className="max-w-5xl mx-auto">
          <UserLock />
        </section>
      </main>
    </div>
  );
}