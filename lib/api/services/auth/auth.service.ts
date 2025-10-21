// ============================================================================
// AUTH SERVICE - Servicio de Autenticación
// ============================================================================

import { useApiPost, useApiFetch } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  SignInRequest,
  SignInResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ConfirmTokenAccessRequest,
  ConfirmTokenAccessResponse,
  ResetPasswordSignInRequest,
  ResetPasswordSignInResponse
} from '../../types/auth'

/**
 * Servicio de autenticación que maneja login, registro y recuperación de contraseña
 * @class AuthService
 */
export class AuthService {
  
  // ========================================================================
  // MÉTODOS DE AUTENTICACIÓN PRINCIPAL
  // ========================================================================

  /**
   * Inicia sesión con email y contraseña
   * @param {SignInRequest} data - Credenciales de usuario
   * @param {string} data.email - Email del usuario
   * @param {string} data.password - Contraseña del usuario
   * @returns {Promise<SignInResponse>} Datos del usuario y token de acceso
   * @throws {Error} Error si las credenciales son inválidas
   */
  async signIn(data: SignInRequest): Promise<SignInResponse> {
    const { execute } = useApiFetch<SignInResponse>(
      API_ENDPOINTS.auth.signIn, 
      { immediate: false }
    )
    return execute({ 
      query: { 
        email: data.email, 
        password: data.password 
      } 
    })
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param {RegisterRequest} data - Datos del nuevo usuario
   * @param {string} data.name - Nombre del usuario
   * @param {string} data.email - Email del usuario
   * @param {string} data.password - Contraseña del usuario
   * @param {string} data.confirmPassword - Confirmación de contraseña
   * @returns {Promise<RegisterResponse>} Datos del usuario creado y token
   * @throws {Error} Error si el email ya existe o datos inválidos
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const { execute } = useApiPost<RegisterResponse>(
      API_ENDPOINTS.user.create,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  // ========================================================================

  /**
   * Envía email con token para recuperación de contraseña
   * @param {ForgotPasswordRequest} data - Datos para recuperación
   * @param {string} data.email - Email del usuario
   * @returns {Promise<ForgotPasswordResponse>} Confirmación de envío
   * @throws {Error} Error si el email no existe
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const { execute } = useApiFetch<ForgotPasswordResponse>(
      API_ENDPOINTS.user.sendEmailTokenResetPassword, 
      { method: 'GET', immediate: false }
    )
    return execute({ 
      query: { 
        email: data.email 
      } 
    })
  }

  /**
   * Restablece la contraseña usando token de recuperación
   * @param {ResetPasswordRequest} data - Datos para reset
   * @param {string} data.email - Email del usuario
   * @param {string} data.token - Token de recuperación
   * @param {string} data.newPassword - Nueva contraseña
   * @returns {Promise<ResetPasswordResponse>} Confirmación de cambio
   * @throws {Error} Error si el token es inválido o expirado
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { execute } = useApiPost<ResetPasswordResponse>(
      API_ENDPOINTS.auth.resetPassword,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Restablece contraseña con signin inmediato
   * @param {ResetPasswordSignInRequest} data - Datos para reset con login
   * @param {string|null} data.email - Email del usuario
   * @param {string|null} data.password - Contraseña actual
   * @param {string|null} data.newPassword - Nueva contraseña
   * @returns {Promise<ResetPasswordSignInResponse>} Confirmación y datos de sesión
   * @throws {Error} Error si las credenciales son inválidas
   */
  async resetPasswordSignIn(data: ResetPasswordSignInRequest): Promise<ResetPasswordSignInResponse> {
    const { execute } = useApiPost<ResetPasswordSignInResponse>(
      API_ENDPOINTS.auth.resetPasswordSignIn,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS DE VALIDACIÓN
  // ========================================================================

  /**
   * Confirma el acceso con token de validación
   * @param {ConfirmTokenAccessRequest} data - Token de confirmación
   * @param {string} data.token - Token de acceso a validar
   * @returns {Promise<ConfirmTokenAccessResponse>} Confirmación de validez
   * @throws {Error} Error si el token es inválido
   */
  async confirmTokenAccess(data: ConfirmTokenAccessRequest): Promise<ConfirmTokenAccessResponse> {
    const { execute } = useApiPost<ConfirmTokenAccessResponse>(
      API_ENDPOINTS.auth.confirmTokenAccess,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Confirma el acceso con token de validación para email alternativo
   * @param {ConfirmTokenAccessEmailAlternativeRequest} data - Token de confirmación para email alternativo
   * @param {string} data.email - Email del usuario
   * @param {number} data.code - Código de confirmación
   * @returns {Promise<ConfirmTokenAccessResponse>} Confirmación de validez
   * @throws {Error} Error si el token es inválido
   */
  async confirmTokenAccessEmailAlternative(data: { email: string, code: number }): Promise<ConfirmTokenAccessResponse> {
    const { execute } = useApiPost<ConfirmTokenAccessResponse>(
      API_ENDPOINTS.auth.confirmTokenAccessEmailAlternative,
      { immediate: false }
    )
    return execute({ body: data })
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de autenticación
 * @type {AuthService}
 */
export const authService = new AuthService() 