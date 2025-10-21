// ============================================================================
// MODULE TYPES - Interfaces para el servicio de módulos
// ============================================================================

/**
 * Interfaz para crear un nuevo módulo
 */
export interface CreateModuleRequest {
  /** Nombre del módulo */
  module: string | null
  /** Descripción del módulo */
  description: string | null
  /** ID del tipo de módulo */
  moduleTypeId: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para actualizar un módulo existente
 */
export interface UpdateModuleRequest {
  /** ID del módulo a actualizar */
  id: number
  /** Nombre del módulo */
  module: string | null
  /** Descripción del módulo */
  description: string | null
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para eliminar un módulo
 */
export interface DeleteModuleRequest {
  /** ID del módulo a eliminar */
  id: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para obtener módulos con filtros
 */
export interface GetAllModulesRequest {
  /** ID del módulo (opcional) */
  id?: number
  /** Nombre del módulo (opcional) */
  module?: string
}

/**
 * Interfaz que representa un módulo en el sistema
 */
export interface Module {
  /** ID único del módulo */
  id: number
  /** Nombre del módulo */
  module: string | null
  /** Descripción del módulo */
  description: string | null
  /** ID del tipo de módulo */
  moduleTypeId: number
  /** ID del usuario que creó el módulo */
  userCreatedId?: number
  /** ID del usuario que modificó el módulo */
  userModifiedId?: number
  /** Fecha de creación */
  createdAt?: string
  /** Fecha de última modificación */
  updatedAt?: string
}

/**
 * Respuesta del endpoint de creación de módulo
 */
export interface CreateModuleResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Mensaje de respuesta */
  message: string
  /** Datos del módulo creado */
  data?: Module
}

/**
 * Respuesta del endpoint de actualización de módulo
 */
export interface UpdateModuleResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Mensaje de respuesta */
  message: string
  /** Datos del módulo actualizado */
  data?: Module
}

/**
 * Respuesta del endpoint de eliminación de módulo
 */
export interface DeleteModuleResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Mensaje de respuesta */
  message: string
}

/**
 * Respuesta del endpoint de obtención de módulos
 */
export interface GetAllModulesResponse {
  /** Código de respuesta */
  code: number
  /** Indica si la operación fue exitosa */
  isValid: boolean
  /** Mensaje de respuesta */
  comments: string
  /** Lista de módulos */
  response: Module[]
  /** Token de autenticación */
  token: string
}

// ============================================================================
// TIPOS PARA PERMISOS DE MÓDULOS
// ============================================================================

/**
 * Interfaz para crear un permiso de módulo
 */
