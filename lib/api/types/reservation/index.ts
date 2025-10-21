import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE RESERVACIONES
// ============================================================================

export interface Reservation {
  id: string
  userId: string
  schoolId: string
  schoolName: string
  visitDate: string
  timeSlot: string
  type: 'general' | 'escolar' | 'empresarial' | 'curso-verano'
  description: string
  participants: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface CreateReservationRequest {
  userId: string
  schoolId: string
  visitDate: string
  timeSlot: string
  type: 'general' | 'escolar' | 'empresarial' | 'curso-verano'
  description: string
  participants: number
}

export interface UpdateReservationRequest {
  id: string
  visitDate?: string
  timeSlot?: string
  type?: 'general' | 'escolar' | 'empresarial' | 'curso-verano'
  description?: string
  participants?: number
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

export interface School {
  id: string
  name: string
  address: string
  contactPerson: string
  phone: string
  email: string
  isActive: boolean
}

export interface ReservationFilters {
  userId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  type?: string
}

// Tipos de respuesta
export interface ReservationResponse extends ApiResponse<Reservation> {}
export interface ReservationListResponse extends ApiResponse<Reservation[]> {}
export interface SchoolListResponse extends ApiResponse<School[]> {}

// Re-exportar tipos de reservaciones empresariales
export * from './company'

// Re-exportar tipos de costos de reservaciones
export * from './cost'

// ============================================================================
// INTERFACES PARA QR DE RESERVACIONES
// ============================================================================

/**
 * Respuesta de la API para obtener el QR de una reservación
 */
export interface GetReservationQRResponse {
  code: number
  isValid: boolean
  qrCode: string
  qrCodeUrl?: string
  reservationId: number
  message?: string
  comments?: string
}