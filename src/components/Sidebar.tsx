"use client";
import Link from "next/link";
import {
  Box,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";

export default function Sidebar() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });

    window.location.replace("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const linkClass =
    "flex items-center gap-3 p-3.5 hover:bg-white/10 rounded-xl transition-all duration-200 group";


  return (
    <>
      {/* Boton hamburguesa */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#000d2d] text-white rounded-2xl shadow-lg border border-blue-900/30"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* ASIDE  */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-72 h-screen bg-[#000d2d] text-white flex flex-col p-6 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* LOGO */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              TURING<span className="text-blue-500">STORE</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">
                Panel de {profile?.rol}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-2 font-medium text-sm">
          {/* Inventario */}
          {(profile?.rol === "admin" || profile?.rol === "empleado") && (
            <Link
              href={profile?.rol === "admin" ? "/admin" : "/empleado"}
              onClick={() => setIsOpen(false)}
              className={linkClass}
            >
              <Box
                size={20}
                className="text-blue-400 group-hover:scale-110 transition-transform"
              />
              <span>Inventario</span>
              <ChevronRight
                size={14}
                className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
              />
            </Link>
          )}

          {/* Gráficas */}
          {(profile?.rol === "admin" || profile?.rol === "empleado") && (
            <Link
              href={
                profile?.rol === "admin"
                  ? "/admin/graficas"
                  : "/empleado/graficas"
              }
              onClick={() => setIsOpen(false)}
              className={linkClass}
            >
              <BarChart3
                size={20}
                className="text-blue-400 group-hover:scale-110 transition-transform"
              />
              <span>Gráficas</span>
              <ChevronRight
                size={14}
                className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
              />
            </Link>
          )}

          {/* Control de Sesiones */}
          {profile?.rol === "admin" && (
            <Link
              href="/admin/sesiones"
              onClick={() => setIsOpen(false)}
              className={linkClass}
            >
              <ShieldCheck
                size={20}
                className="text-blue-400 group-hover:scale-110 transition-transform"
              />
              <span>Control de Sesiones</span>
              <ChevronRight
                size={14}
                className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
              />
            </Link>
          )}
        </nav>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 p-4 mt-auto hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </>
  );
}
