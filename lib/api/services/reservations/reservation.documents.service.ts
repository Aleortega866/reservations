// ============================================================================
// RESERVATION DOCUMENTS SERVICE - Servicio de Gestión de Documentos de Reservación
// ============================================================================

import { useApiFetch, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS, API_CONFIG } from '../../core/config'
import { isValidMimeType, getFormattedAllowedTypes } from '../../config/document-types'
import axios from 'axios'
import type { 
  UploadReservationDocumentRequest,
  GetAllReservationDocumentsRequest,
  GetReservationDocumentRequest,
  DeleteReservationDocumentRequest,
  UploadReservationDocumentResponse,
  GetAllReservationDocumentsResponse,
  GetReservationDocumentResponse,
  DeleteReservationDocumentResponse,
  ReservationDocument
} from '../../types/reservation/documents'

// ============================================================================
// CONFIGURACIÓN ESPECÍFICA PARA MULTIPART/FORM-DATA
// ============================================================================

/**
 * Instancia específica de axios para FormData sin Content-Type por defecto
 * Utilizada para upload de archivos de documentos que requieren multipart/form-data
 */
const formDataClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout
})

// Interceptor para agregar token automáticamente a FormData requests
formDataClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  
  // Asegurar que no se establezca Content-Type manualmente para FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

// Interceptor para debugging de respuestas FormData
formDataClient.interceptors.response.use(
  (response) => {
    console.log('Document upload response success:', response.data)
    return response
  },
  (error) => {
    console.error('Document upload response error:', error.response?.data)
    console.error('Document upload response status:', error.response?.status)
    console.error('Document upload response headers:', error.response?.headers)
    return Promise.reject(error)
  }
)

/**
 * Servicio especializado para la gestión de documentos de reservación
 * Maneja la subida, descarga y eliminación de documentos asociados a reservaciones
 * @class ReservationDocumentsService
 */
export class ReservationDocumentsService {
  
  // ========================================================================
  // MÉTODOS PARA SUBIR DOCUMENTOS
  // ========================================================================

