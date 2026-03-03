"use client";
import { useEffect, useState } from "react";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categorias?: { nombre: string };
}

export default function ProductTable() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const result = await res.json();
      
      if (result && Array.isArray(result.data)) {
        setProductos(result.data);
      }
    } catch (err) {
      console.error("Error al cargar los productos", err);
    } finally {
      setLoading(false);
    }
  };
  fetchProductos();
}, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Cargando inventario...</p>
      </div>
    );
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Inventario de Productos
        </h2>
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded">
          {productos.length} Artículos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(productos) &&
              productos.map((prod) => (
                <tr
                  key={prod.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 font-medium">
                      {prod.nombre}{" "}
                      {prod.categorias?.nombre && `(${prod.categorias.nombre})`}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 font-bold">
                      ${prod.precio.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-600">{prod.stock} unidades</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        prod.stock > 20 ? "text-green-900" : "text-orange-900"
                      }`}
                    >
                      <span
                        className={`absolute inset-0 opacity-50 rounded-full ${
                          prod.stock > 20 ? "bg-green-200" : "bg-orange-200"
                        }`}
                      ></span>
                      <span className="relative text-xs">
                        {prod.stock > 20 ? "Disponible" : "Stock Bajo"}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
