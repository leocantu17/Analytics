Turing-IA
Sistema para la gestión de inventarios y análisis de datos en tiempo real. Esta página permite el monitoreo de ventas, control de stock y seguridad avanzada mediante la detección de intrusiones.

Caracteristicas:
    *Dashboard: Gráficas interactivas con Chart.js para visualizar el rendimiento de productos e ingresos.
    *Seguridad de acceso: Sistema de bloqueo automático tras 5 intentos fallidos gestionado por Supabase RPC.
    *Diseño responsivo: Sidebar adaptativo para dispositvos móviles.
    *Reportes PDF: Generación de reportes ejecutivos de inventario mediante Canvas 2D.
    *Control de roles: Acceso diferenciado para administradores y Empleados.

Stack tecnológico:
    *Frontend: Next.js(App router),Tailwind CSS, Lucide React.
    *Backend: Next.js API Routes, Supabase Auth.
    *Base de datos: PostgreSQL con Row Level Security (RLS).
    *Utilidades: SweetAlert2 y Chart.js.

Estructura del proyecto
    app/
        (dashboard)/         #Carpeta con rutas protegidas
            admin/           #Panel de administración y gestión de sesiones
            empleado/        #Gestión operativa e inventarios
            user/            #Cliente de la tienda
        api/                 #Rutas de backend
        components/          #Componentes UI reutilizables
        lib/                 #Clientes y configuraciones
        context/             #Proveedores de seguridad (AuthContext)
        services/            #Lógica de login
        middleware.ts        #Protector de rutas y validación de sesiones

Configuración del repositorio:
    1-Clonar repositorio.
        git clone https://github.com/leocantu17/Analytics.git
    
    2-Instalar dependencias
        npm install
    
    3-Variables de entorno (.env.local)
        Crea un archivo en la raíz con tus credenciales de Supabase
            NEXT_PUBLIC_SUPABASE_URL=https://wqmfkkpfxlyfafdeeumx.supabase.co
            NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_d8AW8T1GQQvSwJDk69l3xA_hT_IreSu

    4- Ejecutar en desarrollo:
        npm run dev

Base de datos (seguridad)
    El proyecto utiliza una tabla de control de acceso para gestionar la seguridad. Es necesario ejecutar los scripts SQL(ubicados en la documentación) para activar:
        *Las funciones RPC: verificar_estado_login y registrar_intento
        *Las politicas RLS para proteger la lectura y borrado de registros desde el panel administrativo.

Este proyecto es de uso interno para Turing-IA