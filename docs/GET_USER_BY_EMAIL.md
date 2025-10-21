# Obtener Usuario por Email - GetUserByEmail

## Descripción
Esta funcionalidad permite obtener los datos completos de un usuario utilizando su dirección de email, llamando al endpoint `/api/User/GetUserAsync`.

## Implementación

### 1. Servicio de Usuarios
Se agregó el método `getUserByEmail` al `UserService`:

```typescript
// lib/api/services/users/user.service.ts
async getUserByEmail(email: string) {
  return apiClient.get<User>(`${API_ENDPOINTS.user.getById}?email=${email}`)
}
```

### 2. Composable de Usuarios
Se agregó el método al composable `useApiUsers`:

```typescript
// lib/api/composables/users.ts
const getUserByEmail = async (email: string) => {
  try {
    await getUserByEmailComposable.execute({ query: { email } })
    return getUserByEmailComposable.data.value
  } catch (err) {
    throw err
  }
}
```

### 3. Uso en Componentes

#### Uso Básico
```vue
<script setup lang="ts">
import { useApiUsers } from '@/lib/api/composables/users'
import { useAuthStore } from '@/stores/auth'

const { getUserByEmail, loading, error } = useApiUsers()
const authStore = useAuthStore()

const loadUserData = async () => {
  try {
    const userEmail = authStore.user?.email
    if (!userEmail) return
    
    const userData = await getUserByEmail(userEmail)
    console.log('Datos del usuario:', userData)
  } catch (err) {
    console.error('Error:', err)
  }
}
</script>
```

#### Uso en PersonalDataScreen
El componente `PersonalDataScreen` ahora carga automáticamente los datos del usuario:

```vue
<template>
  <div class="p-4 space-y-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-2 text-sm text-muted-foreground">Cargando datos personales...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
      <p class="text-sm text-destructive">Error al cargar los datos</p>
      <Button @click="loadUserData" variant="outline" size="sm" class="mt-2">
        Reintentar
      </Button>
    </div>

    <!-- Content -->
    <div v-else-if="personalData" class="space-y-4">
      <!-- Mostrar datos del usuario -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApiUsers } from '@/lib/api/composables/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { getUserByEmail, loading, error } = useApiUsers()
const authStore = useAuthStore()
const { showError } = useToast()

const localPersonalData = ref<PersonalData | null>(null)

const loadUserData = async () => {
  try {
    const userEmail = authStore.user?.email
    
    if (!userEmail) {
      showError('Error', 'No se encontró el email del usuario autenticado')
      return
    }

    const userData = await getUserByEmail(userEmail)
    
    if (userData) {
      localPersonalData.value = {
        username: userData.username || userData.userName || '',
        firstName: userData.firstName || userData.name || '',
        lastName: userData.lastName || userData.paternalLastName || '',
        gender: userData.gender || 'No especificado',
        receiveNewsletters: userData.enableMarketing || false,
        acceptDataUsage: userData.enableUsePersonalData || false
      }
    }
  } catch (err) {
    console.error('Error al cargar datos del usuario:', err)
    showError('Error', 'No se pudieron cargar los datos del usuario')
  }
}

onMounted(() => {
  loadUserData()
})
</script>
```

## Endpoint

### URL
```
GET /api/User/GetUserAsync?email={email}
```

### Parámetros
- `email` (string, requerido): Email del usuario a buscar

### Respuesta
```json
{
  "id": "string",
  "userId": 1,
  "userName": "string",
  "email": "string",
  "phoneNumber": "string",
  "name": "string",
  "paternalLastName": "string",
  "maternalLastName": "string",
  "genderId": 1,
  "gender": "string",
  "statusId": 1,
  "status": "string",
  "enableMarketing": true,
  "enableUsePersonalData": true,
  "enable": true,
  "userTypeId": 1,
  "userType": "string",
  "dateBirth": "string"
}
```

## Ejemplo de Uso Completo

### 1. Página de Ejemplo
Visita `/examples/get-user-by-email` para ver un ejemplo interactivo.

### 2. Componente de Ejemplo
```vue
<template>
  <div class="p-6 space-y-6">
    <h2>Obtener Usuario por Email</h2>
    
    <div class="p-4 bg-muted rounded-lg">
      <p><strong>Email del usuario:</strong> {{ authStore.user?.email || 'No autenticado' }}</p>
    </div>

    <Button 
      @click="testGetUserByEmail" 
      :disabled="!authStore.isAuthenticated || loading"
    >
      {{ loading ? 'Cargando...' : 'Obtener Usuario' }}
    </Button>

    <div v-if="userData" class="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3>Usuario encontrado:</h3>
      <pre>{{ JSON.stringify(userData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { useApiUsers } from '@/lib/api/composables/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { getUserByEmail, loading } = useApiUsers()
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()

const userData = ref<any>(null)

const testGetUserByEmail = async () => {
  try {
    const userEmail = authStore.user?.email
    if (!userEmail) {
      showError('Error', 'No hay usuario autenticado')
      return
    }

    const data = await getUserByEmail(userEmail)
    userData.value = data
    showSuccess('Usuario obtenido', `Datos cargados para: ${data.email}`)
  } catch (err) {
    showError('Error', 'No se pudo obtener el usuario')
  }
}
</script>
```

## Consideraciones

### 1. Autenticación
- El usuario debe estar autenticado para usar esta funcionalidad
- El email se obtiene del store de autenticación (`authStore.user?.email`)

### 2. Manejo de Errores
- Se incluye manejo de errores con estados de loading y error
- Se muestran mensajes informativos al usuario

### 3. Mapeo de Datos
- Los datos de la API se mapean a la estructura `PersonalData`
- Se manejan diferentes nombres de campos (ej: `userName` vs `username`)

### 4. Estados de UI
- Loading: Muestra un spinner mientras carga
- Error: Muestra mensaje de error con opción de reintentar
- Success: Muestra los datos del usuario

## Archivos Modificados

1. `lib/api/services/users/user.service.ts` - Agregado método `getUserByEmail`
2. `lib/api/composables/users.ts` - Agregado método al composable
3. `components/profile/PersonalDataScreen.vue` - Implementado uso real
4. `pages/profile/index.vue` - Removido datos de ejemplo
5. `components/examples/GetUserByEmailExample.vue` - Componente de ejemplo
6. `pages/examples/get-user-by-email.vue` - Página de ejemplo

## Próximos Pasos

1. Probar la funcionalidad con usuarios reales
2. Agregar validaciones adicionales si es necesario
3. Implementar cache de datos si se requiere
4. Agregar más campos según las necesidades del negocio 