# Corrección de Métodos Faltantes en el Servicio de Roles

## Problema

El error `RoleService.getAllRoleUsers is not a function` ocurría porque algunos métodos del servicio de roles no estaban siendo expuestos correctamente en el composable `useRoles`.

### Métodos Faltantes
- `getAllRoleUsers`
- `addUserToRole`
- `deleteRoleUser`

## Solución Implementada

### 1. Actualización del Composable `useRoles`

Se agregaron los métodos faltantes al composable `composables/useRoles.ts`:

```typescript
// ============================================================================
// OPERACIONES DE USUARIOS EN ROLES
// ============================================================================

const getAllRoleUsers = async (roleId: string): Promise<RoleUser[]> => {
  loading.value = true
  error.value = null
  try {
    const users = await roleService.getAllRoleUsers(roleId)
    return users
  } catch (err) {
    error.value = err as Error
    throw err
  } finally {
    loading.value = false
  }
}

const addUserToRole = async (request: AddUserToRoleRequest): Promise<void> => {
  loading.value = true
  error.value = null
  try {
    await roleService.addUserToRole(request)
  } catch (err) {
    error.value = err as Error
    throw err
  } finally {
    loading.value = false
  }
}

const deleteRoleUser = async (request: DeleteRoleUserRequest): Promise<void> => {
  loading.value = true
  error.value = null
  try {
    await roleService.deleteRoleUser(request)
  } catch (err) {
    error.value = err as Error
    throw err
  } finally {
    loading.value = false
  }
}
```

### 2. Actualización de Importaciones

Se agregaron las importaciones necesarias:

```typescript
import type { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  DeleteRoleRequest,
  AddUserToRoleRequest,
  DeleteRoleUserRequest,
  RoleUser
} from '~/lib/api/services/role'
```

### 3. Exposición de Métodos

Se actualizó el objeto de retorno para incluir los nuevos métodos:

```typescript
return {
  // Estados reactivos
  roles: readonly(roles),
  loading: readonly(loading),
  error: readonly(error),

  // Métodos de roles
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,

  // Métodos de usuarios en roles
  getAllRoleUsers,
  addUserToRole,
  deleteRoleUser
}
```

### 4. Corrección del Componente `AddUserToRoleDialog`

Se actualizó el componente para usar el composable en lugar del servicio directamente:

**Antes:**
```typescript
import { RoleService } from '~/lib/api/services/role'
// ...
roleUsers.value = await RoleService.getAllRoleUsers(props.role.id)
```

**Después:**
```typescript
import { useRoles } from '~/composables/useRoles'
// ...
const { getAllRoleUsers, addUserToRole, deleteRoleUser } = useRoles()
// ...
roleUsers.value = await getAllRoleUsers(props.role.id)
```

## Beneficios de la Solución

1. **Consistencia**: Todos los métodos del servicio de roles ahora están disponibles a través del composable
2. **Manejo de Estado**: Los métodos incluyen manejo de estados de carga y error
3. **Reutilización**: Los métodos pueden ser usados en cualquier componente que use el composable
4. **Mantenibilidad**: Centraliza la lógica de manejo de roles en un solo lugar

## Métodos Disponibles

### Operaciones de Roles
- `getAllRoles()` - Obtener todos los roles
- `createRole(request)` - Crear un nuevo rol
- `updateRole(request)` - Actualizar un rol existente
- `deleteRole(request)` - Eliminar un rol

### Operaciones de Usuarios en Roles
- `getAllRoleUsers(roleId)` - Obtener todos los usuarios de un rol
- `addUserToRole(request)` - Agregar un usuario a un rol
- `deleteRoleUser(request)` - Eliminar un usuario de un rol

## Archivos Modificados

- `composables/useRoles.ts`
- `components/admin/roles/AddUserToRoleDialog.vue`

## Notas Importantes

- Todos los métodos incluyen manejo de estados de carga (`loading`) y error (`error`)
- Los métodos mantienen la consistencia con el patrón de diseño existente
- Se mantiene la compatibilidad con el código existente
- Los tipos TypeScript están correctamente definidos para todos los métodos
