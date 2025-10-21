export interface ErrorResponse {
  code?: string
  message?: string
  response?: {
    status?: number
    data?: any
  }
}

export const useErrorHandler = () => {
  const getErrorMessage = (error: ErrorResponse | null): string => {
    if (!error) return ''
    
    // Si es un error de red
    if (error.code === 'NETWORK_ERROR') {
      return 'Error de conexión. Verifica tu conexión a internet.'
    }
    
    // Si es un error de timeout
    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Intenta nuevamente.'
    }
    
    // Si es un error del servidor
    if (error.response?.status === 400) {
      return 'Los datos proporcionados no son válidos. Verifica la información.'
    }
    
    if (error.response?.status === 401) {
      return 'Credenciales inválidas. Verifica tu correo y contraseña.'
    }
    
    if (error.response?.status === 403) {
      return 'Tu cuenta ha sido bloqueada. Contacta al administrador.'
    }
    
    if (error.response?.status === 404) {
      return 'El recurso solicitado no fue encontrado.'
    }
    
    if (error.response?.status === 409) {
      return 'El recurso ya existe. Intenta con otra información.'
    }
    
    if (error.response?.status === 429) {
      return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.'
    }
    
    if (error.response?.status === 500) {
      return 'Error interno del servidor. Intenta nuevamente más tarde.'
    }
    
    // Error genérico
    return error.message || 'Ocurrió un error inesperado. Intenta nuevamente.'
  }

  const getAuthErrorMessage = (error: ErrorResponse | null): string => {
    if (!error) return ''
    
    // Errores específicos de autenticación
    if (error.response?.status === 401) {
      return 'Credenciales inválidas. Verifica tu correo y contraseña.'
    }
    
    if (error.response?.status === 403) {
      return 'Tu cuenta ha sido bloqueada. Contacta al administrador.'
    }
    
    if (error.response?.status === 404) {
      return 'El correo electrónico no está registrado en nuestro sistema.'
    }
    
    if (error.response?.status === 409) {
      return 'El nombre de usuario ya está en uso. Intenta con otro.'
    }
    
    if (error.response?.status === 429) {
      return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.'
    }
    
    // Usar el mensaje genérico si no es un error específico de auth
    return getErrorMessage(error)
  }

  const getPasswordResetErrorMessage = (error: ErrorResponse | null): string => {
    if (!error) return ''
    
    // Errores específicos de reset de contraseña
    if (error.response?.status === 400) {
      return 'El token de recuperación es inválido o ha expirado.'
    }
    
    if (error.response?.status === 404) {
      return 'El token de recuperación no fue encontrado.'
    }
    
    // Usar el mensaje genérico si no es un error específico de reset
    return getErrorMessage(error)
  }

  return {
    getErrorMessage,
    getAuthErrorMessage,
    getPasswordResetErrorMessage
  }
} 