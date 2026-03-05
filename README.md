# Turing-IA: Proyecto E-commerce Analytics

Sistema para la gestión de inventarios y análisis de datos en tiempo real. Esta plataforma permite el monitoreo de ventas, control de stock y seguridad avanzada mediante la detección de intrusiones.

## 🚀 Características Principales

* **Dashboard:** Gráficas interactivas con Chart.js para visualizar el rendimiento de productos e ingresos.
* **Seguridad de Acceso:** Sistema de bloqueo automático tras 5 intentos fallidos gestionado por Supabase RPC.
* **Diseño Responsivo:** Interfaz adaptativa y optimizada para dispositivos móviles.
* **Reportes:** Generación de reportes ejecutivos de inventario.
* **Control de Roles:** Acceso diferenciado para Administradores, Empleados y Usuarios (Clientes).

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React.
* **Backend:** Next.js API Routes, Supabase Auth.
* **Base de Datos:** PostgreSQL con Row Level Security (RLS).
* **Utilidades:** SweetAlert2 y Chart.js.

## 📂 Estructura del Proyecto

\`\`\`text
app/
 ├── (dashboard)/        # Carpeta con rutas protegidas
 │   ├── admin/          # Panel de administración y gestión de sesiones
 │   ├── empleado/       # Gestión operativa e inventarios
 │   └── user/           # Cliente de la tienda pública
 ├── api/                # Rutas de backend (Endpoints REST)
 ├── components/         # Componentes UI reutilizables
 ├── lib/                # Clientes y configuraciones (Supabase)
 ├── context/            # Proveedores de seguridad (AuthContext)
 ├── services/           # Lógica de servicios y dependencias
 └── middleware.ts       # Protector de rutas y validación de sesiones
\`\`\`

## ⚙️ Configuración del Entorno Local

1. **Clonar repositorio:**
   \`\`\`bash
   git clone https://github.com/leocantu17/Analytics.git
   cd Analytics
   \`\`\`

2. **Instalar dependencias:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Variables de entorno (.env.local):**
   Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de Supabase:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=<TU_URL_DE_SUPABASE>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<TU_ANON_KEY>
   \`\`\`

4. **Ejecutar en desarrollo:**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔒 Base de Datos y Seguridad

El proyecto utiliza una tabla de control de accesos para gestionar la seguridad perimetral. Es necesario ejecutar los scripts SQL (ubicados en la documentación técnica) para activar:
* Las funciones RPC: `verificar_estado_login` y `registrar_intento`.
* Las políticas RLS (Row Level Security) para proteger la lectura y borrado de registros exclusivamente para el panel administrativo.

---
*Nota: Este proyecto es de uso interno para la evaluación técnica de Turing-IA.*