  /**
   * Sube un documento a una reservación
   * POST /api/ReservationDocuments/UploadAsync
   * @param {UploadReservationDocumentRequest} data - Datos del documento a subir
   * @returns {Promise<ReservationDocument>} Documento subido
   * @throws {Error} Error si el archivo es inválido o hay problemas de conexión
   */
  async uploadDocument(data: UploadReservationDocumentRequest): Promise<ReservationDocument> {
    const formData = new FormData()
    
    // Agregar el archivo con el nombre correcto que espera la API
    formData.append('file', data.file)
    formData.append('userModifiedId', data.userModifiedId.toString())
    formData.append('reservationId', data.reservationId.toString())

    // Debug: Log del FormData
    console.log('UploadDocument FormData contents:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type
        })
      } else {
        console.log(`${key}:`, value)
      }
    }
    
    // Debug: Verificar que el archivo sea válido
    console.log('File validation:', {
      isValidFile: data.file instanceof File,
      fileName: data.file.name,
      fileSize: data.file.size,
      fileType: data.file.type
    })

    // Usar formDataClient específico para FormData (no composables para multipart)
    const response = await formDataClient.post<UploadReservationDocumentResponse>(
      API_ENDPOINTS.reservation.documents.upload, 
      formData
    )
    
    console.log('🔍 Full server response:', response.data)
    console.log('🔍 Response.response field:', response.data.response)
    
    return response.data.response
  }

  // ========================================================================
  // MÉTODOS PARA OBTENER DOCUMENTOS
  // ========================================================================

  /**
   * Obtiene todos los documentos de una reservación
   * GET /api/ReservationDocuments/GetAllAsync
   * @param {GetAllReservationDocumentsRequest} params - Parámetros de consulta
   * @returns {Promise<ReservationDocument[]>} Lista de documentos
   * @throws {Error} Error si la reservación no existe o no se pueden cargar los documentos
   */
  async getAllDocuments(params: GetAllReservationDocumentsRequest): Promise<ReservationDocument[]> {
    const { execute } = useApiFetch<GetAllReservationDocumentsResponse>(
      API_ENDPOINTS.reservation.documents.getAll,
      { immediate: false }
    )
    
    const result = await execute({ 
      query: {
        UserModifiedId: params.userModifiedId,
        ReservationId: params.reservationId,
      }
    })
    
    console.log('🔍 getAllDocuments result:', result)
    console.log('🔍 getAllDocuments result.response:', result.response)
    
    return result.response || []
  }

  /**
   * Obtiene un documento específico
   * GET /api/ReservationDocuments/GetAsync
   * @param {GetReservationDocumentRequest} params - Parámetros de consulta
   * @returns {Promise<ReservationDocument>} Documento solicitado
   * @throws {Error} Error si el documento no existe
   */
  async getDocument(params: GetReservationDocumentRequest): Promise<ReservationDocument> {
    const { execute } = useApiFetch<GetReservationDocumentResponse>(
      API_ENDPOINTS.reservation.documents.get,
      { immediate: false }
    )
    
    const result = await execute({ 
      query: {
        DocumentId: params.documentId,
        UserModifiedId: params.userModifiedId,
      }
    })
    return result.response
  }

  // ========================================================================
  // MÉTODOS PARA ELIMINAR DOCUMENTOS
  // ========================================================================

  /**
   * Elimina un documento
   * DELETE /api/ReservationDocuments/DeleteAsync
   * @param {DeleteReservationDocumentRequest} params - Parámetros de eliminación
   * @returns {Promise<void>} Sin retorno
   * @throws {Error} Error si el documento no existe o no se puede eliminar
   */
  async deleteDocument(params: DeleteReservationDocumentRequest): Promise<void> {
    // Debug: Log de parámetros de eliminación
    console.log('DeleteDocument parameters:', {
      documentId: params.documentId,
      userModifiedId: params.userModifiedId
    })
    
    const { execute } = useApiDelete<DeleteReservationDocumentResponse>(
      API_ENDPOINTS.reservation.documents.delete,
      { immediate: false }
    )
    
    const queryParams = {
      DocumentId: params.documentId,
      UserModifiedId: params.userModifiedId,
    }
    
    console.log('DeleteDocument query params:', queryParams)
    
    await execute({ query: queryParams })
  }

  // ========================================================================
  // MÉTODOS AUXILIARES
  // ========================================================================

  /**
   * Verifica si una reservación tiene documentos
   * @param {number} reservationId - ID de la reservación
   * @param {number} userModifiedId - ID del usuario
   * @returns {Promise<boolean>} True si tiene documentos
   */
  async hasDocuments(reservationId: number, userModifiedId: number): Promise<boolean> {
    try {
      const documents = await this.getAllDocuments({ reservationId, userModifiedId })
      return documents && documents.length > 0
    } catch (error) {
      console.warn('Error al verificar documentos de la reservación:', error)
      return false
    }
  }

  /**
   * Obtiene el número de documentos de una reservación
   * @param {number} reservationId - ID de la reservación
   * @param {number} userModifiedId - ID del usuario
   * @returns {Promise<number>} Número de documentos
   */
  async getDocumentCount(reservationId: number, userModifiedId: number): Promise<number> {
    try {
      const documents = await this.getAllDocuments({ reservationId, userModifiedId })
      return documents ? documents.length : 0
    } catch (error) {
      console.warn('Error al contar documentos de la reservación:', error)
      return 0
    }
  }

  /**
   * Valida un archivo antes de subirlo
   * @param {File} file - Archivo a validar
   * @returns {Promise<{valid: boolean, error?: string}>} Resultado de la validación
   */
  async validateFile(file: File): Promise<{valid: boolean, error?: string}> {
    // Validar tipo de archivo usando la configuración centralizada
    if (!isValidMimeType(file.type)) {
      return { 
        valid: false, 
        error: `Tipo de archivo no permitido. Tipos aceptados: ${getFormattedAllowedTypes()}` 
      }
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo no puede ser mayor a 10MB' }
    }

    // Validar nombre
    if (!file.name || file.name.trim().length === 0) {
      return { valid: false, error: 'El archivo debe tener un nombre válido' }
    }

    return { valid: true }
  }

  /**
   * Formatea el tamaño de archivo para mostrar
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} Tamaño formateado
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Genera un nombre único para el archivo
   * @param {string} originalName - Nombre original del archivo
   * @returns {string} Nombre único
   */
  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '')
    
    return `${nameWithoutExtension}_${timestamp}_${random}.${extension}`
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de documentos de reservación
 * @type {ReservationDocumentsService}
 */
export const reservationDocumentsService = new ReservationDocumentsService()
