"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, UserMinus, Loader2, RefreshCcw, Mail, Calendar } from "lucide-react";
import Swal from "sweetalert2";
import { UsuarioBloqueado } from "@/types/database";

export default function UserLock() {
  const [usuarios, setUsuarios] = useState<UsuarioBloqueado[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios-bloqueados", { 
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
      const json = await res.json();
      if (json.data) setUsuarios(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

const handleDesbloquear = async (email: string) => {
  setUsuarios(prev => prev.filter(u => u.email !== email));

  try {
    const res = await fetch("/api/usuarios-bloqueados", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Usuario Restaurado',
        text: `Se ha restablecido el acceso para ${email}`,
        timer: 1500,
        showConfirmButton: false
      });
      fetchUsuarios();
    } else {
      fetchUsuarios();
      Swal.fire('Error', 'No se pudo desbloquear', 'error');
    }
  } catch (err) {
    fetchUsuarios();
  }
};

  return (
    <div className="w-full">
      {/* Header del Card Principal */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-[#000d2d] uppercase tracking-wider text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Cuentas Restringidas ({usuarios.length})
        </h2>
        <button 
          onClick={fetchUsuarios}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs transition-colors"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Actualizar lista
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-20 border border-slate-200 flex flex-col items-center shadow-sm">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-400 font-bold tracking-widest text-xs">Cargando...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-dashed border-slate-300 flex flex-col items-center">
          <div className="bg-green-50 p-4 rounded-full text-green-500 mb-4">
            <UserCheck size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Sistema Seguro</h3>
          <p className="text-slate-500 text-sm">No hay intentos de intrusión registrados.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {usuarios.map((user) => (
            <div 
              key={user.id} 
              className="group bg-white border border-slate-200 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between hover:border-blue-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="bg-slate-100 p-4 rounded-2xl text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                    <UserMinus size={24} />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span className="font-black text-[#000d2d] text-lg">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md font-black">
                      {user.intentos_fallidos} INTENTOS FALLIDOS
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar size={12} />
                      <span>{user.ultima_actividad ? new Date(user.ultima_actividad).toLocaleString() : 'Sin actividad'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDesbloquear(user.email)}
                className="mt-4 md:mt-0 bg-[#000d2d] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-900/10"
              >
                Restaurar Acceso
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}