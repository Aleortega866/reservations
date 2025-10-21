// ============================================================================
// TIPOS E INTERFACES PARA DOCUMENTOS DE RESERVACIÓN
// ============================================================================

import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES PARA DOCUMENTOS DE RESERVACIÓN
// ============================================================================

/**
 * Documento de reservación
 */
export interface ReservationDocument {
  id?: number
  documentId?: number
  fileName: string
  filePath?: string
  fileSize?: number
  sizeBytes?: number
  uploadedAt?: string
  createdAt?: string
  userModifiedId?: number
  reservationId?: number
  originalFileName?: string
  contentType?: string
  extension?: string
}

/**
 * Solicitud para subir un documento
 */
export interface UploadReservationDocumentRequest {
  file: File
  userModifiedId: number
  reservationId: number
}

/**
 * Solicitud para obtener todos los documentos de una reservación
 */
export interface GetAllReservationDocumentsRequest {
  userModifiedId: number
  reservationId: number
}

/**
 * Solicitud para obtener un documento específico
 */
export interface GetReservationDocumentRequest {
  documentId: number
  userModifiedId: number
}

/**
 * Solicitud para eliminar un documento
 */
export interface DeleteReservationDocumentRequest {
  documentId: number
  userModifiedId: number
}

// ============================================================================
// RESPONSES DE LA API
// ============================================================================

/**
 * Respuesta al subir un documento
 */
export interface UploadReservationDocumentResponse extends ApiResponse<ReservationDocument> {}

/**
 * Respuesta al obtener todos los documentos
 */
export interface GetAllReservationDocumentsResponse extends ApiResponse<ReservationDocument[]> {}

/**
 * Respuesta al obtener un documento específico
 */
export interface GetReservationDocumentResponse extends ApiResponse<ReservationDocument> {}

/**
 * Respuesta al eliminar un documento
 */
export interface DeleteReservationDocumentResponse extends ApiResponse<void> {}

// ============================================================================
// TIPOS PARA EL FRONTEND
// ============================================================================

/**
 * Documento local antes de subir al servidor
 */
export interface LocalReservationDocument {
  id?: string // ID temporal local
  name: string
  file: File
  url: string // URL.createObjectURL(file)
  size: number
  uploaded?: boolean // Si ya fue subido al servidor
  serverId?: number // ID del servidor después de subir
}

/**
 * Estado de carga de documentos
 */
export interface DocumentUploadState {
  isUploading: boolean
  uploadProgress: number
  error: string | null
  success: boolean
}

/**
 * Filtros para documentos
 */
export interface ReservationDocumentFilters {
  reservationId?: number
  userModifiedId?: number
  fileName?: string
  uploadedAfter?: string
  uploadedBefore?: string
}
