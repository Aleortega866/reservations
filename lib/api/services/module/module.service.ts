// ============================================================================
// MODULE SERVICE - Servicio de Gestión de Módulos
// ============================================================================

import { useApiPost, useApiFetch, useApiPut, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  CreateModuleRequest,
  CreateModuleResponse,
  UpdateModuleRequest,
  UpdateModuleResponse,
  DeleteModuleRequest,
  DeleteModuleResponse,
  GetAllModulesRequest,
  GetAllModulesResponse,
  Module,
  // Permisos de módulos
  CreateModulePermissionRequest,
  UpdateModulePermissionRequest,
  DeleteModulePermissionRequest,
  GetAllModulesPermissionRequest,
  GetAllModulesPermissionResponse,
  ModulePermissionResponse,
  // Acceso de roles a módulos
  CreateModuleRoleAccessRequest,
  UpdateModuleRoleAccessRequest,
  DeleteModuleRoleAccessRequest,
  GetAllModulesRoleAccessRequest,
  GetAllModulesRoleAccessResponse,
  ModuleRoleAccessResponse,
  // Permisos de roles en módulos
  CreateModuleRolePermissionRequest,
  ActivateModuleRolePermissionRequest,
  DeleteModuleRolePermissionRequest,
  GetAllModulesRolePermissionsRequest,
  GetAllModulesRolePermissionsResponse,
  ModuleRolePermissionResponse
} from '../../types/module'

/**
 * Servicio de módulos que maneja operaciones CRUD para módulos del sistema
 * @class ModuleService
 */
export class ModuleService {
  
  // ========================================================================
  // MÉTODOS CRUD PRINCIPALES
  // ========================================================================

