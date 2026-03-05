"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  LogOut,
  PackageOpen,
  Loader2,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import {
  Producto,
  ItemCarrito,
  Categoria,
  Perfil,
  Venta,
} from "@/types/database";
import { useRouter } from "next/navigation";

const CARRITO_KEY = "turing_carrito";

function leerCarrito(): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(CARRITO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function guardarCarrito(items: ItemCarrito[]) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
}

export default function InicioUser() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const [perfilDrawer, setPerfilDrawer] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [ventaExpandida, setVentaExpandida] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCarrito(leerCarrito());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCats] = await Promise.all([
          fetch("/api/productos"),
          fetch("/api/categorias"),
        ]);
        const jsonProd = await resProd.json();
        const jsonCats = await resCats.json();
        setProductos(jsonProd.data || []);
        const cats = Array.isArray(jsonCats) ? jsonCats : jsonCats.data;
        setCategorias(cats || []);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });

    window.location.replace("/");
  };
  const abrirPerfil = useCallback(async () => {
    setPerfilDrawer(true);

    if (perfil && ventas.length > 0) return;

    setLoadingPerfil(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();

      if (res.ok) {
        setPerfil(result.perfil);
        setVentas(result.historial);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error al cargar perfil desde API:", err);
    } finally {
      setLoadingPerfil(false);
    }
  }, [perfil, ventas.length]);

  const agregarAlCarrito = useCallback((prod: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.id === prod.id);
      let nuevo: ItemCarrito[];
      if (existe) {
        nuevo = prev.map((i) =>
          i.id === prod.id && i.cantidad < prod.stock
            ? { ...i, cantidad: i.cantidad + 1 }
            : i,
        );
      } else {
        nuevo = [
          ...prev,
          {
            id: prod.id,
            nombre: prod.nombre,
            precio: prod.precio,
            imagen_url: prod.imagen_url ?? "/turing.webp",
            cantidad: 1,
            stock: prod.stock,
          },
        ];
      }
      guardarCarrito(nuevo);
      return nuevo;
    });
  }, []);

  const cambiarCantidad = useCallback((id: string, delta: number) => {
    setCarrito((prev) => {
      const nuevo = prev
        .map((i) => {
          if (i.id !== id) return i;
          const nuevaCantidad = i.cantidad + delta;
          if (nuevaCantidad <= 0) return null;
          if (nuevaCantidad > i.stock) return i;
          return { ...i, cantidad: nuevaCantidad };
        })
        .filter(Boolean) as ItemCarrito[];
      guardarCarrito(nuevo);
      return nuevo;
    });
  }, []);

  const eliminarItem = useCallback((id: string) => {
    setCarrito((prev) => {
      const nuevo = prev.filter((i) => i.id !== id);
      guardarCarrito(nuevo);
      return nuevo;
    });
  }, []);

  const confirmarPedido = async () => {
    if (carrito.length === 0) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Swal.fire("Error", "Debes iniciar sesión para comprar", "error");
      return;
    }
    Swal.fire({
      title: "Procesando compra...",
      text: "Estamos validando tu pedido con Turing-IA",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("/api/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrito, perfil_id: user.id }),
      });

      if (res.ok) {
        setPedidoConfirmado(true);
        setCarrito([]);
        guardarCarrito([]);

        Swal.fire({
          icon: "success",
          title: "¡Pedido Confirmado!",
          text: "Tu hardware está en camino.",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          setPedidoConfirmado(false);
          setDrawerAbierto(false);
        }, 2500);
      } else {
        throw new Error();
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "No pudimos procesar tu compra. Revisa el stock.",
        "error",
      );
    }
  };

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  const totalPrecio = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

  const productosFiltrados = productos.filter((p) => {
    const cumpleCategoria =
      categoriaActiva === "todas" || p.categoria_id === categoriaActiva;
    const cumpleBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    return cumpleCategoria && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
        <Loader2 className="h-12 w-12 text-[#000d2d] animate-spin" />
        <p className="text-[#000d2d] font-bold tracking-widest animate-pulse uppercase text-xs">
          Cargando productos
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Overlay compartido */}
      {(drawerAbierto || perfilDrawer) && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setDrawerAbierto(false);
            setPerfilDrawer(false);
          }}
        />
      )}

      {/* Drawer de Perfil */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          perfilDrawer ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <User size={22} className="text-[#000d2d]" />
            <h2 className="text-lg font-black text-[#000d2d] tracking-tight">
              Mi Perfil
            </h2>
          </div>
          <button
            onClick={() => setPerfilDrawer(false)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingPerfil ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-10 h-10 text-[#000d2d] animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                Cargando perfil
              </p>
            </div>
          ) : (
            <>
              {/* Datos del perfil */}
              <div className="px-6 py-6 border-b border-slate-100">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#000d2d] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">
                      {perfil?.email?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-black text-[#000d2d] text-lg leading-tight">
                      {perfil?.email?.split("@")[0] ?? "—"}
                    </p>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                        perfil?.rol === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {perfil?.rol ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Datos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Email
                      </p>
                      <p className="text-sm font-bold text-[#000d2d]">
                        {perfil?.email ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <ShieldCheck
                      size={16}
                      className="text-slate-400 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Rol
                      </p>
                      <p className="text-sm font-bold text-[#000d2d] capitalize">
                        {perfil?.rol ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <CalendarDays
                      size={16}
                      className="text-slate-400 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Miembro desde
                      </p>
                      <p className="text-sm font-bold text-[#000d2d]">
                        {perfil?.creado_en
                          ? new Date(perfil.creado_en).toLocaleDateString(
                              "es-MX",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial de pedidos */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-[#000d2d] p-1.5 rounded-lg">
                    <Receipt size={14} className="text-white" />
                  </div>
                  <h3 className="font-black text-[#000d2d] text-xs uppercase tracking-[0.2em]">
                    Historial de Pedidos
                  </h3>
                  {ventas.length > 0 && (
                    <span className="ml-auto bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-100">
                      {ventas.length} compras
                    </span>
                  )}
                </div>

                {ventas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Receipt
                      className="w-10 h-10 text-slate-300 mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm font-black text-slate-400">
                      Sin pedidos aún
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wider">
                      Tus compras aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ventas.map((venta) => (
                      <div
                        key={venta.id}
                        className={`transition-all duration-300 rounded-2xl border ${
                          ventaExpandida === venta.id
                            ? "bg-white border-blue-200 shadow-lg shadow-blue-900/5 ring-1 ring-blue-50"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <button
                          onClick={() =>
                            setVentaExpandida(
                              ventaExpandida === venta.id ? null : venta.id,
                            )
                          }
                          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/50 transition-all text-left group"
                        >
                          {/* Miniatura del Producto */}
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                            <img
                              src={
                                venta.productos?.imagen_url || "/turing.webp"
                              }
                              alt=""
                              className="w-full h-full object-contain p-1.5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/turing.webp";
                              }}
                            />
                          </div>

                          {/* Info Principal */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-[#000d2d] truncate uppercase tracking-tight">
                              {venta.productos?.nombre ?? "Producto"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">
                                {new Date(venta.creado_en).toLocaleDateString(
                                  "es-MX",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Precio y Toggle */}
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-sm font-black text-blue-600">
                                ${Number(venta.total).toLocaleString("es-MX")}
                              </p>
                            </div>
                            <div
                              className={`transition-transform duration-300 ${ventaExpandida === venta.id ? "rotate-180" : ""}`}
                            >
                              <ChevronDown
                                size={16}
                                className="text-slate-400"
                              />
                            </div>
                          </div>
                        </button>

                        {/* Detalles Expandibles */}
                        {ventaExpandida === venta.id && (
                          <div className="px-5 pb-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-slate-50/50 rounded-xl p-3 space-y-2 border border-slate-100">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500 font-bold uppercase tracking-wider">
                                  Cantidad
                                </span>
                                <span className="font-black text-[#000d2d]">
                                  {venta.cantidad} unidades
                                </span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500 font-bold uppercase tracking-wider">
                                  Precio Unitario
                                </span>
                                <span className="font-black text-[#000d2d]">
                                  $
                                  {Number(
                                    venta.total / venta.cantidad,
                                  ).toLocaleString("es-MX")}
                                </span>
                              </div>
                              <div className="flex justify-between text-[10px] border-t border-slate-200 pt-2 mt-2">
                                <span className="font-black text-[#000d2d] uppercase tracking-[0.1em]">
                                  Total Pagado
                                </span>
                                <span className="font-black text-blue-600 text-xs">
                                  ${Number(venta.total).toLocaleString("es-MX")}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer — cerrar sesión */}
        <div className="px-6 py-5 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 border border-red-100 py-3 rounded-2xl transition-all font-black text-sm"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Drawer del carrito */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          drawerAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-[#000d2d]" />
            <h2 className="text-lg font-black text-[#000d2d] tracking-tight">
              Tu Carrito
            </h2>
            {totalItems > 0 && (
              <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerAbierto(false)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido del drawer */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {pedidoConfirmado ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <CheckCircle2
                className="w-20 h-20 text-green-500"
                strokeWidth={1.5}
              />
              <h3 className="text-2xl font-black text-[#000d2d]">
                ¡Pedido Confirmado!
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                Tu pedido ha sido registrado exitosamente.
              </p>
            </div>
          ) : carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart
                className="w-16 h-16 text-slate-200"
                strokeWidth={1.5}
              />
              <h3 className="text-xl font-black text-slate-700">
                Tu carrito está vacío
              </h3>
              <p className="text-slate-400 font-medium text-sm">
                Agrega productos para comenzar tu pedido.
              </p>
              <button
                onClick={() => setDrawerAbierto(false)}
                className="mt-2 px-6 py-2.5 bg-[#000d2d] text-white font-black text-sm rounded-2xl hover:bg-blue-600 transition-all"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {carrito.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100"
                >
                  {/* Imagen */}
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 overflow-hidden">
                    <img
                      src={item.imagen_url || "/turing.webp"}
                      alt={item.nombre}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/turing.webp";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#000d2d] text-sm leading-tight line-clamp-2 mb-2">
                      {item.nombre}
                    </p>
                    <p className="text-blue-600 font-black text-sm">
                      ${Number(item.precio).toLocaleString("es-MX")}
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => cambiarCantidad(item.id, -1)}
                        className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-black text-[#000d2d] w-6 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => cambiarCantidad(item.id, 1)}
                        disabled={item.cantidad >= item.stock}
                        className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all disabled:opacity-30"
                      >
                        <Plus className="black" size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => eliminarItem(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                    <p className="text-xs font-black text-slate-500">
                      $
                      {Number(item.precio * item.cantidad).toLocaleString(
                        "es-MX",
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del drawer — resumen y confirmar */}
        {!pedidoConfirmado && carrito.length > 0 && (
          <div className="px-6 py-5 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">
                {totalItems} producto{totalItems !== 1 ? "s" : ""}
              </span>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Total
                </p>
                <p className="text-2xl font-black text-[#000d2d]">
                  ${totalPrecio.toLocaleString("es-MX")}
                </p>
              </div>
            </div>
            <button
              onClick={confirmarPedido}
              className="w-full bg-[#000d2d] hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all text-sm tracking-wide shadow-lg shadow-slate-900/20 active:scale-95"
            >
              Confirmar Pedido
            </button>
          </div>
        )}
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img
                src="/turing.webp"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-black text-[#000d2d] tracking-tight">
                TURING<span className="text-blue-600">STORE</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={abrirPerfil}
                className="p-2.5 text-slate-400 hover:text-[#000d2d] hover:bg-slate-100 rounded-xl transition-all"
                title="Mi perfil"
              >
                <User size={22} />
              </button>

              <button
                onClick={() => setDrawerAbierto(true)}
                className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              <div className="w-px h-6 bg-slate-200 hidden md:block" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-bold text-sm"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#000d2d] py-16 px-6 relative overflow-hidden shadow-inner">
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">
            Compra Inteligente
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 italic">
            Tecnología, Hogar y{" "}
            <span className="text-blue-500 underline decoration-2 underline-offset-8">
              Más
            </span>
          </h2>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categorías */}
          <div className="flex gap-3 overflow-x-auto pb-4 w-full md:w-auto no-scrollbar">
            <button
              onClick={() => setCategoriaActiva("todas")}
              className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                categoriaActiva === "todas"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
              }`}
            >
              Todo
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  categoriaActiva === cat.id
                    ? "bg-[#000d2d] text-white shadow-lg shadow-slate-900/20"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <PackageOpen className="w-20 h-20 text-slate-200 mb-4" />
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Sin resultados
            </h3>
            <p className="text-slate-400 font-medium">
              No hay productos que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {productosFiltrados.map((prod) => {
              const enCarrito = carrito.find((i) => i.id === prod.id);
              return (
                <div
                  key={prod.id}
                  className="group bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 flex flex-col"
                >
                  <div className="relative w-full h-52 bg-slate-50 rounded-2xl mb-6 p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={prod.imagen_url || "/turing.webp"}
                      alt={prod.nombre}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.src = "/turing.webp";
                        t.onerror = null;
                      }}
                    />
                    {prod.categorias?.nombre && (
                      <span className="absolute top-3 left-3 bg-white/80 backdrop-blur text-[#000d2d] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                        {prod.categorias.nombre}
                      </span>
                    )}
                    {prod.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Sin stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow">
                    <h4 className="text-[#000d2d] font-black text-lg leading-tight mb-4 line-clamp-2 h-14">
                      {prod.nombre}
                    </h4>

                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                          Precio
                        </p>
                        <p className="text-2xl font-black text-[#000d2d]">
                          ${Number(prod.precio).toLocaleString("es-MX")}
                        </p>
                      </div>

                      <button
                        disabled={prod.stock <= 0}
                        onClick={() => agregarAlCarrito(prod)}
                        className={`p-4 rounded-2xl transition-all shadow-lg active:scale-90 ${
                          enCarrito
                            ? "bg-blue-600 text-white shadow-blue-600/20"
                            : "bg-[#000d2d] text-white shadow-slate-900/10 hover:bg-blue-600"
                        } disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none`}
                      >
                        <ShoppingCart size={20} strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Indicador de cantidad en carrito */}
                    {enCarrito && (
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3 text-right">
                        {enCarrito.cantidad} en carrito
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
