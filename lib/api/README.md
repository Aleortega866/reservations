# API Management System - Axios Centralizado

Sistema completo de gestión de API para Nuxt 3 con TypeScript, usando **axios** para peticiones HTTP con interceptors automáticos, manejo de errores mejorado y composables reactivos.

## 🚀 **Características Principales**

- ✅ **Axios con interceptors automáticos** - Token de autenticación automático
- ✅ **Composables reactivos** - Estados loading, error y data automáticos
- ✅ **Tipos TypeScript completos** - Interfaces para todos los requests/responses
- ✅ **Endpoints centralizados** - Configuración única en `API_ENDPOINTS`
- ✅ **Manejo de errores mejorado** - Errores específicos con mensajes claros
- ✅ **Función refresh** - Recargar datos fácilmente
- ✅ **Autenticación automática** - Token Bearer automático en todas las peticiones

## 📁 **Estructura del Proyecto**

```
lib/api/
├── core/
│   ├── config.ts          # Configuración y endpoints centralizados
│   └── useFetch.ts        # Composable base con axios
├── composables/
│   ├── auth.ts            # Autenticación
│   ├── users.ts           # Gestión de usuarios
│   ├── reservations.ts    # Gestión de reservaciones
│   └── index.ts           # Exportaciones
├── types.ts               # Tipos TypeScript centralizados
├── index.ts               # Exportaciones principales
└── README.md              # Esta documentación
```

## 🔧 **Configuración**

### 1. **Instalar dependencias**
```bash
pnpm add axios
```

### 2. **Configurar endpoints**
```typescript
// lib/api/core/config.ts
export const API_CONFIG = {
  baseURL: 'https://tu-api.com',
  timeout: 30000
}

export const API_ENDPOINTS = {
  auth: {
    signIn: '/api/auth/login',
    // ... más endpoints
  }
}
```

## 📖 **Uso Básico**

### **Importar composables**
```typescript
import { useApiAuth, useApiUsers, useApiReservations } from '@/lib/api'
import type { SignInRequest, User, Reservation } from '@/lib/api'
```

### **Autenticación**
```vue
<script setup lang="ts">
import { useApiAuth } from '@/lib/api'
import type { SignInRequest } from '@/lib/api'

const { signIn, loading, error, isAuthenticated } = useApiAuth()

const handleLogin = async () => {
  try {
    const credentials: SignInRequest = {
      email: 'user@example.com',
      password: 'password123'
    }
    
    // SignIn usa GET con credenciales como query parameters
    await signIn(credentials)
    // Usuario autenticado automáticamente
  } catch (err) {
    console.error('Error de login:', err)
  }
}
</script>

<template>
  <div>
    <button @click="handleLogin" :disabled="loading">
      {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
    </button>
    
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
    
    <div v-if="isAuthenticated">
      ¡Bienvenido!
    </div>
  </div>
</template>
```

**Nota importante**: El endpoint `Auth/SignInAsync` usa método **GET** con las credenciales enviadas como query parameters (`?email=...&password=...`), no como body en POST.

### **Gestión de Usuarios**
```vue
<script setup lang="ts">
import { useApiUsers } from '@/lib/api'
import type { CreateUserRequest } from '@/lib/api'

const { getAllUsers, createUser, users, loading, error } = useApiUsers()

// Cargar usuarios al montar el componente
onMounted(async () => {
  await getAllUsers()
})

const handleCreateUser = async () => {
  const newUser: CreateUserRequest = {
    email: 'nuevo@example.com',
    username: 'nuevo_usuario',
    firstName: 'Juan',
    lastName: 'Pérez',
    password: 'password123'
  }
  
  await createUser(newUser)
  // Recargar la lista automáticamente
  await getAllUsers()
}
</script>

<template>
  <div>
    <div v-if="loading">Cargando usuarios...</div>
    
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
    
    <ul v-if="users">
      <li v-for="user in users" :key="user.id">
        {{ user.firstName }} {{ user.lastName }}
      </li>
    </ul>
  </div>
</template>
```

