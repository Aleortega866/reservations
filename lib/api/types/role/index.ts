import type { ApiResponse } from '../common'

// Tipos base
export interface Role {
  id: string
  name: string
  status: string
  roleTypeId: number
  roleType: string | null
  enable: boolean
  description: string
  dateModified: string
}

export interface RoleUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
}

// Tipos para requests
export interface CreateRoleRequest {
  name: string
  description: string
  roleTypeId: number
  enable: boolean
  userModifiedId: number
}

export interface UpdateRoleRequest {
  id: string
  name?: string
  description?: string
  enable: boolean
  userModifiedId: number
  roleTypeId?: number
}

export interface DeleteRoleRequest {
  id: string
}

export interface AddUserToRoleRequest {
  email: string
  roleName: string
  userModifiedId: number
}

export interface DeleteRoleUserRequest {
  userId: string
  roleId: string
}

// Tipos para responses
export interface RoleResponse extends ApiResponse<Role> {}
export interface RoleListResponse extends ApiResponse<Role[]> {}
export interface RoleUserListResponse extends ApiResponse<RoleUser[]> {}
