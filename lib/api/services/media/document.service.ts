// ============================================================================
// DOCUMENT SERVICE - Servicio de Gestión de Documentos
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete, apiClient } from '../../core/useFetch'
import { API_ENDPOINTS, API_CONFIG } from '../../core/config'
import type {
  ReservationDocument,
  UploadReservationDocumentRequest,
  UpdateReservationDocumentRequest
} from '../../types/media'

/**
 * Servicio de gestión de documentos que maneja upload, download y CRUD de documentos de reservación
 * Nota: Los métodos de upload usan multipart/form-data en lugar de application/json
 * @class DocumentService
 */
export class DocumentService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todos los documentos de una reservación específica
   * @param {string} reservationId - ID de la reservación
   * @returns {Promise<ReservationDocument[]>} Lista de documentos de la reservación
   * @throws {Error} Error si no se pueden cargar los documentos
   */
  async getReservationDocuments(reservationId: string): Promise<ReservationDocument[]> {
    const { execute } = useApiFetch<ReservationDocument[]>(
      `${API_ENDPOINTS.document.getReservationDocuments}?reservationId=${reservationId}`,
      { immediate: false }
    )
    return execute()
  }

  /**
   * Obtiene el archivo binario de un documento por su ID
   * @param {string} fileId - ID del archivo a obtener
   * @returns {Promise<Blob>} Archivo en formato blob
   * @throws {Error} Error si el archivo no existe o no se puede descargar
   */
  async getFileBinary(fileId: string): Promise<Blob> {
    // Para archivos binarios, necesitamos hacer la petición directamente
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.document.getFileBinary}?fileId=${fileId}`
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }

  // ========================================================================
  // MÉTODOS CRUD - POST (CREACIÓN) - MULTIPART/FORM-DATA
  // ========================================================================

  /**
   * Sube un documento para una reservación usando multipart/form-data
   * @param {UploadReservationDocumentRequest} data - Datos del documento a subir
   * @param {string} data.reservationId - ID de la reservación
   * @param {File} data.file - Archivo a subir
   * @param {string} [data.description] - Descripción opcional del documento
   * @returns {Promise<ReservationDocument>} Información del documento subido
   * @throws {Error} Error si falla la subida del documento
   */
  async uploadReservationDocument(data: UploadReservationDocumentRequest): Promise<ReservationDocument> {
    const formData = new FormData()
    formData.append('reservationId', data.reservationId)
    formData.append('file', data.file)
    if (data.description) {
      formData.append('description', data.description)
    }

    // Usar apiClient directamente para multipart/form-data (no composables)
    const response = await apiClient.post<ReservationDocument>(API_ENDPOINTS.document.uploadReservation, formData)
    return response.data
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN)
  // ========================================================================

  /**
   * Actualiza los metadatos de un documento de reservación
   * @param {UpdateReservationDocumentRequest} data - Nuevos datos del documento
   * @returns {Promise<ReservationDocument>} Información del documento actualizado
   * @throws {Error} Error si el documento no existe o datos inválidos
   */
  async updateReservationDocument(data: UpdateReservationDocumentRequest): Promise<ReservationDocument> {
    const { execute } = useApiPut<ReservationDocument>(
      API_ENDPOINTS.document.updateReservation,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina un documento de reservación
   * @param {string} id - ID del documento a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si el documento no existe
   */
  async deleteReservationDocument(id: string): Promise<void> {
    const { execute } = useApiDelete(
      `${API_ENDPOINTS.document.deleteReservation}?id=${id}`,
      { immediate: false }
    )
    return execute()
  }

  // ========================================================================
  // MÉTODOS UTILITARIOS
  // ========================================================================

  /**
   * Descarga un documento y lo guarda en el dispositivo del usuario
   * @param {string} fileId - ID del archivo a descargar
   * @param {string} fileName - Nombre del archivo para la descarga
   * @returns {Promise<{success: boolean; error?: string}>} Resultado de la descarga
   * @throws {Error} Error si no se puede descargar el documento
   */
  async downloadDocument(fileId: string, fileName: string) {
    try {
      const blob = await this.getFileBinary(fileId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de documentos
 * @type {DocumentService}
 */
export const documentService = new DocumentService() 