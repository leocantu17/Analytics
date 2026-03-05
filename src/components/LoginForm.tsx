"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthProvider";
import { Eye, EyeOff, Loader2, AlertOctagon } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data: estado } = await supabase.rpc('verificar_estado_login', { p_email: email });
      
      if (estado?.bloqueado) {
        setError("Cuenta bloqueada temporalmente. Intenta en 15 minutos.");
        setIsSubmitting(false);
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        const { data: intento } = await supabase.rpc('registrar_intento', { 
          p_email: email, 
          p_exito: false 
        });
        
        if (intento?.bloqueado) {
          setError("Has superado los 5 intentos. Cuenta bloqueada por 15 minutos.");
        } else {
          const restantes = intento?.restantes ?? 5;
          setError(`Credenciales incorrectas. Te quedan ${restantes} intentos.`);
        }
        setIsSubmitting(false);
      } else {
        await supabase.rpc('registrar_intento', { p_email: email, p_exito: true });
        

        window.location.href = '/'; 
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Error de conexión. Inténtalo de nuevo.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000d2d] px-6 text-white font-sans">
      <div className="w-full max-w-md space-y-8 bg-[#00153d] p-10 rounded-2xl border border-blue-900/30 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/turing.webp"
            alt="Turing-IA Logo"
            width={100}
            height={100}
            className="mb-4"
          />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Portal Turing-IA
          </h2>
          <p className="mt-2 text-blue-200/60 text-sm italic">
            Donde la inteligencia se transforma en soluciones
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          {error && (
            <div className="p-3 text-sm bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg flex items-start gap-2">
              <AlertOctagon size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@turing-ia.com"
            className="w-full rounded-lg bg-[#00215a] border border-blue-800/50 text-white p-3 outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg bg-[#00215a] border border-blue-800/50 text-white p-3 pr-10 outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-cyan-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-bold text-white hover:brightness-110 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}