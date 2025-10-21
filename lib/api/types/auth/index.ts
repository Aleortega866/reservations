

// ============================================================================
// INTERFACES DE AUTENTICACIÓN
// ============================================================================

// Tipos para Sign In
export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  code: number
  isValid: boolean
  comments: string
  response: {
    id: string
    userId: number
    userName: string
    email: string
    phoneNumber: string
    name: string
    paternalLastName: string
    maternalLastName: string
    genderId: number
    gender: string
    statusId: number
    status: string
    enableMarketing: boolean
    enableUsePersonalData: boolean
    enable: boolean
    userTypeId: number
    userType: string
    dateBirth: string
  }
  token: string
}

// Tipos para Registro
export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResponse {
  user: {
    id: string
    email: string
    name: string
  }
  token: string
}

// Tipos para Forgot Password
export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

// Tipos para Reset Password
export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

// Tipos para Confirm Token Access
export interface ConfirmTokenAccessRequest {
  token: string
}

export interface ConfirmTokenAccessResponse {
  code: number
  isValid: boolean
  comments: string
  response: string
  token: string
}

// Tipos para Reset Password Sign In
export interface ResetPasswordSignInRequest {
  email: string | null
  password: string | null
  newPassword: string | null
}

export interface ResetPasswordSignInResponse {
  message: string
}
