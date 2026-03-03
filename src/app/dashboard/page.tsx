"use client";
import { useAuth } from "@/context/AuthProvider";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-[#000d2d]">Bienvenido, Consultor</h1>
          <p className="text-slate-500">Panel de visualización general de Turing-IA.</p>
        </header>
        
      </main>
    </div>
  );
}