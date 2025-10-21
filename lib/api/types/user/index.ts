
// ============================================================================
// INTERFACES DE USUARIO
// ============================================================================

// Tipo principal de Usuario (completo de la API)
export interface User {
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

// Tipos para crear usuario
export interface CreateUserRequest {
  userName: string
  email: string
  password: string
  phoneNumber: string
  name: string
  paternalLastName: string
  maternalLastName: string
  genderId: number
  userTypeId: number
  dateBirth: string
  enableMarketing: boolean
  enableUsePersonalData: boolean
  enable?: boolean
  userModifiedId?: number
}

// Tipos para actualizar usuario
export interface UpdateUserRequest {
  id: number
  email?: string | null
  newEmail?: string | null
  userName?: string | null
  phoneNumber?: string | null
  name?: string | null
  paternalLastName?: string | null
  maternalLastName?: string | null
  statusId?: number
  genderId?: number
  enableMarketing?: boolean
  enableUsePersonalData?: boolean
  enable?: boolean
  userModifiedId?: number
  userTypeId?: number
  dateBirth?: string
}

// Tipos para emails alternativos
export interface AlternativeEmail {
  id: string
  userId: string
  email: string
  isVerified: boolean
  isPrimary?: boolean
}

export interface AddAlternativeEmailRequest {
  userId: string | null
  email: string | null
  statusId: number
  enable: boolean
  userModifiedId: number
}

// Tipos para permisos de usuario
export interface UserPermission {
  id: string
  userId: string
  permissionId: string
  permissionName: string
}

export interface AddUserPermissionRequest {
  userId: string
  permissionId: string
}

// Tipos para actualizar email primario
export interface UpdateUserEmailPrimaryRequest {
  userId: string | null
  email: string | null
  userModifiedId: number
}
