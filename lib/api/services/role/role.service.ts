// ============================================================================
// ROLE SERVICE - Servicio de Gestión de Roles
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete, API_ENDPOINTS } from '../../core/useFetch'
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  DeleteRoleRequest,
  AddUserToRoleRequest,
  RoleUser,
  DeleteRoleUserRequest
} from '../../types/role'

/**
 * Servicio de gestión de roles que maneja CRUD y asignación de usuarios
 * @class RoleService
 */
export class RoleService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todos los roles del sistema
   * @returns {Promise<Role[]>} Lista de todos los roles
   * @throws {Error} Error si no se pueden cargar los roles
   */
  async getAllRoles(): Promise<Role[]> {
    const { execute } = useApiFetch<{ response: Role[] }>(
      API_ENDPOINTS.role.getAll,
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  /**
   * Obtiene todos los usuarios asignados a un rol específico
   * @param {string} roleId - ID del rol
   * @returns {Promise<RoleUser[]>} Lista de usuarios del rol
   * @throws {Error} Error si el rol no existe
   */
  async getAllRoleUsers(roleId: string): Promise<RoleUser[]> {
    const { execute } = useApiFetch<{ response: RoleUser[] }>(
      `${API_ENDPOINTS.role.getAllUsers}?roleId=${roleId}`,
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - POST (CREACIÓN)
  // ========================================================================

  /**
   * Crea un nuevo rol en el sistema
   * @param {CreateRoleRequest} request - Datos del nuevo rol
   * @returns {Promise<Role>} Información del rol creado
   * @throws {Error} Error si los datos son inválidos o el rol ya existe
   */
  async createRole(request: CreateRoleRequest): Promise<Role> {
    const { execute } = useApiPost<{ response: Role }>(
      API_ENDPOINTS.role.create,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  /**
   * Agrega un usuario a un rol específico
   * @param {AddUserToRoleRequest} request - Datos para asignar usuario al rol
   * @returns {Promise<void>} Confirmación de asignación
   * @throws {Error} Error si el usuario o rol no existen
   */
  async addUserToRole(request: AddUserToRoleRequest): Promise<void> {
    const { execute } = useApiPost(
      API_ENDPOINTS.role.addUser,
      { immediate: false }
    )
    await execute({ body: request })
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN)
  // ========================================================================

  /**
   * Actualiza un rol existente
   * @param {UpdateRoleRequest} request - Nuevos datos del rol
   * @returns {Promise<Role | number>} Información del rol actualizado o ID del rol
   * @throws {Error} Error si el rol no existe o datos inválidos
   */
  async updateRole(request: UpdateRoleRequest): Promise<Role | number> {
    const { execute } = useApiPut<{ response: Role | number }>(
      API_ENDPOINTS.role.update,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina un rol del sistema
   * @param {DeleteRoleRequest} request - Datos del rol a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si el rol no existe o no se puede eliminar
   */
  async deleteRole(request: DeleteRoleRequest): Promise<void> {
    const { execute } = useApiDelete(
      API_ENDPOINTS.role.delete,
      { immediate: false }
    )
    await execute({ body: request })
  }

  /**
   * Elimina un usuario de un rol específico
   * @param {DeleteRoleUserRequest} request - Datos para desasignar usuario del rol
   * @returns {Promise<void>} Confirmación de desasignación
   * @throws {Error} Error si el usuario no está asignado al rol
   */
  async deleteRoleUser(request: DeleteRoleUserRequest): Promise<void> {
    const { execute } = useApiDelete(
      API_ENDPOINTS.role.deleteUser,
      { immediate: false }
    )
    await execute({ body: request })
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de roles
 * @type {RoleService}
 */
export const roleService = new RoleService() 