// ============================================================================
// DOCUMENT REQUEST SERVICE - Servicio de Gestión de Solicitudes de Documentos
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  DocumentRequest,
  DocumentRequestListItem,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  EnableDisableDocumentRequestParams,
  GetAllDocumentRequestsResponse,
  GetDocumentRequestResponse,
  CreateDocumentRequestResponse,
  UpdateDocumentRequestResponse,
  EnableDisableDeleteResponse
} from '../../types/document-request'

/**
 * Servicio de gestión de solicitudes de documentos que maneja CRUD y habilitación/deshabilitación
 * @class DocumentRequestService
 */
export class DocumentRequestService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todas las solicitudes de documentos
   * @returns {Promise<DocumentRequestListItem[]>} Lista de solicitudes de documentos
   * @throws {Error} Error si no se pueden cargar las solicitudes
   */
  async getAll(): Promise<DocumentRequestListItem[]> {
    const { execute } = useApiFetch<GetAllDocumentRequestsResponse>(
      API_ENDPOINTS.form.documentRequest.getAll, 
      { immediate: false }
    )
    const result = await execute()
    return result.response || []
  }

  /**
   * Obtiene una solicitud de documento específica por ID
   * @param {number} id - ID de la solicitud de documento
   * @returns {Promise<DocumentRequest | null>} Solicitud encontrada o null
   * @throws {Error} Error si no se puede cargar la solicitud
   */
  async getById(id: number): Promise<DocumentRequest | null> {
    const { execute } = useApiFetch<GetDocumentRequestResponse>(
      API_ENDPOINTS.form.documentRequest.getById, 
      { immediate: false }
    )
    const result = await execute({ query: { Id: id } })
    return result.response || null
  }

  // ========================================================================
  // MÉTODOS CRUD - POST (CREACIÓN)
  // ========================================================================

  /**
   * Crea una nueva solicitud de documento
   * @param {CreateDocumentRequest} payload - Datos de la nueva solicitud
   * @returns {Promise<number>} ID de la solicitud creada
   * @throws {Error} Error si los datos son inválidos
   */
  async create(payload: CreateDocumentRequest): Promise<number> {
    const { execute } = useApiPost<CreateDocumentRequestResponse>(
      API_ENDPOINTS.form.documentRequest.create,
      { immediate: false }
    )
    const result = await execute({ body: payload })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN)
  // ========================================================================

  /**
   * Actualiza una solicitud de documento existente
   * @param {UpdateDocumentRequest} payload - Nuevos datos de la solicitud
   * @returns {Promise<number>} ID de la solicitud actualizada
   * @throws {Error} Error si la solicitud no existe o datos inválidos
   */
  async update(payload: UpdateDocumentRequest): Promise<number> {
    const { execute } = useApiPut<UpdateDocumentRequestResponse>(
      API_ENDPOINTS.form.documentRequest.update,
      { immediate: false }
    )
    const result = await execute({ body: payload })
    return result.response
  }

  /**
   * Habilita una solicitud de documento
   * @param {EnableDisableDocumentRequestParams} params - Parámetros para habilitar
   * @returns {Promise<boolean>} True si se habilitó correctamente
   * @throws {Error} Error si la solicitud no existe
   */
  async enable(params: EnableDisableDocumentRequestParams): Promise<boolean> {
    const { execute } = useApiPut<EnableDisableDeleteResponse>(
      API_ENDPOINTS.form.documentRequest.enable,
      { immediate: false }
    )
    const result = await execute({ query: params })
    return (result.code === 200 && result.isValid) || result.response === 1
  }

  /**
   * Deshabilita una solicitud de documento
   * @param {EnableDisableDocumentRequestParams} params - Parámetros para deshabilitar
   * @returns {Promise<boolean>} True si se deshabilitó correctamente
   * @throws {Error} Error si la solicitud no existe
   */
  async disable(params: EnableDisableDocumentRequestParams): Promise<boolean> {
    const { execute } = useApiPut<EnableDisableDeleteResponse>(
      API_ENDPOINTS.form.documentRequest.disable,
      { immediate: false }
    )
    const result = await execute({ query: params })
    return (result.code === 200 && result.isValid) || result.response === 1
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina una solicitud de documento
   * @param {EnableDisableDocumentRequestParams} params - Parámetros para eliminar
   * @returns {Promise<boolean>} True si se eliminó correctamente
   * @throws {Error} Error si la solicitud no existe
   */
  async delete(params: EnableDisableDocumentRequestParams): Promise<boolean> {
    const { execute } = useApiDelete<EnableDisableDeleteResponse>(
      API_ENDPOINTS.form.documentRequest.delete,
      { immediate: false }
    )
    const result = await execute({ body: params })
    return (result.code === 200 && result.isValid) || result.response === 1
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de solicitudes de documentos
 * @type {DocumentRequestService}
 */
export const documentRequestService = new DocumentRequestService()
