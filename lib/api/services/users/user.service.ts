// ============================================================================
// USER SERVICE - Servicio de Gestión de Usuarios
// ============================================================================

import { apiClient, API_ENDPOINTS } from '../../core/useFetch'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserPermission,
  AddUserPermissionRequest,
  AlternativeEmail,
  AddAlternativeEmailRequest,
  UpdateUserEmailPrimaryRequest
} from '../../types/user'

/**
 * Servicio de gestión de usuarios que maneja CRUD y funcionalidades específicas
 * @class UserService
 */
export class UserService {
  
  // ========================================================================
  // MÉTODOS CRUD BÁSICOS
  // ========================================================================

  /**
   * Crea un nuevo usuario en el sistema
   * @param {CreateUserRequest} data - Datos del nuevo usuario
   * @returns {Promise<User>} Información del usuario creado
   * @throws {Error} Error si el email ya existe o datos inválidos
   */
  async createUser(data: CreateUserRequest) {
    return apiClient.post<User>(API_ENDPOINTS.user.create, data)
  }

  /**
   * Obtiene todos los usuarios del sistema
   * @returns {Promise<User[]>} Lista de todos los usuarios
   * @throws {Error} Error si no se pueden cargar los usuarios
   */
  async getAllUsers() {
    return apiClient.get<User[]>(API_ENDPOINTS.user.getAll)
  }

  /**
   * Obtiene un usuario específico por su ID
   * @param {string} id - ID del usuario a buscar
   * @returns {Promise<User>} Información del usuario encontrado
   * @throws {Error} Error si el usuario no existe
   */
  async getUserById(id: string) {
    return apiClient.get<User>(`${API_ENDPOINTS.user.getById}?id=${id}`)
  }

  /**
   * Obtiene un usuario específico por su email
   * @param {string} email - Email del usuario a buscar
   * @returns {Promise<User>} Información del usuario encontrado
   * @throws {Error} Error si el usuario no existe
   */
  async getUserByEmail(email: string) {
    return apiClient.get<User>(`${API_ENDPOINTS.user.getById}?email=${email}`)
  }

  /**
   * Actualiza la información de un usuario existente
   * @param {UpdateUserRequest} data - Nuevos datos del usuario
   * @returns {Promise<User>} Información del usuario actualizado
   * @throws {Error} Error si el usuario no existe o datos inválidos
   */
  async updateUser(data: UpdateUserRequest) {
    return apiClient.put<User>(API_ENDPOINTS.user.update, data)
  }

  /**
   * Elimina un usuario del sistema
   * @param {string} id - ID del usuario a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si el usuario no existe o no se puede eliminar
   */
  async deleteUser(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.user.delete}?id=${id}`)
  }

  // ========================================================================
  // MÉTODOS DE PERMISOS
  // ========================================================================

  /**
   * Agrega permisos específicos a un usuario
   * @param {AddUserPermissionRequest} data - Datos de permisos a agregar
   * @returns {Promise<UserPermission>} Confirmación de permisos agregados
   * @throws {Error} Error si el usuario no existe o permisos inválidos
   */
  async addUserPermission(data: AddUserPermissionRequest) {
    return apiClient.post<UserPermission>(API_ENDPOINTS.user.addPermissions, data)
  }

  // ========================================================================
  // MÉTODOS DE EMAILS ALTERNATIVOS
  // ========================================================================

  /**
   * Agrega un email alternativo a un usuario
   * 
   * Este método permite agregar emails de respaldo a la cuenta de un usuario.
   * Los emails alternativos pueden ser utilizados para recuperación de cuenta
   * y notificaciones adicionales.
   */
  async addAlternativeEmail(data: AddAlternativeEmailRequest) {
    return apiClient.post<AlternativeEmail>(API_ENDPOINTS.user.addAlternativeEmail, data)
  }

  /**
   * Obtiene todos los emails alternativos de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<AlternativeEmail[]>} Lista de emails alternativos
   * @throws {Error} Error si el usuario no existe
   */
  async getAllAlternativeEmails(userId: string) {
    return apiClient.get<AlternativeEmail[]>(`${API_ENDPOINTS.user.getAllAlternativeEmails}?Id=${userId}`)
  }

  /**
   * Elimina un email alternativo de un usuario
   * @param {string} email - Email a eliminar
   * @param {number} userModifiedId - ID del usuario que realiza la modificación (por defecto 1)
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si el email no existe
   */
  async deleteAlternativeEmail(email: string, userModifiedId: number = 1) {
    return apiClient.delete(API_ENDPOINTS.user.deleteAlternativeEmail, {
      data: {
        email: email,
        userModifiedId: userModifiedId
      }
    })
  }

  /**
   * Actualiza el email principal de un usuario
   * @param {UpdateUserEmailPrimaryRequest} data - Datos del nuevo email principal
   * @returns {Promise<void>} Confirmación de actualización
   * @throws {Error} Error si el email es inválido o ya existe
   */
  async updateUserEmailPrimary(data: UpdateUserEmailPrimaryRequest) {
    return apiClient.put(API_ENDPOINTS.user.updateEmailPrimary, data)
  }

  // ========================================================================
  // MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  // ========================================================================

  /**
   * Envía token de recuperación de contraseña por email
   * @param {string} email - Email del usuario para recuperación
   * @returns {Promise<void>} Confirmación de envío
   * @throws {Error} Error si el email no existe
   */
  async sendEmailTokenResetPassword(email: string) {
    return apiClient.get(`${API_ENDPOINTS.user.sendEmailTokenResetPassword}?email=${email}`)
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de usuarios
 * @type {UserService}
 */
export const userService = new UserService() 