import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE FORMULARIOS
// ============================================================================

export interface FormType {
  id: number
  description: string
  enable: boolean
}

export interface UpdateFormTypeEnableStatusResponse {
  code: number
  isValid: boolean
  comments: string
  response: boolean | null
  token: string
}

export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox'
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: string
}

export interface CreateFormTypeRequest {
  name: string
  description: string
  type: 'general' | 'escolar' | 'empresarial' | 'curso-verano' | 'patrocinio'
  fields: Omit<FormField, 'id'>[]
}

export interface UpdateFormTypeRequest {
  id: string
  name?: string
  description?: string
  isActive?: boolean
  type?: 'general' | 'escolar' | 'empresarial' | 'curso-verano' | 'patrocinio'
  fields?: Omit<FormField, 'id'>[]
}

export interface FormTypeFilters {
  type?: string
  isActive?: boolean
  name?: string
}

// ============================================================================
// INTERFACES DE TIME SLOTS
// ============================================================================

export interface TimeSlot {
  id: number
  time: string
}

// Tipos de respuesta
export interface FormTypeResponse extends ApiResponse<FormType> {}
export interface FormTypeListResponse extends ApiResponse<FormType[]> {}
export interface TimeSlotsResponse extends ApiResponse<TimeSlot[]> {}