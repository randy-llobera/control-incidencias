# Control de Comportamiento

Sistema de gestión de incidentes estudiantiles con roles de usuario (Profesor, Coordinador, Administrador).

## Características

- **Autenticación**: Supabase Auth con registro de usuarios
- **Roles**: Profesor (por defecto), Coordinador, Administrador
- **Gestión de Incidentes**: Crear, filtrar y exportar incidentes
- **Gestión de Estudiantes**: CRUD de estudiantes por profesores
- **Gestión de Grupos y Categorías**: Por coordinadores y administradores
- **Dashboard**: Estadísticas para coordinadores y administradores
- **Gestión de Usuarios**: Asignación de roles por administradores
- **Exportación CSV**: Filtros aplicables a la exportación

## Tecnologías

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v3.4
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd control-comportamiento
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Copiar `env.local.example` a `.env.local`
3. Llenar las variables de entorno con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_de_supabase
```

### 4. Configurar la base de datos

Ejecutar los scripts SQL en el SQL Editor de Supabase siguiendo las instrucciones en `supabase/README.md`:

1. Crear tablas (roles, users, groups, categories, students, incidents)
2. Insertar roles por defecto (admin, coordinator, teacher)
3. Configurar RLS (Row Level Security) policies
4. Crear función de manejo de nuevos usuarios

### 5. Ejecutar el proyecto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Uso

### Flujo de Usuario

1. **Registro**: Los nuevos usuarios se registran como "Profesor" por defecto
2. **Login**: Todos los usuarios van a `/incidentes` después del login
3. **Navegación**: Sidebar muestra opciones según el rol del usuario

### Roles y Permisos

#### Profesor (por defecto)
- Ver y crear incidentes
- Gestionar estudiantes
- Filtrar y exportar incidentes

#### Coordinador
- Todas las funciones de Profesor
- Gestionar grupos
- Gestionar categorías
- Ver dashboard con estadísticas

#### Administrador
- Todas las funciones de Coordinador
- Gestionar usuarios y asignar roles

### Páginas Principales

- **`/`**: Página de inicio con enlace a autenticación
- **`/auth`**: Login y registro de usuarios
- **`/incidentes`**: Lista de incidentes con filtros y formulario de creación
- **`/estudiantes`**: CRUD de estudiantes (profesores)
- **`/grupos`**: CRUD de grupos (coordinadores+)
- **`/categorias`**: CRUD de categorías (coordinadores+)
- **`/dashboard`**: Estadísticas y resúmenes (coordinadores+)
- **`/usuarios`**: Gestión de usuarios y roles (administradores)

## Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js (App Router)
│   ├── auth/              # Autenticación
│   ├── incidentes/        # Gestión de incidentes
│   ├── estudiantes/       # Gestión de estudiantes
│   ├── grupos/            # Gestión de grupos
│   ├── categorias/        # Gestión de categorías
│   ├── dashboard/         # Dashboard con estadísticas
│   └── usuarios/          # Gestión de usuarios
├── components/            # Componentes reutilizables
│   ├── Layout.tsx         # Layout principal con navegación
│   └── Navigation.tsx     # Navegación basada en roles
├── lib/                   # Utilidades y configuración
│   ├── supabase.ts        # Cliente de Supabase (browser)
│   └── supabase-server.ts # Cliente de Supabase (server)
└── types/                 # Tipos de TypeScript
    └── database.ts        # Tipos de la base de datos
```

## Despliegue

### Frontend (Vercel)

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno en Vercel
3. Desplegar automáticamente

### Backend (Supabase)

El backend ya está configurado en Supabase. Solo necesitas aplicar las migraciones SQL.

## Desarrollo

### Scripts Disponibles

```bash
npm run dev      # Ejecutar en modo desarrollo
npm run build    # Construir para producción
npm run start    # Ejecutar en modo producción
npm run lint     # Ejecutar linter
```

### Base de Datos

La base de datos se gestiona completamente a través de Supabase. Los cambios de esquema se aplican ejecutando SQL en el SQL Editor.

## Seguridad

- **RLS (Row Level Security)**: Todas las tablas tienen políticas RLS configuradas
- **Autenticación**: Supabase Auth maneja la autenticación
- **Autorización**: Los permisos se verifican tanto en el frontend como en el backend
- **Validación**: Los formularios tienen validación requerida

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Changelog

### [2024-12-19] - Deployment Stability & Type System Improvements

#### 🔧 **Critical Fixes Applied**
- **Security Vulnerabilities**: Updated Next.js from 15.1.0 to 15.5.4, fixing 9 critical security vulnerabilities
- **TypeScript Compilation**: Fixed 14 TypeScript errors related to missing nested properties in database queries
- **Build Process**: Resolved EPERM build errors and async/await issues in supabase-server.ts
- **ESLint Errors**: Cleaned up unused imports, variables, and fixed `any` type usage

#### 🏗️ **Type System Migration**
- **Supabase CLI Integration**: Migrated from custom types to proper Supabase-generated types (`src/types/supabase.ts`)
- **Relationship Types**: Created utility types that leverage actual database relationships:
  - `UserWithRole` - User with role information
  - `StudentWithGroup` - Student with group information  
  - `GroupWithUser` - Group with creator information
  - `CategoryWithUser` - Category with creator information
  - `IncidentWithDetails` - Incident with all related data
- **Type Safety**: All database queries now use proper TypeScript types that match the actual schema

#### 📁 **File Changes**
- **`src/types/database.ts`**: Now imports and re-exports Supabase-generated types
- **`src/types/supabase.ts`**: Auto-generated from database schema with relationship metadata
- **`src/lib/supabase-server.ts`**: Fixed async/await issues for proper server-side rendering
- **All page components**: Updated to use proper relationship types

#### ✅ **Deployment Status**
- **Build Success**: ✅ App compiles successfully without errors
- **Type Safety**: ✅ All TypeScript errors resolved
- **Security**: ✅ Critical vulnerabilities patched
- **Code Quality**: ✅ ESLint errors fixed (7 warnings remain - non-blocking)

#### ⚠️ **Remaining Items**
- 7 React Hook dependency warnings (non-blocking for deployment)
- Environment variables need to be configured for production deployment

#### 🚀 **Ready for Production**
The application is now stable and ready for deployment with proper type safety and security patches applied.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
