import type { ApiResponse } from '../common'

// Tipos de estado de asistencia
export type AttendanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

// Tipos base
export interface AttendanceReservation {
  id: string
  userId: string
  reservationId: string
  visitDate: string
  timeSlot: string
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Tipos para requests
export interface AddAttendanceReservationRequest {
  userId: string
  reservationId: string
  visitDate: string
  timeSlot: string
  notes?: string
}

export interface UpdateAttendanceReservationRequest {
  id: string
  status?: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  notes?: string
}

export interface UpdateVisitStatusRequest {
  reservationId: string
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
}

// Tipos para filtros
export interface AttendanceFilters {
  userId?: string
  reservationId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

// Tipos para responses
export interface AttendanceResponse extends ApiResponse<AttendanceReservation> {}
export interface AttendanceListResponse extends ApiResponse<AttendanceReservation[]> {}
