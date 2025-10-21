// ============================================================================
// TIPOS COMUNES Y COMPARTIDOS DE LA API
// ============================================================================

// Tipos de respuesta base de la API
export interface ApiResponse<T = any> {
  code: number
  isValid: boolean
  comments: string
  response: T
  token: string
}

// Tipos de error de la API
export interface ApiErrorResponse {
  code: number
  isValid: boolean
  comments: string
  response: string
  token: string
}

export interface ApiError {
  message: string
  code?: number
  details?: any
}

// Tipo para la información completa del usuario autenticado (incluye datos JWT)
export interface AuthenticatedUser {
  user: any // Se usa any porque puede venir de diferentes fuentes
  token: string
  permissions: string[]
  role: string
  exp: number
  iss: string
  aud: string
}
