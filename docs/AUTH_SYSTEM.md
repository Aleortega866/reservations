# Sistema de Autenticación Actualizado

## Descripción

El sistema de autenticación ha sido actualizado para manejar la nueva respuesta del login que incluye toda la información del usuario, permisos, rol y token JWT.

## Nueva Estructura de Respuesta

La API de login ahora devuelve:

```json
{
  "code": 200,
  "isValid": true,
  "comments": "Token generated successfully.",
  "response": {
    "id": "37349595-c125-4846-a5e8-989f50ebc5fa",
    "userId": 1,
    "userName": "Sysadmin",
    "email": "davdhernandez86@gmail.com",
    "phoneNumber": "999999",
    "name": "SysAdmin",
    "paternalLastName": "SysAdmin",
    "maternalLastName": "SysAdmin",
    "genderId": 19,
    "gender": "Masculino",
    "statusId": 80,
    "status": "Activo",
    "enableMarketing": true,
    "enableUsePersonalData": true,
    "enable": false,
    "userTypeId": 76,
    "userType": "Empleado",
    "dateBirth": "2025-05-22T15:48:10.97"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Características del Sistema

### 1. Almacenamiento Completo
- **Información del usuario**: Todos los datos personales y de configuración
- **Token JWT**: Token de autenticación completo
- **Permisos**: Lista de permisos extraídos del token JWT
- **Rol**: Rol del usuario extraído del token JWT

### 2. Persistencia
- **localStorage**: Almacenamiento local del navegador
- **Cookies**: Cookies para compatibilidad con SSR
- **Restauración automática**: Recupera la sesión al recargar la página

### 3. Verificación de Permisos
- Verificación de permisos individuales
- Verificación de múltiples permisos (alguno o todos)
- Verificación de roles de administrador

## Uso del Store de Autenticación

### Importar el Store

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
```

### Acceder a la Información del Usuario

```typescript
// Información básica
const user = authStore.user
const isAuthenticated = authStore.isAuthenticated
const token = authStore.token

// Información de permisos
const permissions = authStore.permissions
const userRole = authStore.userRole
const isAdmin = authStore.isAdmin
```

### Verificar Permisos

```typescript
// Verificar un permiso específico
const canViewReservations = authStore.hasPermission('Reservaciones_Consultar')

// Verificar si tiene alguno de varios permisos
const canModifyReservations = authStore.hasAnyPermission([
  'Reservaciones_Agregar',
  'Reservaciones_Actualizar'
])

// Verificar si tiene todos los permisos
const hasFullAccess = authStore.hasAllPermissions([
  'Reservaciones_Consultar',
  'Reservaciones_Agregar',
  'Reservaciones_Actualizar'
])
```

### Ejemplo de Uso en Componentes

```vue
<template>
  <div>
    <!-- Mostrar información del usuario -->
    <div v-if="isAuthenticated">
      <h2>Bienvenido, {{ user.name }}</h2>
      <p>Email: {{ user.email }}</p>
      <p>Rol: {{ userRole }}</p>
      
      <!-- Mostrar permisos -->
      <div v-if="permissions.length > 0">
        <h3>Permisos:</h3>
        <ul>
          <li v-for="permission in permissions" :key="permission">
            {{ permission }}
          </li>
        </ul>
      </div>
      
      <!-- Contenido condicional basado en permisos -->
      <div v-if="hasPermission('Reservaciones_Consultar')">
        <h3>Lista de Reservaciones</h3>
        <!-- Contenido de reservaciones -->
      </div>
      
      <!-- Botones de administrador -->
      <div v-if="isAdmin">
        <button>Panel de Administración</button>
      </div>
    </div>
    
    <!-- Mostrar login si no está autenticado -->
    <div v-else>
      <p>Por favor inicia sesión</p>
      <button @click="$router.push('/auth/login')">Login</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Computed properties para reactividad
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const permissions = computed(() => authStore.permissions)
const userRole = computed(() => authStore.userRole)
const isAdmin = computed(() => authStore.isAdmin)

// Métodos para verificar permisos
const hasPermission = (permission: string) => authStore.hasPermission(permission)
</script>
```

## Uso del Composable de Autenticación

### Importar el Composable

```typescript
import { useApiAuth } from '@/lib/api/composables/auth'

const { signIn, signOut, loading, error, user, isAuthenticated } = useApiAuth()
```

### Iniciar Sesión

```typescript
const handleLogin = async (credentials: { email: string, password: string }) => {
  try {
    const response = await signIn(credentials)
    
    if (response) {
      // El usuario ya está autenticado automáticamente
      // Redirigir a la página principal
      await router.push('/dashboard')
    }
  } catch (error) {
    console.error('Error en login:', error)
  }
}
```

### Cerrar Sesión

```typescript
const handleLogout = () => {
  signOut()
  // Redirigir al login
  router.push('/auth/login')
}
```

## Estructura de Datos

### Tipo User

```typescript
interface User {
  id: string
  userId: number
  userName: string
  email: string
  phoneNumber: string
  name: string
  paternalLastName: string
  maternalLastName: string
  genderId: number
  gender: string
  statusId: number
  status: string
  enableMarketing: boolean
  enableUsePersonalData: boolean
  enable: boolean
  userTypeId: number
  userType: string
  dateBirth: string
}
```

### Tipo SignInResponse

```typescript
interface SignInResponse {
  code: number
  isValid: boolean
  comments: string
  response: User
  token: string
}
```

## Almacenamiento Local

El sistema guarda la información en:

- `localStorage.auth_token`: Token JWT
- `localStorage.auth_user`: Datos del usuario
- `localStorage.auth_permissions`: Lista de permisos
- `localStorage.auth_role`: Rol del usuario

## Seguridad

- El token JWT se almacena de forma segura
- Los permisos se extraen del token para evitar manipulación
- La información se limpia automáticamente al cerrar sesión
- Compatible con SSR mediante cookies

## Ejemplo Completo

Ver el archivo `examples/AuthInfoExample.vue` para un ejemplo completo de cómo usar todas las características del sistema de autenticación.

## Migración

Si tienes código existente que usa el sistema anterior:

1. **Cambiar imports**: Usar `useAuthStore` en lugar de otros stores
2. **Actualizar tipos**: Usar los nuevos tipos `User` y `SignInResponse`
3. **Verificar permisos**: Usar los nuevos métodos `hasPermission`, `hasAnyPermission`, `hasAllPermissions`
4. **Acceder a datos**: Usar `user.name` en lugar de `user.firstName` + `user.lastName`

## Troubleshooting

### Problemas Comunes

1. **Token no válido**: Verificar que el token no haya expirado
2. **Permisos no cargados**: Verificar que el token contenga los claims de permisos
3. **Sesión no persiste**: Verificar que localStorage esté habilitado

### Debug

```typescript
// Verificar estado actual
console.log('Usuario:', authStore.user)
console.log('Autenticado:', authStore.isAuthenticated)
console.log('Permisos:', authStore.permissions)
console.log('Rol:', authStore.userRole)

// Verificar localStorage
console.log('Token en localStorage:', localStorage.getItem('auth_token'))
console.log('Usuario en localStorage:', localStorage.getItem('auth_user'))
``` 