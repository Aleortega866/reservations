import { ref, readonly, computed } from 'vue'
import { moduleService } from '~/lib/api/services/module'
import { useAuth } from '~/lib/api/composables/auth'
import type { 
  Module, 
  CreateModuleRequest, 
  UpdateModuleRequest, 
  DeleteModuleRequest,
  GetAllModulesRequest,
  // Permisos de módulos
  CreateModulePermissionRequest,
  UpdateModulePermissionRequest,
  DeleteModulePermissionRequest,
  GetAllModulesPermissionRequest,
  ModulePermission,
  // Acceso de roles a módulos
  CreateModuleRoleAccessRequest,
  UpdateModuleRoleAccessRequest,
  DeleteModuleRoleAccessRequest,
  GetAllModulesRoleAccessRequest,
  ModuleRoleAccess,
  // Permisos de roles en módulos
  CreateModuleRolePermissionRequest,
  ActivateModuleRolePermissionRequest,
  DeleteModuleRolePermissionRequest,
  GetAllModulesRolePermissionsRequest,
  ModuleRolePermission
} from '~/lib/api/types/module'
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'

// ============================================================================
// COMPOSABLE MEJORADO DE MÓDULOS CON AUTENTICACIÓN INTEGRADA
// ============================================================================

// Instancia singleton para evitar múltiples instancias
let moduleServiceInstance: ReturnType<typeof createModuleService> | null = null

/**
 * Función interna para crear el servicio de módulos mejorado
 * Integra autenticación automática y manejo robusto de errores
 */
