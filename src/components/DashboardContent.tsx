"use client";
import ProductTable from "./ProductTable";
import { Profile } from "@/types/database";

export default function DashboardContent({ profile }: { profile: Profile | null }) {
  const isAdmin = profile?.rol === 'admin';

  return (
    <main className="flex-1 p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#000d2d]">
          Bienvenido, {isAdmin ? 'Administrador' : 'Usuario'}
        </h1>
        <p className="text-slate-500">Panel de control de inventario y analítica técnica.</p>
      </header>

      {isAdmin ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          </div>
          <ProductTable />
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
          El catálogo de productos para consultores se está sincronizando...
        </div>
      )}
    </main>
  );
}