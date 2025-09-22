# Guía de Configuración Rápida

## 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. En el SQL Editor, ejecuta los scripts de `supabase/README.md` en orden
3. Anota tu URL del proyecto y las claves

## 2. Configurar Variables de Entorno

1. Copia `env.local.example` a `.env.local`
2. Llena las variables con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

## 3. Ejecutar el Proyecto

```bash
npm install
npm run dev
```

## 4. Probar la Aplicación

1. Ve a `http://localhost:3000`
2. Haz clic en "Iniciar Sesión"
3. Regístrate con un email y contraseña
4. Completa el formulario con tu nombre y cargo
5. Serás redirigido a la página de incidentes

## 5. Datos de Prueba (Opcional)

Para agregar datos de prueba, ejecuta el script `scripts/seed.sql` en el SQL Editor de Supabase después de crear tu primer usuario.

## 6. Roles de Usuario

- **Profesor** (por defecto): Puede crear incidentes y gestionar estudiantes
- **Coordinador**: Puede gestionar grupos y categorías, ver dashboard
- **Administrador**: Puede gestionar usuarios y asignar roles

Para cambiar roles, un administrador debe ir a la página de Usuarios.

## 7. Funcionalidades Principales

- **Incidentes**: Crear, filtrar y exportar incidentes
- **Estudiantes**: Gestionar estudiantes y asignarlos a grupos
- **Grupos**: Crear y gestionar grupos (coordinadores+)
- **Categorías**: Crear categorías de incidentes (coordinadores+)
- **Dashboard**: Ver estadísticas (coordinadores+)
- **Usuarios**: Gestionar roles de usuario (administradores)

## Solución de Problemas

### Error de conexión a Supabase
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error de permisos
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el usuario tenga el rol correcto

### Error de autenticación
- Verifica que la función `handle_new_user()` esté creada
- Asegúrate de que el trigger esté configurado
