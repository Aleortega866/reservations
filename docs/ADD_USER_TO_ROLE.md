# Agregar Usuario a Rol - AddRollUserAsync

## Descripción
Esta funcionalidad permite agregar usuarios a roles específicos mediante su correo electrónico utilizando el endpoint `POST /api/Role/AddRollUserAsync`.

## Implementación

### 1. Servicio de Roles
Se agregó la interfaz `AddUserToRoleRequest` y el método `addUserToRole` al servicio de roles:

```typescript
// lib/api/services/role/role.service.ts
export interface AddUserToRoleRequest {
  email: string
  roleName: string
  userModifiedId: number
}

export class RoleService {
  /**
   * Agregar un usuario a un rol
   */
  static async addUserToRole(request: AddUserToRoleRequest): Promise<void> {
    const { execute } = useApiPost(API_ENDPOINTS.role.addUser)
    await execute({ body: request })
  }
}
```

### 2. Componente Modal
Se creó el componente `AddUserToRoleDialog.vue` que proporciona una interfaz de usuario para agregar usuarios a roles:

```vue
<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Agregar Usuario al Rol</DialogTitle>
        <DialogDescription>
          Ingresa el correo electrónico del usuario que deseas agregar al rol "{{ role?.name }}"
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Correo Electrónico</Label>
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="usuario@ejemplo.com"
            :class="{ 'border-destructive': errors.email }"
            :disabled="loading"
          />
          <p v-if="errors.email" class="text-sm text-destructive">
            {{ errors.email }}
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox
            id="confirm"
            v-model:checked="formData.confirm"
            :disabled="loading"
          />
          <Label for="confirm" class="text-sm">
            Confirmo que el usuario existe y deseo agregarlo al rol
          </Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)" :disabled="loading">
            Cancelar
          </Button>
          <Button type="submit" :disabled="loading || !formData.confirm">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Agregando...' : 'Agregar Usuario' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
```

### 3. Integración en RolesList
Se actualizó el componente `RolesList.vue` para incluir el botón de agregar usuario:

```vue
<!-- Botones de acción -->
<div class="flex items-center space-x-2">
  <Button variant="ghost" size="sm" @click.stop="handleAddUser(role)" class="h-8 w-8 p-0" title="Agregar usuario">
    <UserPlus class="w-4 h-4" />
  </Button>
  <Button variant="ghost" size="sm" @click.stop="handleEdit(role)" class="h-8 w-8 p-0" title="Editar rol">
    <Edit class="w-4 h-4" />
  </Button>
  <Button variant="ghost" size="sm" @click.stop="handleDelete(role)"
    class="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Eliminar rol">
    <Trash2 class="w-4 h-4" />
  </Button>
</div>
```

## Uso

### Uso Básico
```vue
<template>
  <RolesList
    v-model="selectedRoles"
    label="Gestión de Roles"
    :roles="roles"
    :auto-open="true"
    @new-role="handleNewRole"
    @update-role="handleUpdateRole"
    @delete-role="handleDeleteRole"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RolesList from '~/components/admin/roles/RolesList.vue'
import type { Role } from '~/lib/api/services/role'

const selectedRoles = ref<number[]>([])
const roles = ref<Role[]>([
  {
    id: '1',
    name: 'Administrador',
    description: 'Rol con permisos completos',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userModifiedId: 1,
    enable: true,
    status: 'Activo'
  }
])

const handleNewRole = (newRole: Role) => {
  console.log('Nuevo rol creado:', newRole)
}

const handleUpdateRole = (updatedRole: Role) => {
  console.log('Rol actualizado:', updatedRole)
}

const handleDeleteRole = (deletedRole: Role) => {
  console.log('Rol eliminado:', deletedRole)
}
</script>
```

### Uso Directo del Servicio
```typescript
import { RoleService } from '~/lib/api/services/role'

const addUserToRole = async (email: string, roleName: string) => {
  try {
    await RoleService.addUserToRole({
      email,
      roleName,
      userModifiedId: 1 // ID del usuario que realiza la acción
    })
    console.log('Usuario agregado exitosamente')
  } catch (error) {
    console.error('Error al agregar usuario:', error)
  }
}
```

## API Endpoint

### POST /api/Role/AddRollUserAsync

**Request Body:**
```json
{
  "email": "string",
  "roleName": "string", 
  "userModifiedId": "integer"
}
```

**Parámetros:**
- `email`: Correo electrónico del usuario a agregar al rol
- `roleName`: Nombre del rol al que se agregará el usuario
- `userModifiedId`: ID del usuario que realiza la acción

**Respuesta:**
- `200 OK`: Usuario agregado exitosamente
- `400 Bad Request`: Datos inválidos
- `404 Not Found`: Usuario o rol no encontrado
- `500 Internal Server Error`: Error interno del servidor

## Validaciones

### Frontend
- El correo electrónico debe tener un formato válido
- El usuario debe confirmar que el usuario existe
- El campo de correo electrónico es obligatorio

### Backend
- El usuario debe existir en el sistema
- El rol debe existir y estar activo
- El usuario no debe estar ya asignado al rol

## Notificaciones

El componente utiliza el sistema de toast para mostrar notificaciones:

- **Éxito**: "Usuario agregado" - Cuando el usuario se agrega exitosamente
- **Error**: "Error al agregar usuario" - Cuando ocurre un error

## Ejemplo Completo

Puedes ver un ejemplo completo en:
- `/examples/add-user-to-role.vue` - Componente de ejemplo
- `/pages/examples/add-user-to-role.vue` - Página de ejemplo

## Consideraciones

1. **Seguridad**: Asegúrate de que solo usuarios autorizados puedan agregar usuarios a roles
2. **Validación**: El backend debe validar que el usuario existe antes de agregarlo al rol
3. **Auditoría**: Se registra el `userModifiedId` para auditoría de cambios
4. **Permisos**: Considera implementar permisos específicos para esta funcionalidad 