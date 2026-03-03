import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";

export const login = async (email: string, pass: string): Promise<Profile> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (authError || !user) throw new Error("Credenciales inválidas");

  const { data: profile, error: profileError } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Usuario no autorizado en el sistema");
  }
  return profile as Profile;
};
