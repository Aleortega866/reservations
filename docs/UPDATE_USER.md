# Actualizar Usuario - UpdateUserAsync

## Descripción
Esta funcionalidad permite actualizar los datos de un usuario utilizando el endpoint `PUT /api/User/UpdateUserAsync`.

## Implementación

### 1. Servicio de Usuarios
Se actualizó la interfaz `UpdateUserRequest` para coincidir con la estructura real de la API:

```typescript
// lib/api/services/users/user.service.ts
export interface UpdateUserRequest {
  email?: string | null
  newEmail?: string | null
  userName?: string | null
  phoneNumber?: string | null
  name?: string | null
  paternalLastName?: string | null
  maternalLastName?: string | null
  statusId?: number
  genderId?: number
  enableMarketing?: boolean
  enableUsePersonalData?: boolean
  enable?: boolean
  userModifiedId?: number
  userTypeId?: number
  dateBirth?: string
}
```

### 2. Composable de Usuarios
El método `updateUser` ya está disponible en el composable:

```typescript
// lib/api/composables/users.ts
const updateUser = async (userData: UpdateUserRequest) => {
  try {
    await updateUserComposable.execute({ body: userData })
    return updateUserComposable.data.value
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

const { updateUser, loading } = useApiUsers()
const authStore = useAuthStore()

const handleUpdateUser = async () => {
  try {
    const userEmail = authStore.user?.email
    if (!userEmail) return
    
    const updateData = {
      email: userEmail,
      userName: 'nuevo_usuario',
      enableMarketing: true,
      enableUsePersonalData: true,
      statusId: 80,
      genderId: 19,
      enable: true,
      userModifiedId: 1,
      userTypeId: 76,
      dateBirth: ''
    }
    
    const result = await updateUser(updateData)
    console.log('Usuario actualizado:', result)
  } catch (err) {
    console.error('Error:', err)
  }
}
</script>
```

#### Uso en EditPersonalDataDialog
El modal de edición ahora usa el servicio real:

```vue
<script setup lang="ts">
import { useApiUsers } from '@/lib/api/composables/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { updateUser, loading } = useApiUsers()
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()

async function onSubmit(values: any) {
  try {
    const userEmail = authStore.user?.email
    
    if (!userEmail) {
      showError('Error', 'No se encontró el email del usuario autenticado')
      return
    }

    const updateData = {
      email: userEmail,
      userName: values.username,
      enableMarketing: values.receiveNewsletters,
      enableUsePersonalData: values.acceptDataUsage,
      statusId: 80,
      genderId: 19,
      enable: true,
      userModifiedId: 1,
      userTypeId: 76,
      dateBirth: ''
    }

    const result = await updateUser(updateData)
    
    if (result) {
      showSuccess('Éxito', 'Datos personales actualizados correctamente')
      emit('update-personal-data', values)
      open.value = false
      resetForm()
    }
  } catch (err: any) {
    showError('Error', err?.message || 'No se pudieron actualizar los datos')
  }
}
</script>
```

## Endpoint