function createModuleService() {
  // ============================================================================
  // COMPOSABLES Y SERVICIOS BASE
  // ============================================================================
  
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()

  // ============================================================================
  // ESTADOS REACTIVOS
  // ============================================================================

  const modules = ref<Module[]>([])
  const modulePermissions = ref<ModulePermission[]>([])
  const moduleRoleAccess = ref<ModuleRoleAccess[]>([])
  const moduleRolePermissions = ref<ModuleRolePermission[]>([])
  
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  // Estados de loading granulares para módulos
  const isCreating = ref(false)
  const isUpdating = ref(false)
  const isDeleting = ref(false)
  const isSearching = ref(false)
  
  // Estados de loading granulares para permisos
  const isCreatingPermission = ref(false)
  const isUpdatingPermission = ref(false)
  const isDeletingPermission = ref(false)
  const isLoadingPermissions = ref(false)
  
  // Estados de loading granulares para acceso de roles
  const isCreatingRoleAccess = ref(false)
  const isUpdatingRoleAccess = ref(false)
  const isDeletingRoleAccess = ref(false)
  const isLoadingRoleAccess = ref(false)
  
  // Estados de loading granulares para permisos de roles
  const isCreatingRolePermission = ref(false)
  const isActivatingRolePermission = ref(false)
  const isDeletingRolePermission = ref(false)
  const isLoadingRolePermissions = ref(false)

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Obtiene el ID del usuario autenticado para operaciones
   */
  const getUserModifiedId = (): number => {
    if (!user.value?.userId) {
      throw new Error('Usuario no autenticado')
    }
    return user.value.userId
  }

  /**
   * Maneja errores de forma consistente
   */
  const handleError = (err: any, operation: string) => {
    console.error(`Error en ${operation}:`, err)
    error.value = err as Error
    const errorMessage = getErrorMessage(err)
    showError('Error', errorMessage || `No se pudo ${operation}`)
    throw err
  }

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    error.value = null
  }

  // ============================================================================
  // OPERACIONES DE MÓDULOS CON AUTENTICACIÓN AUTOMÁTICA
  // ============================================================================

  /**
   * Obtiene todos los módulos con filtros opcionales
   */
  const getAllModules = async (filters?: GetAllModulesRequest) => {
    loading.value = true
    clearError()
    try {
      const response = await moduleService.getAllModules(filters)
      
      // La API devuelve los datos en 'response'
      const modulesData = response.response || []
      modules.value = modulesData
      
      return modulesData
    } catch (err) {
      handleError(err, 'cargar módulos')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo módulo con autenticación automática
   */
  const createModule = async (request: Omit<CreateModuleRequest, 'userModifiedId'>) => {
    if (isCreating.value) return null
    
    isCreating.value = true
    clearError()
    try {
      // Agregar userModifiedId automáticamente
      const fullRequest: CreateModuleRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.createModule(fullRequest)
      
      // Agregar optimísticamente a la lista local si la respuesta incluye el módulo
      if (response.data) {
        modules.value.push(response.data)
      }
      
      showSuccess('Éxito', 'Módulo creado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'crear módulo')
      return null
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Actualiza un módulo con autenticación automática
   */
  const updateModule = async (request: Omit<UpdateModuleRequest, 'userModifiedId'>) => {
    if (isUpdating.value) return null
    
    isUpdating.value = true
    clearError()
    try {
      // Agregar userModifiedId automáticamente
      const fullRequest: UpdateModuleRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.updateModule(fullRequest)
      
      // Actualizar optimísticamente en la lista local
      if (response.data) {
        const index = modules.value.findIndex(module => module.id === request.id)
        if (index !== -1) {
          modules.value[index] = response.data
        }
      }
      
      showSuccess('Éxito', 'Módulo actualizado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'actualizar módulo')
      return null
    } finally {
      isUpdating.value = false
    }
  }

  /**
   * Elimina un módulo con autenticación automática
   */
  const deleteModule = async (request: Omit<DeleteModuleRequest, 'userModifiedId'>) => {
    if (isDeleting.value) return null
    
    isDeleting.value = true
    clearError()
    try {
      // Agregar userModifiedId automáticamente
      const fullRequest: DeleteModuleRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.deleteModule(fullRequest)
      
      // Remover optimísticamente de la lista local
      const index = modules.value.findIndex(module => module.id === request.id)
      if (index !== -1) {
        modules.value.splice(index, 1)
      }
      
      showSuccess('Éxito', 'Módulo eliminado correctamente')
      return response
    } catch (err) {
      handleError(err, 'eliminar módulo')
      return null
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Obtiene un módulo por ID
   */
  const getModuleById = async (id: number) => {
    loading.value = true
    clearError()
    try {
      return await moduleService.getModuleById(id)
    } catch (err) {
      handleError(err, 'obtener módulo')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca módulos por nombre
   */
  const searchModulesByName = async (moduleName: string) => {
    if (isSearching.value) return []
    
    isSearching.value = true
    clearError()
    try {
      const results = await moduleService.searchModulesByName(moduleName)
      return results
    } catch (err) {
      handleError(err, 'buscar módulos')
      return []
    } finally {
      isSearching.value = false
    }
  }

  /**
   * Verifica si un módulo existe por su ID
   */
  const moduleExists = async (id: number) => {
    try {
      return await moduleService.moduleExists(id)
    } catch (err) {
      console.error('Error al verificar existencia del módulo:', err)
      return false
    }
  }

  /**
   * Obtiene todos los módulos sin filtros
   */
  const getAllModulesList = async () => {
    try {
      const results = await moduleService.getAllModulesList()
      modules.value = results
      return results
    } catch (err) {
      handleError(err, 'obtener lista de módulos')
      return []
    }
  }

  // ========================================================================
  // OPERACIONES PARA PERMISOS DE MÓDULOS
  // ========================================================================

  /**
   * Crea un nuevo permiso de módulo con autenticación automática
   */
  const createModulePermission = async (request: Omit<CreateModulePermissionRequest, 'userModifiedId'>) => {
    if (isCreatingPermission.value) return null
    
    isCreatingPermission.value = true
    clearError()
    try {
      const fullRequest: CreateModulePermissionRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.createModulePermission(fullRequest)
      
      if (response.data) {
        modulePermissions.value.push(response.data)
      }
      
      showSuccess('Éxito', 'Permiso de módulo creado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'crear permiso de módulo')
      return null
    } finally {
      isCreatingPermission.value = false
    }
  }

  /**
   * Obtiene todos los permisos de módulos con filtros opcionales
   */
  const getAllModulesPermissions = async (filters?: GetAllModulesPermissionRequest) => {
    isLoadingPermissions.value = true
    clearError()
    try {
      const response = await moduleService.getAllModulesPermissions(filters)
      // La API devuelve los datos en 'response'
      const permissionsData = response.response || []
      modulePermissions.value = permissionsData
      return permissionsData
    } catch (err) {
      handleError(err, 'cargar permisos de módulos')
      return []
    } finally {
      isLoadingPermissions.value = false
    }
  }

  /**
   * Actualiza un permiso de módulo con autenticación automática
   */
  const updateModulePermission = async (request: Omit<UpdateModulePermissionRequest, 'userModifiedId'>) => {
    if (isUpdatingPermission.value) return null
    
    isUpdatingPermission.value = true
    clearError()
    try {
      const fullRequest: UpdateModulePermissionRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.updateModulePermission(fullRequest)
      
      if (response.data) {
        const index = modulePermissions.value.findIndex(permission => permission.id === request.id)
        if (index !== -1) {
          modulePermissions.value[index] = response.data
        }
      }
      
      showSuccess('Éxito', 'Permiso de módulo actualizado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'actualizar permiso de módulo')
      return null
    } finally {
      isUpdatingPermission.value = false
    }
  }

  /**
   * Elimina un permiso de módulo con autenticación automática
   */
  const deleteModulePermission = async (request: Omit<DeleteModulePermissionRequest, 'userModifiedId'>) => {
    if (isDeletingPermission.value) return null
    
    isDeletingPermission.value = true
    clearError()
    try {
      const fullRequest: DeleteModulePermissionRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.deleteModulePermission(fullRequest)
      
      const index = modulePermissions.value.findIndex(permission => permission.id === request.id)
      if (index !== -1) {
        modulePermissions.value.splice(index, 1)
      }
      
      showSuccess('Éxito', 'Permiso de módulo eliminado correctamente')
      return response
    } catch (err) {
      handleError(err, 'eliminar permiso de módulo')
      return null
    } finally {
      isDeletingPermission.value = false
    }
  }

  // ========================================================================
  // OPERACIONES PARA ACCESO DE ROLES A MÓDULOS
  // ========================================================================

  /**
   * Crea un nuevo acceso de rol a módulo con autenticación automática
   */
  const createModuleRoleAccess = async (request: Omit<CreateModuleRoleAccessRequest, 'userModifiedId'>) => {
    if (isCreatingRoleAccess.value) return null
    
    isCreatingRoleAccess.value = true
    clearError()
    try {
      const fullRequest: CreateModuleRoleAccessRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.createModuleRoleAccess(fullRequest)
      
      if (response.data) {
        moduleRoleAccess.value.push(response.data)
      }
      
      showSuccess('Éxito', 'Acceso de rol a módulo creado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'crear acceso de rol a módulo')
      return null
    } finally {
      isCreatingRoleAccess.value = false
    }
  }

  /**
   * Obtiene todos los accesos de roles a módulos
   */
  const getAllModulesRoleAccess = async (filters: GetAllModulesRoleAccessRequest) => {
    isLoadingRoleAccess.value = true
    clearError()
    try {
      const response = await moduleService.getAllModulesRoleAccess(filters)
      moduleRoleAccess.value = response.response || []
      return response.response || []
    } catch (err) {
      handleError(err, 'cargar accesos de roles a módulos')
      return []
    } finally {
      isLoadingRoleAccess.value = false
    }
  }

  /**
   * Actualiza un acceso de rol a módulo con autenticación automática
   */
  const updateModuleRoleAccess = async (request: Omit<UpdateModuleRoleAccessRequest, 'userModifiedId'>) => {
    if (isUpdatingRoleAccess.value) return null
    
    isUpdatingRoleAccess.value = true
    clearError()
    try {
      const fullRequest: UpdateModuleRoleAccessRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.updateModuleRoleAccess(fullRequest)
      
      if (response.data) {
        const index = moduleRoleAccess.value.findIndex(access => access.id === request.id)
        if (index !== -1) {
          moduleRoleAccess.value[index] = response.data
        }
      }
      
      showSuccess('Éxito', 'Acceso de rol a módulo actualizado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'actualizar acceso de rol a módulo')
      return null
    } finally {
      isUpdatingRoleAccess.value = false
    }
  }

  /**
   * Elimina un acceso de rol a módulo con autenticación automática
   */
  const deleteModuleRoleAccess = async (request: Omit<DeleteModuleRoleAccessRequest, 'userModifiedId'>) => {
    if (isDeletingRoleAccess.value) return null
    
    isDeletingRoleAccess.value = true
    clearError()
    try {
      const fullRequest: DeleteModuleRoleAccessRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.deleteModuleRoleAccess(fullRequest)
      
      const index = moduleRoleAccess.value.findIndex(access => access.id === request.id)
      if (index !== -1) {
        moduleRoleAccess.value.splice(index, 1)
      }
      
      // No mostrar notificación automática - el componente padre se encarga de esto
      return response
    } catch (err) {
      handleError(err, 'eliminar acceso de rol a módulo')
      return null
    } finally {
      isDeletingRoleAccess.value = false
    }
  }

  // ========================================================================
  // OPERACIONES PARA PERMISOS DE ROLES EN MÓDULOS
  // ========================================================================

  /**
   * Crea un nuevo permiso de rol en módulo
   */
  const createModuleRolePermission = async (request: CreateModuleRolePermissionRequest) => {
    if (isCreatingRolePermission.value) return null
    
    isCreatingRolePermission.value = true
    clearError()
    try {
      const response = await moduleService.createModuleRolePermission(request)
      
      if (response.data) {
        moduleRolePermissions.value.push(response.data)
      }
      
      showSuccess('Éxito', 'Permiso de rol en módulo creado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'crear permiso de rol en módulo')
      return null
    } finally {
      isCreatingRolePermission.value = false
    }
  }

  /**
   * Activa o desactiva un permiso de rol en módulo con autenticación automática
   */
  const activateModuleRolePermission = async (request: Omit<ActivateModuleRolePermissionRequest, 'userModifiedId'>) => {
    if (isActivatingRolePermission.value) return null
    
    isActivatingRolePermission.value = true
    clearError()
    try {
      const fullRequest: ActivateModuleRolePermissionRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.activateModuleRolePermission(fullRequest)
      
      if (response.data) {
        const index = moduleRolePermissions.value.findIndex(permission => permission.id === request.id)
        if (index !== -1) {
          moduleRolePermissions.value[index] = response.data
        }
      }
      
      showSuccess('Éxito', 'Permiso de rol en módulo actualizado correctamente')
      return response.data
    } catch (err) {
      handleError(err, 'actualizar permiso de rol en módulo')
      return null
    } finally {
      isActivatingRolePermission.value = false
    }
  }

  /**
   * Obtiene todos los permisos de roles en módulos
   */
  const getAllModulesRolePermissions = async (filters: GetAllModulesRolePermissionsRequest) => {
    isLoadingRolePermissions.value = true
    clearError()
    try {
      const response = await moduleService.getAllModulesRolePermissions(filters)
      moduleRolePermissions.value = response.response || []
      return response.response || []
    } catch (err) {
      handleError(err, 'cargar permisos de roles en módulos')
      return []
    } finally {
      isLoadingRolePermissions.value = false
    }
  }

  /**
   * Obtiene todos los permisos disponibles (de todos los roles) para mostrar en el diálogo de asignación
   * Esto es útil para mostrar qué permisos están disponibles para cada módulo
   */
  const getAllAvailablePermissions = async () => {
    isLoadingRolePermissions.value = true
    clearError()
    try {
      // Obtener permisos de un rol específico (por ejemplo, el rol de administrador)
      // o implementar un endpoint que devuelva todos los permisos disponibles
      // Por ahora, usamos los permisos que ya están en el estado
      return moduleRolePermissions.value
    } catch (err) {
      handleError(err, 'cargar permisos disponibles')
      return []
    } finally {
      isLoadingRolePermissions.value = false
    }
  }

  /**
   * Elimina un permiso de rol en módulo con autenticación automática
   */
  const deleteModuleRolePermission = async (request: Omit<DeleteModuleRolePermissionRequest, 'userModifiedId'>) => {
    if (isDeletingRolePermission.value) return null
    
    isDeletingRolePermission.value = true
    clearError()
    try {
      const fullRequest: DeleteModuleRolePermissionRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const response = await moduleService.deleteModuleRolePermission(fullRequest)
      
      const index = moduleRolePermissions.value.findIndex(permission => permission.id === request.id)
      if (index !== -1) {
        moduleRolePermissions.value.splice(index, 1)
      }
      
      // No mostrar notificación automática - el componente padre se encarga de esto
      return response
    } catch (err) {
      handleError(err, 'eliminar permiso de rol en módulo')
      return null
    } finally {
      isDeletingRolePermission.value = false
    }
  }

  // ============================================================================
  // UTILIDADES Y COMPUTED PROPERTIES
  // ============================================================================

  /**
   * Filtra módulos por tipo
   */
  const getModulesByType = (moduleTypeId: number) => {
    return computed(() => 
      modules.value.filter(module => module.moduleTypeId === moduleTypeId)
    )
  }

  /**
   * Busca módulos en la lista local por nombre
   */
  const searchLocalModules = (searchTerm: string) => {
    return computed(() => {
      if (!searchTerm) return modules.value
      const term = searchTerm.toLowerCase()
      return modules.value.filter(module => 
        module.module?.toLowerCase().includes(term) ||
        module.description?.toLowerCase().includes(term)
      )
    })
  }

  /**
   * Obtiene módulos activos (con nombre no nulo)
   */
  const activeModules = readonly(
    computed(() => modules.value.filter(module => module.module !== null))
  )

  /**
   * Estado de loading consolidado
   */
  const isLoading = readonly(
    computed(() => 
      loading.value || 
      isCreating.value || isUpdating.value || isDeleting.value || isSearching.value ||
      isCreatingPermission.value || isUpdatingPermission.value || isDeletingPermission.value || isLoadingPermissions.value ||
      isCreatingRoleAccess.value || isUpdatingRoleAccess.value || isDeletingRoleAccess.value || isLoadingRoleAccess.value ||
      isCreatingRolePermission.value || isActivatingRolePermission.value || isDeletingRolePermission.value || isLoadingRolePermissions.value
    )
  )

  /**
   * Estadísticas de módulos
   */
  const moduleStats = readonly(
    computed(() => ({
      total: modules.value.length,
      active: activeModules.value.length,
      byType: modules.value.reduce((acc, module) => {
        acc[module.moduleTypeId] = (acc[module.moduleTypeId] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }))
  )

  /**
   * Estadísticas de permisos
   */
  const permissionStats = readonly(
    computed(() => ({
      total: modulePermissions.value.length,
      byModule: modulePermissions.value.reduce((acc, permission) => {
        acc[permission.moduleId] = (acc[permission.moduleId] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }))
  )

  /**
   * Estadísticas de acceso de roles
   */
  const roleAccessStats = readonly(
    computed(() => ({
      total: moduleRoleAccess.value.length,
      byRole: moduleRoleAccess.value.reduce((acc, access) => {
        if (access.roleId) {
          acc[access.roleId] = (acc[access.roleId] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      byModule: moduleRoleAccess.value.reduce((acc, access) => {
        acc[access.moduleId] = (acc[access.moduleId] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }))
  )

  /**
   * Estadísticas de permisos de roles
   */
  const rolePermissionStats = readonly(
    computed(() => ({
      total: moduleRolePermissions.value.length,
      active: moduleRolePermissions.value.filter(p => p.enable).length,
      byRole: moduleRolePermissions.value.reduce((acc, permission) => {
        if (permission.roleId) {
          acc[permission.roleId] = (acc[permission.roleId] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      byModule: moduleRolePermissions.value.reduce((acc, permission) => {
        acc[permission.moduleId] = (acc[permission.moduleId] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }))
  )

  // ============================================================================
  // RETORNO DEL COMPOSABLE
  // ============================================================================

  return {
    // Estados reactivos principales
    modules: readonly(modules),
    modulePermissions: readonly(modulePermissions),
    moduleRoleAccess: readonly(moduleRoleAccess),
    moduleRolePermissions: readonly(moduleRolePermissions),
    
    // Estados de loading
    loading: readonly(loading),
    isLoading,
    
    // Estados de loading granulares para módulos
    isCreating: readonly(isCreating),
    isUpdating: readonly(isUpdating),
    isDeleting: readonly(isDeleting),
    isSearching: readonly(isSearching),
    
    // Estados de loading granulares para permisos
    isCreatingPermission: readonly(isCreatingPermission),
    isUpdatingPermission: readonly(isUpdatingPermission),
    isDeletingPermission: readonly(isDeletingPermission),
    isLoadingPermissions: readonly(isLoadingPermissions),
    
    // Estados de loading granulares para acceso de roles
    isCreatingRoleAccess: readonly(isCreatingRoleAccess),
    isUpdatingRoleAccess: readonly(isUpdatingRoleAccess),
    isDeletingRoleAccess: readonly(isDeletingRoleAccess),
    isLoadingRoleAccess: readonly(isLoadingRoleAccess),
    
    // Estados de loading granulares para permisos de roles
    isCreatingRolePermission: readonly(isCreatingRolePermission),
    isActivatingRolePermission: readonly(isActivatingRolePermission),
    isDeletingRolePermission: readonly(isDeletingRolePermission),
    isLoadingRolePermissions: readonly(isLoadingRolePermissions),
    
    // Estado de error
    error: readonly(error),

    // Computed properties
    activeModules,
    moduleStats,
    permissionStats,
    roleAccessStats,
    rolePermissionStats,

    // Operaciones CRUD de módulos
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,

    // Operaciones de búsqueda de módulos
    searchModulesByName,
    searchLocalModules,
    moduleExists,
    getAllModulesList,

    // Operaciones CRUD de permisos de módulos
    createModulePermission,
    getAllModulesPermissions,
    updateModulePermission,
    deleteModulePermission,

    // Operaciones CRUD de acceso de roles a módulos
    createModuleRoleAccess,
    getAllModulesRoleAccess,
    updateModuleRoleAccess,
    deleteModuleRoleAccess,

    // Operaciones CRUD de permisos de roles en módulos
    createModuleRolePermission,
    activateModuleRolePermission,
    getAllModulesRolePermissions,
    getAllAvailablePermissions,
    deleteModuleRolePermission,

    // Utilidades
    getModulesByType,
    clearError
  }
}

/**
 * Composable unificado para gestión completa de módulos, permisos y roles
 * 
 * Características:
 * - ✅ Autenticación automática integrada
 * - ✅ Operaciones optimistas
 * - ✅ Estados granulares de loading
 * - ✅ Manejo robusto de errores
 * - ✅ Notificaciones automáticas
 * - ✅ Patrón singleton para consistencia
 * - ✅ Búsqueda local y remota
 * - ✅ Estadísticas completas
 * - ✅ Gestión de permisos de módulos
 * - ✅ Gestión de acceso de roles a módulos
 * - ✅ Gestión de permisos de roles en módulos
 * 
 * @example
 * ```typescript
 * const {
 *   // Estados principales
 *   modules,
 *   modulePermissions,
 *   moduleRoleAccess,
 *   moduleRolePermissions,
 *   
 *   // Estados de loading
 *   isLoading,
 *   isCreating,
 *   isCreatingPermission,
 *   
 *   // Operaciones de módulos
 *   createModule,
 *   updateModule,
 *   deleteModule,
 *   
 *   // Operaciones de permisos
 *   createModulePermission,
 *   updateModulePermission,
 *   deleteModulePermission,
 *   
 *   // Operaciones de acceso de roles
 *   createModuleRoleAccess,
 *   updateModuleRoleAccess,
 *   deleteModuleRoleAccess,
 *   
 *   // Operaciones de permisos de roles
 *   createModuleRolePermission,
 *   activateModuleRolePermission,
 *   deleteModuleRolePermission,
 *   
 *   // Estadísticas
 *   moduleStats,
 *   permissionStats,
 *   roleAccessStats,
 *   rolePermissionStats
 * } = useModules()
 * 
 * // Crear módulo (userModifiedId se agrega automáticamente)
 * await createModule({
 *   module: 'Gestión de Usuarios',
 *   description: 'Módulo para administrar usuarios',
 *   moduleTypeId: 1
 * })
 * 
 * // Crear permiso de módulo
 * await createModulePermission({
 *   moduleId: 1,
 *   policyName: 'read_users'
 * })
 * 
 * // Crear acceso de rol a módulo
 * await createModuleRoleAccess({
 *   roleId: 'admin',
 *   moduleId: 1
 * })
 * 
 * // Crear permiso de rol en módulo
 * await createModuleRolePermission({
 *   roleId: 'admin',
 *   moduleId: 1,
 *   permissionId: 1
 * })
 * ```
 */
export function useModules() {
  if (!moduleServiceInstance) {
    moduleServiceInstance = createModuleService()
  }
  return moduleServiceInstance
}

// ============================================================================
// EXPORTS PARA COMPATIBILIDAD
// ============================================================================

// Export principal (recomendado)
export { useModules as useModuleService }

// Export de tipos para convenience
export type {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  DeleteModuleRequest,
  GetAllModulesRequest
} from '~/lib/api/types/module'
