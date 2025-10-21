import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE DOCUMENTOS
// ============================================================================

export interface ReservationDocument {
  id: string
  reservationId: string
  fileName: string
  fileSize: number
  fileType: string
  description?: string
  uploadedAt: string
  uploadedBy: string
}

export interface UploadReservationDocumentRequest {
  reservationId: string
  file: File
  description?: string
}

export interface UpdateReservationDocumentRequest {
  id: string
  description?: string
}

export interface DocumentFilters {
  reservationId?: string
  fileType?: string
  uploadedBy?: string
}

// Tipos de respuesta
export interface DocumentResponse extends ApiResponse<ReservationDocument> {}
export interface DocumentListResponse extends ApiResponse<ReservationDocument[]> {}