### URL
```
PUT /api/User/UpdateUserAsync
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Body
```json
{
  "email": "usuario@ejemplo.com",
  "newEmail": null,
  "userName": "nuevo_usuario",
  "phoneNumber": null,
  "name": null,
  "paternalLastName": null,
  "maternalLastName": null,
  "statusId": 80,
  "genderId": 19,
  "enableMarketing": true,
  "enableUsePersonalData": true,
  "enable": true,
  "userModifiedId": 1,
  "userTypeId": 76,
  "dateBirth": ""
}
```

### Respuesta
```json
{
  "code": 200,
  "isValid": true,
  "comments": "The user has been successfully updated.",
  "response": {
    "id": "37349595-c125-4846-a5e8-989f50ebc5fa",
    "userId": 1,
    "userName": "nuevo_usuario",
    "email": "usuario@ejemplo.com",
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
    "enable": true,
    "userTypeId": 76,
    "userType": "Empleado",
    "dateBirth": "2025-05-22T15:48:10.97"
  },
  "token": ""
}
```

## Ejemplo de Uso Completo

### 1. Página de Ejemplo
Visita `/examples/update-user` para ver un ejemplo interactivo.

### 2. Componente de Ejemplo
```vue
<template>
  <div class="p-6 space-y-6">
    <h2>Actualizar Usuario</h2>
    
    <form @submit.prevent="handleUpdateUser" class="space-y-4">
      <div>
        <label>Nombre de Usuario</label>
        <input v-model="formData.userName" type="text" />
      </div>

      <div>
        <label>
          <input v-model="formData.enableMarketing" type="checkbox" />
          Habilitar marketing
        </label>
      </div>

      <div>
        <label>
          <input v-model="formData.enableUsePersonalData" type="checkbox" />
          Autorizar uso de datos personales
        </label>
      </div>

      <Button type="submit" :disabled="loading">
        {{ loading ? 'Actualizando...' : 'Actualizar Usuario' }}
      </Button>
    </form>

    <div v-if="updateResult" class="p-4 bg-green-50 border border-green-200 rounded">
      <h3>Usuario actualizado:</h3>
      <pre>{{ JSON.stringify(updateResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { useApiUsers } from '@/lib/api/composables/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { updateUser, loading } = useApiUsers()
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()

const formData = ref({
  userName: '',
  enableMarketing: false,
  enableUsePersonalData: false
})

const updateResult = ref<any>(null)

const handleUpdateUser = async () => {
  try {
    const userEmail = authStore.user?.email
    if (!userEmail) {
      showError('Error', 'No hay usuario autenticado')
      return
    }

    const updateData = {
      email: userEmail,
      userName: formData.value.userName || null,
      enableMarketing: formData.value.enableMarketing,
      enableUsePersonalData: formData.value.enableUsePersonalData,
      statusId: 80,
      genderId: 19,
      enable: true,
      userModifiedId: 1,
      userTypeId: 76,
      dateBirth: ''
    }

    const result = await updateUser(updateData)
    updateResult.value = result
    showSuccess('Usuario actualizado', 'Los datos se actualizaron correctamente')
  } catch (err: any) {
    showError('Error', 'No se pudo actualizar el usuario')
  }
}
</script>
```

## Flujo de Actualización

### 1. En PersonalDataScreen
- ✅ **Se cargan los datos** del usuario desde la API
- ✅ **Se muestran** en el formulario de edición
- ✅ **Se permite editar** nombre de usuario y preferencias

### 2. En EditPersonalDataDialog
- ✅ **Se valida** el formulario
- ✅ **Se preparan** los datos para la API
- ✅ **Se llama** al endpoint `UpdateUserAsync`
- ✅ **Se muestran** mensajes de éxito/error
- ✅ **Se cierra** el modal en caso de éxito

### 3. Después de la Actualización
- ✅ **Se recargan** los datos desde la API
- ✅ **Se actualiza** la UI con los nuevos datos
- ✅ **Se emite** evento al componente padre

## Consideraciones

### 1. Campos Requeridos
- `email`: Email del usuario (identificador)
- `statusId`: ID del estado (80 = Activo)
- `genderId`: ID del género (19 = Masculino)
- `enable`: Estado habilitado (true)
- `userModifiedId`: ID del usuario que modifica (1)
- `userTypeId`: ID del tipo de usuario (76 = Empleado)

### 2. Campos Opcionales
- `userName`: Nuevo nombre de usuario
- `enableMarketing`: Habilitar marketing
- `enableUsePersonalData`: Autorizar uso de datos
- `dateBirth`: Fecha de nacimiento

### 3. Manejo de Errores
- ✅ Validación de usuario autenticado
- ✅ Validación de email
- ✅ Manejo de errores de red
- ✅ Mensajes informativos al usuario

### 4. Estados de UI
- **Loading**: Botón deshabilitado con texto "Actualizando..."
- **Success**: Toast de éxito y cierre del modal
- **Error**: Toast de error con mensaje específico

## Archivos Modificados

1. `lib/api/services/users/user.service.ts` - Actualizada interfaz `UpdateUserRequest`
2. `components/profile/EditPersonalDataDialog.vue` - Implementado uso del servicio
3. `components/profile/PersonalDataScreen.vue` - Recarga datos después de actualización
4. `components/examples/UpdateUserExample.vue` - Componente de ejemplo
5. `pages/examples/update-user.vue` - Página de ejemplo

## Próximos Pasos

1. Probar la funcionalidad con usuarios reales
2. Agregar validaciones adicionales si es necesario
3. Implementar actualización de más campos según necesidades
4. Agregar confirmación antes de actualizar datos críticos 