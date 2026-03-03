'use client';
import Link from "next/link";
import { LayoutDashboard, Box, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/context/AuthProvider";

export default function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="w-64 bg-[#000d2d] text-white flex flex-col p-6 shadow-2xl h-screen sticky top-0">
      <nav className="flex-1 space-y-4">
        <Link href="/dashboard" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all">
          <LayoutDashboard size={20}/> <span>Dashboard</span>
        </Link>
        
        {profile?.rol === 'admin' && (
          <Link href="/dashboard/admin" className="flex items-center gap-3 text-cyan-400 bg-blue-900/30 p-3 rounded-lg">
            <Box size={20}/> <span>Inventario (Admin)</span>
          </Link>
        )}
      </nav>
      <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-red-400 p-3 mt-auto">
        <LogOut size={20}/> <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
}