  /**
   * Crea un nuevo módulo en el sistema
   * @param {CreateModuleRequest} data - Datos del módulo a crear
   * @param {string|null} data.module - Nombre del módulo
   * @param {string|null} data.description - Descripción del módulo
   * @param {number} data.moduleTypeId - ID del tipo de módulo
   * @param {number} data.userModifiedId - ID del usuario que modifica
   * @returns {Promise<CreateModuleResponse>} Respuesta con el módulo creado
   * @throws {Error} Error si los datos son inválidos o hay problemas de permisos
   */
  async createModule(data: CreateModuleRequest): Promise<CreateModuleResponse> {
    const { execute } = useApiPost<CreateModuleResponse>(
      API_ENDPOINTS.module.create,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene todos los módulos del sistema con filtros opcionales
   * @param {GetAllModulesRequest} [filters] - Filtros opcionales para la búsqueda
   * @param {number} [filters.id] - ID específico del módulo
   * @param {string} [filters.module] - Nombre del módulo a buscar
   * @returns {Promise<GetAllModulesResponse>} Lista de módulos que coinciden con los filtros
   * @throws {Error} Error si hay problemas de conectividad o permisos
   */
  async getAllModules(filters?: GetAllModulesRequest): Promise<GetAllModulesResponse> {
    const { execute } = useApiFetch<GetAllModulesResponse>(
      API_ENDPOINTS.module.getAll,
      { immediate: false }
    )
    
    const queryParams: Record<string, any> = {}
    if (filters?.id !== undefined) {
      queryParams.id = filters.id
    }
    if (filters?.module) {
      queryParams.module = filters.module
    }

    return execute({ query: queryParams })
  }

  /**
   * Actualiza un módulo existente
   * @param {UpdateModuleRequest} data - Datos del módulo a actualizar
   * @param {number} data.id - ID del módulo a actualizar
   * @param {string|null} data.module - Nuevo nombre del módulo
   * @param {string|null} data.description - Nueva descripción del módulo
   * @param {number} data.userModifiedId - ID del usuario que modifica
   * @returns {Promise<UpdateModuleResponse>} Respuesta con el módulo actualizado
   * @throws {Error} Error si el módulo no existe o hay problemas de permisos
   */
  async updateModule(data: UpdateModuleRequest): Promise<UpdateModuleResponse> {
    const { execute } = useApiPut<UpdateModuleResponse>(
      API_ENDPOINTS.module.update,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Elimina un módulo del sistema
   * @param {DeleteModuleRequest} data - Datos para la eliminación
   * @param {number} data.id - ID del módulo a eliminar
   * @param {number} data.userModifiedId - ID del usuario que modifica
   * @returns {Promise<DeleteModuleResponse>} Confirmación de eliminación
   * @throws {Error} Error si el módulo no existe, está en uso o hay problemas de permisos
   */
  async deleteModule(data: DeleteModuleRequest): Promise<DeleteModuleResponse> {
    const { execute } = useApiDelete<DeleteModuleResponse>(
      API_ENDPOINTS.module.delete,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS DE CONVENIENCIA
  // ========================================================================

  /**
   * Obtiene un módulo específico por su ID
   * @param {number} id - ID del módulo a obtener
   * @returns {Promise<Module | null>} El módulo encontrado o null si no existe
   * @throws {Error} Error si hay problemas de conectividad
   */
  async getModuleById(id: number): Promise<Module | null> {
    try {
      const response = await this.getAllModules({ id })
      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error('Error al obtener módulo por ID:', error)
      return null
    }
  }

  /**
   * Busca módulos por nombre
   * @param {string} moduleName - Nombre del módulo a buscar
   * @returns {Promise<Module[]>} Lista de módulos que coinciden con el nombre
   * @throws {Error} Error si hay problemas de conectividad
   */
  async searchModulesByName(moduleName: string): Promise<Module[]> {
    try {
      const response = await this.getAllModules({ module: moduleName })
      return response.data
    } catch (error) {
      console.error('Error al buscar módulos por nombre:', error)
      return []
    }
  }

  /**
   * Verifica si un módulo existe por su ID
   * @param {number} id - ID del módulo a verificar
   * @returns {Promise<boolean>} true si el módulo existe, false en caso contrario
   */
  async moduleExists(id: number): Promise<boolean> {
    try {
      const module = await this.getModuleById(id)
      return module !== null
    } catch (error) {
      console.error('Error al verificar existencia del módulo:', error)
      return false
    }
  }

  /**
   * Obtiene todos los módulos sin filtros
   * @returns {Promise<Module[]>} Lista completa de módulos
   * @throws {Error} Error si hay problemas de conectividad
   */
  async getAllModulesList(): Promise<Module[]> {
    try {
      const response = await this.getAllModules()
      return response.data
    } catch (error) {
      console.error('Error al obtener todos los módulos:', error)
      return []
    }
  }

  // ========================================================================
  // MÉTODOS PARA PERMISOS DE MÓDULOS
  // ========================================================================

  /**
   * Crea un nuevo permiso de módulo
   * @param {CreateModulePermissionRequest} data - Datos del permiso a crear
   * @param {number} data.moduleId - ID del módulo
   * @param {string|null} data.policyName - Nombre de la política
   * @param {number} data.userModifiedId - ID del usuario que modifica
   * @returns {Promise<ModulePermissionResponse>} Respuesta con el permiso creado
   * @throws {Error} Error si los datos son inválidos o hay problemas de permisos
   */
  async createModulePermission(data: CreateModulePermissionRequest): Promise<ModulePermissionResponse> {
    const { execute } = useApiPost<ModulePermissionResponse>(
      API_ENDPOINTS.module.createPermission,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene todos los permisos de módulos con filtros opcionales
   * @param {GetAllModulesPermissionRequest} [filters] - Filtros opcionales
   * @param {number} [filters.moduleId] - ID del módulo
   * @returns {Promise<GetAllModulesPermissionResponse>} Lista de permisos
   * @throws {Error} Error si hay problemas de conectividad o permisos
   */
  async getAllModulesPermissions(filters?: GetAllModulesPermissionRequest): Promise<GetAllModulesPermissionResponse> {
    const { execute } = useApiFetch<GetAllModulesPermissionResponse>(
      API_ENDPOINTS.module.getAllPermissions,
      { immediate: false }
    )
    
    const queryParams: Record<string, any> = {}
    if (filters?.moduleId !== undefined) {
      queryParams.ModuleId = filters.moduleId
    }

    return execute({ query: queryParams })
  }

  /**
   * Actualiza un permiso de módulo existente
   * @param {UpdateModulePermissionRequest} data - Datos del permiso a actualizar
   * @returns {Promise<ModulePermissionResponse>} Respuesta con el permiso actualizado
   * @throws {Error} Error si el permiso no existe o hay problemas de permisos
   */
  async updateModulePermission(data: UpdateModulePermissionRequest): Promise<ModulePermissionResponse> {
    const { execute } = useApiPut<ModulePermissionResponse>(
      API_ENDPOINTS.module.updatePermission,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Elimina un permiso de módulo
   * @param {DeleteModulePermissionRequest} data - Datos para la eliminación
   * @returns {Promise<ModulePermissionResponse>} Confirmación de eliminación
   * @throws {Error} Error si el permiso no existe o hay problemas de permisos
   */
  async deleteModulePermission(data: DeleteModulePermissionRequest): Promise<ModulePermissionResponse> {
    const { execute } = useApiDelete<ModulePermissionResponse>(
      API_ENDPOINTS.module.deletePermission,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS PARA ACCESO DE ROLES A MÓDULOS
  // ========================================================================

  /**
   * Crea un nuevo acceso de rol a módulo
   * @param {CreateModuleRoleAccessRequest} data - Datos del acceso a crear
   * @param {string|null} data.roleId - ID del rol
   * @param {number} data.moduleId - ID del módulo
   * @param {number} data.userModifiedId - ID del usuario que modifica
   * @returns {Promise<ModuleRoleAccessResponse>} Respuesta con el acceso creado
   * @throws {Error} Error si los datos son inválidos o hay problemas de permisos
   */
  async createModuleRoleAccess(data: CreateModuleRoleAccessRequest): Promise<ModuleRoleAccessResponse> {
    const { execute } = useApiPost<ModuleRoleAccessResponse>(
      API_ENDPOINTS.module.createRoleAccess,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene todos los accesos de roles a módulos
   * @param {GetAllModulesRoleAccessRequest} filters - Filtros requeridos
   * @param {string} filters.roleId - ID del rol (requerido)
   * @returns {Promise<GetAllModulesRoleAccessResponse>} Lista de accesos
   * @throws {Error} Error si hay problemas de conectividad o permisos
   */
  async getAllModulesRoleAccess(filters: GetAllModulesRoleAccessRequest): Promise<GetAllModulesRoleAccessResponse> {
    const { execute } = useApiFetch<GetAllModulesRoleAccessResponse>(
      API_ENDPOINTS.module.getAllRoleAccess,
      { immediate: false }
    )
    
    const queryParams: Record<string, any> = {
      RoleId: filters.roleId
    }

    return execute({ query: queryParams })
  }

  /**
   * Actualiza un acceso de rol a módulo existente
   * @param {UpdateModuleRoleAccessRequest} data - Datos del acceso a actualizar
   * @returns {Promise<ModuleRoleAccessResponse>} Respuesta con el acceso actualizado
   * @throws {Error} Error si el acceso no existe o hay problemas de permisos
   */
  async updateModuleRoleAccess(data: UpdateModuleRoleAccessRequest): Promise<ModuleRoleAccessResponse> {
    const { execute } = useApiPut<ModuleRoleAccessResponse>(
      API_ENDPOINTS.module.updateRoleAccess,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Elimina un acceso de rol a módulo
   * @param {DeleteModuleRoleAccessRequest} data - Datos para la eliminación
   * @returns {Promise<ModuleRoleAccessResponse>} Confirmación de eliminación
   * @throws {Error} Error si el acceso no existe o hay problemas de permisos
   */
  async deleteModuleRoleAccess(data: DeleteModuleRoleAccessRequest): Promise<ModuleRoleAccessResponse> {
    const { execute } = useApiDelete<ModuleRoleAccessResponse>(
      API_ENDPOINTS.module.deleteRoleAccess,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS PARA PERMISOS DE ROLES EN MÓDULOS
  // ========================================================================

  /**
   * Crea un nuevo permiso de rol en módulo
   * @param {CreateModuleRolePermissionRequest} data - Datos del permiso a crear
   * @param {string|null} data.roleId - ID del rol
   * @param {number} data.moduleId - ID del módulo
   * @param {number} data.permissionId - ID del permiso
   * @returns {Promise<ModuleRolePermissionResponse>} Respuesta con el permiso creado
   * @throws {Error} Error si los datos son inválidos o hay problemas de permisos
   */
  async createModuleRolePermission(data: CreateModuleRolePermissionRequest): Promise<ModuleRolePermissionResponse> {
    const { execute } = useApiPost<ModuleRolePermissionResponse>(
      API_ENDPOINTS.module.createRolePermission,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Activa o desactiva un permiso de rol en módulo
   * @param {ActivateModuleRolePermissionRequest} data - Datos para activar/desactivar
   * @param {number} data.id - ID del permiso de rol
   * @param {string|null} data.roleId - ID del rol
   * @param {number} data.moduleId - ID del módulo
   * @param {boolean} data.enable - Habilitar/deshabilitar
   * @param {number} data.userModifiedId - ID del usuario que modifica
   * @returns {Promise<ModuleRolePermissionResponse>} Respuesta con el permiso actualizado
   * @throws {Error} Error si el permiso no existe o hay problemas de permisos
   */
  async activateModuleRolePermission(data: ActivateModuleRolePermissionRequest): Promise<ModuleRolePermissionResponse> {
    const { execute } = useApiPut<ModuleRolePermissionResponse>(
      API_ENDPOINTS.module.activateRolePermission,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene todos los permisos de roles en módulos
   * @param {GetAllModulesRolePermissionsRequest} filters - Filtros requeridos
   * @param {string} filters.roleId - ID del rol (requerido)
   * @returns {Promise<GetAllModulesRolePermissionsResponse>} Lista de permisos de roles
   * @throws {Error} Error si hay problemas de conectividad o permisos
   */
  async getAllModulesRolePermissions(filters: GetAllModulesRolePermissionsRequest): Promise<GetAllModulesRolePermissionsResponse> {
    const { execute } = useApiFetch<GetAllModulesRolePermissionsResponse>(
      API_ENDPOINTS.module.getAllRolePermissions,
      { immediate: false }
    )
    
    const queryParams: Record<string, any> = {
      RoleId: filters.roleId
    }

    return execute({ query: queryParams })
  }

  /**
   * Elimina un permiso de rol en módulo
   * @param {DeleteModuleRolePermissionRequest} data - Datos para la eliminación
   * @returns {Promise<ModuleRolePermissionResponse>} Confirmación de eliminación
   * @throws {Error} Error si el permiso no existe o hay problemas de permisos
   */
  async deleteModuleRolePermission(data: DeleteModuleRolePermissionRequest): Promise<ModuleRolePermissionResponse> {
    const { execute } = useApiDelete<ModuleRolePermissionResponse>(
      API_ENDPOINTS.module.deleteRolePermission,
      { immediate: false }
    )
    return execute({ body: data })
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de módulos
 * @type {ModuleService}
 */
export const moduleService = new ModuleService()
