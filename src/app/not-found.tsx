"use client";
import Link from "next/link";
import { MoveLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative inline-block">
          <Ghost size={80} className="text-[#000d2d] animate-bounce" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-slate-200 rounded-full blur-sm"></div>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-black text-[#000d2d] tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-slate-800">Módulo no encontrado</h2>
          <p className="text-slate-500 font-medium">
            Lo sentimos, el recurso que buscas no existe o ha sido movido a otra coordenada.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#000d2d] hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-900/10 active:scale-95 group"
        >
          <MoveLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>
      </div>
      
      {/* Decoración de fondo */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    </div>
  );
}