export interface CreateModulePermissionRequest {
  /** ID del módulo */
  moduleId: number
  /** Nombre de la política */
  policyName: string | null
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para actualizar un permiso de módulo
 */
export interface UpdateModulePermissionRequest {
  /** ID del permiso */
  id: number
  /** ID del módulo */
  moduleId: number
  /** Nombre de la política */
  policyName: string | null
  /** Nombre del claim */
  claimName: string | null
  /** Estado del permiso */
  status: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para eliminar un permiso de módulo
 */
export interface DeleteModulePermissionRequest {
  /** ID del permiso */
  id: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para obtener permisos de módulos
 */
export interface GetAllModulesPermissionRequest {
  /** ID del módulo */
  moduleId?: number
}

/**
 * Interfaz que representa un permiso de módulo
 */
export interface ModulePermission {
  /** ID único del permiso */
  id: number
  /** ID del módulo */
  moduleId: number
  /** Nombre de la política */
  policyName: string | null
  /** Nombre del claim */
  claimName: string | null
  /** Estado del permiso */
  status: number
  /** ID del usuario que creó el permiso */
  userCreatedId?: number
  /** ID del usuario que modificó el permiso */
  userModifiedId?: number
  /** Fecha de creación */
  createdAt?: string
  /** Fecha de última modificación */
  updatedAt?: string
}

// ============================================================================
// TIPOS PARA ACCESO DE ROLES A MÓDULOS
// ============================================================================

/**
 * Interfaz para crear acceso de rol a módulo
 */
export interface CreateModuleRoleAccessRequest {
  /** ID del rol */
  roleId: string | null
  /** ID del módulo */
  moduleId: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para actualizar acceso de rol a módulo
 */
export interface UpdateModuleRoleAccessRequest {
  /** ID del acceso */
  id: number
  /** ID del rol */
  roleId: string | null
  /** ID del módulo */
  moduleId: number
  /** Estado del acceso */
  status: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para eliminar acceso de rol a módulo
 */
export interface DeleteModuleRoleAccessRequest {
  /** ID del acceso */
  id: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para obtener accesos de roles a módulos
 */
export interface GetAllModulesRoleAccessRequest {
  /** ID del rol (requerido) */
  roleId: string
}

/**
 * Interfaz que representa un acceso de rol a módulo
 */
export interface ModuleRoleAccess {
  /** ID único del acceso */
  id: number
  /** ID del rol */
  roleId: string
  /** Nombre del rol */
  roleName: string
  /** Nombre del módulo */
  module: string
  /** ID del módulo */
  moduleId: number
  /** ID del usuario que modificó el acceso */
  userModifiedId: number
  /** Fecha de modificación */
  dateModified: string
}

// ============================================================================
// TIPOS PARA PERMISOS DE ROLES EN MÓDULOS
// ============================================================================

/**
 * Interfaz para crear permiso de rol en módulo
 */
export interface CreateModuleRolePermissionRequest {
  /** ID del rol */
  roleId: string | null
  /** ID del módulo */
  moduleId: number
  /** ID del permiso */
  permissionId: number
}

/**
 * Interfaz para activar/desactivar permiso de rol en módulo
 */
export interface ActivateModuleRolePermissionRequest {
  /** ID del permiso de rol */
  id: number
  /** ID del rol */
  roleId: string | null
  /** ID del módulo */
  moduleId: number
  /** Habilitar/deshabilitar */
  enable: boolean
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para eliminar permiso de rol en módulo
 */
export interface DeleteModuleRolePermissionRequest {
  /** ID del permiso de rol */
  id: number
  /** ID del usuario que modifica */
  userModifiedId: number
}

/**
 * Interfaz para obtener permisos de roles en módulos
 */
export interface GetAllModulesRolePermissionsRequest {
  /** ID del rol (requerido) */
  roleId: string
}

/**
 * Interfaz que representa un permiso de rol en módulo
 */
export interface ModuleRolePermission {
  /** ID único del permiso de rol */
  id: number
  /** ID del módulo */
  moduleId: number
  /** ID del permiso */
  permissionId: number
  /** ID del estado */
  statusId: number
  /** ID del usuario que modificó el permiso */
  userModifiedId: number
  /** Fecha de modificación */
  dateModified: string
  /** Habilitado/deshabilitado */
  enable: boolean
  /** Nombre del módulo */
  module: string
  /** Nombre de la política */
  policyName: string
  /** Nombre del claim */
  claimName: string
  /** Estado del permiso */
  status: string
  /** Nombre del rol */
  role: string
  /** ID del rol */
  roleId: string
}

// ============================================================================
// RESPUESTAS DE API
// ============================================================================

/**
 * Respuesta genérica para operaciones de permisos
 */
export interface ModulePermissionResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Mensaje de respuesta */
  message: string
  /** Datos del permiso (opcional) */
  data?: ModulePermission
}

/**
 * Respuesta para obtener permisos de módulos
 */
export interface GetAllModulesPermissionResponse {
  /** Código de respuesta */
  code: number
  /** Indica si la operación fue exitosa */
  isValid: boolean
  /** Mensaje de respuesta */
  comments: string
  /** Lista de permisos */
  response: ModulePermission[]
  /** Token de autenticación */
  token: string
}

/**
 * Respuesta genérica para operaciones de acceso de roles
 */
export interface ModuleRoleAccessResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Mensaje de respuesta */
  message: string
  /** Datos del acceso (opcional) */
  data?: ModuleRoleAccess
}

/**
 * Respuesta para obtener accesos de roles a módulos
 */
export interface GetAllModulesRoleAccessResponse {
  /** Código de respuesta */
  code: number
  /** Indica si la operación fue exitosa */
  isValid: boolean
  /** Comentarios de la respuesta */
  comments: string
  /** Lista de accesos */
  response: ModuleRoleAccess[]
  /** Token de autenticación */
  token: string
}

/**
 * Respuesta genérica para operaciones de permisos de roles
 */
export interface ModuleRolePermissionResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Mensaje de respuesta */
  message: string
  /** Datos del permiso de rol (opcional) */
  data?: ModuleRolePermission
}

/**
 * Respuesta para obtener permisos de roles en módulos
 */
export interface GetAllModulesRolePermissionsResponse {
  /** Código de respuesta */
  code: number
  /** Indica si la operación fue exitosa */
  isValid: boolean
  /** Comentarios de la respuesta */
  comments: string
  /** Lista de permisos de roles */
  response: ModuleRolePermission[]
  /** Token de autenticación */
  token: string
}
