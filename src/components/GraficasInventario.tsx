"use client";
import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FileSpreadsheet, FileText } from "lucide-react";
import Swal from "sweetalert2";
import { Producto, Ventas } from "@/types/database";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  productos: Producto[];
  ventas: Ventas[];
}

export default function GraficasInventario({ productos, ventas }: Props) {
  const stockChartRef = useRef<ChartJS<"bar"> | null>(null);
  const salesChartRef = useRef<ChartJS<"bar"> | null>(null);
  const stockChartData = {
    labels: productos.map((p) => p.nombre),
    datasets: [
      {
        label: "Unidades en Inventario",
        data: productos.map((p) => p.stock),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 5,
      },
    ],
  };

  const salesChartData = {
    labels: ventas.map((v) => v.nombre),
    datasets: [
      {
        label: "Ingresos Totales ($)",
        data: ventas.map((v) => v.totalVendido),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderRadius: 5,
      },
    ],
  };

  const exportToExcel = async () => {
    const exceljs = await import("exceljs");
    const ExcelJS = (exceljs as any).default ?? exceljs;

    const wb = new ExcelJS.Workbook();
    wb.creator = "GraficasInventario";
    wb.created = new Date();

    const applyHeader = (row: {
      eachCell: (cb: (cell: unknown) => void) => void;
    }) => {
      row.eachCell((cell: unknown) => {
        const c = cell as {
          font: unknown;
          fill: unknown;
          alignment: unknown;
        };
        c.font = { bold: true, color: { argb: "FFFFFFFF" } };
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1E3A5F" },
        };
        c.alignment = { horizontal: "center" };
      });
    };

    const wsStock = wb.addWorksheet("Stock Actual");
    wsStock.columns = [
      { header: "Producto", key: "nombre", width: 32 },
      { header: "Unidades en Inventario", key: "stock", width: 28 },
    ];
    applyHeader(wsStock.getRow(1));
    productos.forEach((p: Producto) =>
      wsStock.addRow({ nombre: p.nombre, stock: p.stock }),
    );

    const wsVentas = wb.addWorksheet("Rendimiento por Producto");
    wsVentas.columns = [
      { header: "Producto", key: "nombre", width: 32 },
      { header: "Ingresos Totales ($)", key: "totalVendido", width: 28 },
    ];
    applyHeader(wsVentas.getRow(1));
    ventas.forEach((v: Ventas) =>
      wsVentas.addRow({ nombre: v.nombre, totalVendido: v.totalVendido }),
    );

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventario_graficas.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    Swal.fire({
      title: "Generando Reporte...",
      text: "Procesando gráficos y tablas de alta resolución",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const getDataURL = (ref: ChartJS<"bar"> | null) =>
      ref?.canvas?.toDataURL("image/png") ?? null;

    const stockImg = getDataURL(stockChartRef.current);
    const salesImg = getDataURL(salesChartRef.current);

    const W = 1123,
      H = 794,
      M = 56;
    const colW = (W - M * 3) / 2;
    const chartH = 300; 

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Fondo Blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Encabezado
    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(0, 0, W, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("Reporte de Inventario - Turing-IA", M, 38);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    const fecha = new Date().toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    ctx.fillText(`Generado el ${fecha}`, W - M - 200, 38);

    // Función para cargar y dibujar imagen de forma asíncrona
    const drawImageAsync = (
      src: string | null,
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      return new Promise<void>((resolve) => {
        if (!src) return resolve();
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, x, y, w, h);
          resolve();
        };
        img.src = src;
      });
    };

    // Dibujar títulos de secciones
    ctx.fillStyle = "#1e3a5f";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("Stock Actual", M, 100);
    ctx.fillText("Rendimiento por Producto", M * 2 + colW, 100);

    // Esperar a que los gráficos se dibujen
    await Promise.all([
      drawImageAsync(stockImg, M, 110, colW, 300),
      drawImageAsync(salesImg, M * 2 + colW, 110, colW, 300),
    ]);

    const tableY = 110 + chartH + 40;

    const drawTable = (
      rows: { col1: string; col2: string }[],
      x: number,
      headers: [string, string],
    ) => {
      const colB = x + colW * 0.7;
      const rowH = 25;

      // Header Tabla
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(x, tableY, colW, rowH);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(headers[0], x + 10, tableY + 17);
      ctx.fillText(headers[1], colB + 10, tableY + 17);

      // Filas
      rows.forEach((row, i) => {
        const y = tableY + rowH + i * rowH;
        if (y + rowH > H - M) return; 

        ctx.fillStyle = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        ctx.fillRect(x, y, colW, rowH);

        ctx.fillStyle = "#334155";
        ctx.font = "11px sans-serif";
        ctx.fillText(row.col1.substring(0, 35), x + 10, y + 17);
        ctx.fillText(row.col2, colB + 10, y + 17);

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, colW, rowH);
      });
    };

    drawTable(
      productos.map((p) => ({ col1: p.nombre, col2: String(p.stock) })),
      M,
      ["Producto", "Stock"],
    );

    drawTable(
      ventas.map((v) => ({
        col1: v.nombre,
        col2: v.totalVendido.toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
        }),
      })),
      M * 2 + colW,
      ["Producto", "Ingresos"],
    );
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const win = window.open("", "_blank");

    if (win) {
      win.document.title = "Reporte de Inventario - Turing-IA";

      const img = win.document.createElement("img");
      img.src = dataUrl;
      img.style.width = "100%";

      const style = win.document.createElement("style");
      style.textContent = `
    @media print { 
      @page { size: A4 landscape; margin: 0; } 
      body { margin: 0; } 
      img { width: 100vw; height: 100vh; object-fit: contain; } 
    }
    body { margin: 0; display: flex; justify-content: center; background: #525659; }
    img { background: white; box-shadow: 0 0 20px rgba(0,0,0,0.4); }
  `;

      win.document.head.appendChild(style);
      win.document.body.appendChild(img);

      img.onload = () => {
        Swal.close(); 
        win.print();
        win.close();
      };
      win.document.close();
    }else{
      Swal.close();
      Swal.fire("Aviso", "Por favor permite las ventanas emergentes para ver el reporte", "info");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 justify-end">
        <button
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel
        </button>

        <button
          onClick={exportToPDF}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4">Stock Actual</h3>
          <div className="h-64">
            <Bar
              ref={stockChartRef}
              data={stockChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4">
            Rendimiento por Producto
          </h3>
          <div className="h-64">
            <Bar
              ref={salesChartRef}
              data={salesChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