### **Gestión de Reservaciones**
```vue
<script setup lang="ts">
import { useApiReservations } from '@/lib/api'
import type { CreateReservationRequest } from '@/lib/api'

const { getAllReservations, createReservation, getSchools, reservations, schools } = useApiReservations()

// Cargar datos al montar
onMounted(async () => {
  await Promise.all([
    getAllReservations(),
    getSchools()
  ])
})

const handleCreateReservation = async () => {
  const newReservation: CreateReservationRequest = {
    userId: 'user-id',
    schoolId: 'school-id',
    visitDate: '2024-01-15',
    timeSlot: '09:00',
    type: 'workshop',
    description: 'Taller de programación',
    participants: 25
  }
  
  await createReservation(newReservation)
  await getAllReservations() // Recargar
}
</script>
```

## 🔄 **Funciones Avanzadas**

### **Función Refresh**
```typescript
const { getAllUsers, refresh } = useApiUsers()

// Recargar datos manualmente
const handleRefresh = async () => {
  await refresh()
}
```

### **Filtros en Consultas**
```typescript
const { getAllReservations } = useApiReservations()

// Con filtros
await getAllReservations({
  userId: 'user-123',
  status: 'confirmed',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
})
```

### **Manejo de Errores Específicos**
```typescript
const { signIn } = useApiAuth()

try {
  await signIn(credentials)
} catch (error) {
  if (error.message.includes('401')) {
    // Token expirado
    console.log('Sesión expirada')
  } else if (error.message.includes('400')) {
    // Credenciales inválidas
    console.log('Credenciales incorrectas')
  }
}
```

### **Estructura de Errores de la API**
La API devuelve errores con la siguiente estructura:
```json
{
  "code": 400,
  "isValid": false,
  "comments": "The user doesn't exist.",
  "response": "",
  "token": ""
}
```

El sistema automáticamente extrae el mensaje del campo `comments` para mostrar errores más descriptivos al usuario.

## 🛡️ **Características de Seguridad**

### **Interceptors Automáticos**
- ✅ Token Bearer automático en todas las peticiones
- ✅ Manejo automático de tokens expirados (401)
- ✅ Limpieza automática de localStorage en logout

### **Manejo de Errores**
- ✅ Errores específicos con mensajes claros
- ✅ Interceptor de respuesta para errores globales
- ✅ Estados de error reactivos en composables

## 📊 **Estados Reactivos**

Cada composable proporciona estados reactivos automáticos:

```typescript
const { 
  data,        // Datos de la respuesta
  pending,     // Estado de carga
  error,       // Error si ocurre
  execute,     // Función para ejecutar
  refresh      // Función para recargar
} = useApiFetch('/api/endpoint')
```

## 🎯 **Ventajas de Axios**

1. **Interceptors automáticos** - Token y headers automáticos
2. **Mejor manejo de errores** - Errores más específicos
3. **Soporte TypeScript completo** - Tipos nativos
4. **Configuración centralizada** - Una sola instancia
5. **Cancelación de peticiones** - Control de peticiones activas
6. **Transformación de datos** - Request/response transformers

## 🔧 **Configuración Avanzada**

### **Personalizar Timeout**
```typescript
const { data } = useApiFetch('/api/slow-endpoint', {
  timeout: 60000 // 60 segundos
})
```

### **Headers Personalizados**
```typescript
const { data } = useApiFetch('/api/endpoint', {
  headers: {
    'Custom-Header': 'value'
  }
})
```

### **Query Parameters**
```typescript
const { data } = useApiFetch('/api/users', {
  query: {
    page: 1,
    limit: 10,
    search: 'juan'
  }
})
```

## 🚀 **Migración desde useFetch**

Si vienes de `useFetch`, la migración es simple:

```typescript
// Antes (useFetch)
const { data, pending, error } = await useFetch('/api/users')

// Ahora (axios)
const { data, pending, error, execute } = useApiFetch('/api/users')
await execute()
```

## 📝 **Notas Importantes**

- ✅ **SSR compatible** - Funciona en servidor y cliente
- ✅ **Tipos automáticos** - IntelliSense completo
- ✅ **Estados reactivos** - Vue reactivity automática
- ✅ **Error handling** - Manejo de errores mejorado
- ✅ **Auth automático** - Token Bearer automático

---

**¡Tu API está lista para usar con axios! 🎉** 