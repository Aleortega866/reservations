import { ref, readonly } from 'vue'
import { roleService } from '~/lib/api/services/role'
import type { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  DeleteRoleRequest,
  AddUserToRoleRequest,
  DeleteRoleUserRequest,
  RoleUser
} from '~/lib/api/services/role'

// Instancia singleton para evitar múltiples instancias
let rolesServiceInstance: ReturnType<typeof createRolesService> | null = null

/**
 * Función interna para crear el servicio de roles
 */
function createRolesService() {
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // ============================================================================
  // OPERACIONES DE ROLES
  // ============================================================================

  const getAllRoles = async () => {
    loading.value = true
    error.value = null
    try {
      roles.value = await roleService.getAllRoles()
      return roles.value
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRole = async (request: CreateRoleRequest) => {
    loading.value = true
    error.value = null
    try {
      const newRole = await roleService.createRole(request)
      // Agregar el nuevo rol a la lista local
      roles.value.push(newRole)
      return newRole
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (request: UpdateRoleRequest): Promise<Role | null> => {
    loading.value = true
    error.value = null
    try {
      const result = await roleService.updateRole(request)
      
      // El servidor puede devolver un número (ID) en lugar del objeto completo
      // Si es un número, actualizamos el rol local con los datos del request
      if (typeof result === 'number' || typeof result === 'string') {
        const index = roles.value.findIndex(role => role.id === request.id)
        if (index !== -1) {
          // Actualizar solo las propiedades que se enviaron en el request
          roles.value[index] = {
            ...roles.value[index],
            ...request,
            id: request.id // Asegurar que el ID se mantenga
          }
        }
        return roles.value[index] || null
      } else {
        // Si el servidor devuelve el objeto completo, actualizamos normalmente
        const index = roles.value.findIndex(role => role.id === request.id)
        if (index !== -1) {
          roles.value[index] = result
        }
        return result
      }
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRole = async (request: DeleteRoleRequest) => {
    loading.value = true
    error.value = null
    try {
      await roleService.deleteRole(request)
      // Remover el rol de la lista local
      roles.value = roles.value.filter(role => role.id !== request.id)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

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
}

/**
 * Composable para manejar roles
 * Retorna una instancia singleton del servicio de roles
 */
export function useRoles() {
  if (!rolesServiceInstance) {
    rolesServiceInstance = createRolesService()
  }
  return rolesServiceInstance
} 