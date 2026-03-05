"use client";
import Sidebar from "@/components/Sidebar";
import ProductTable from "@/components/ProductTable";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10">
        <header className="mb-10 text-[#000d2d]">
          <h1 className="text-3xl font-black italic">Gestión de Inventario</h1>
          <p className="text-slate-500 font-medium">
            Control total de stock y precios de Turing-IA.
          </p>
        </header>

        <ProductTable />
      </main>
    </div>
  );
}
