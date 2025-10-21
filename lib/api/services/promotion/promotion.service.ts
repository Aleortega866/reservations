
// ============================================================================
// PROMOTION SERVICE - Servicio de Gestión de Promociones
// ============================================================================

import { useApiPost, useApiFetch, useApiPut, useApiDelete, useApiPatch } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  CreateLinkingCodeRequest,
  UpdateLinkingCodeRequest,
  LinkingCode,
  Promotion,
  UpdatePromotionRequest,
  ActivateLinkingCodeRequest
} from '../../types/promotion'

/**
 * Servicio de gestión de promociones que maneja códigos de vinculación y promociones
 * @class PromotionService
 */
export class PromotionService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todos los códigos de vinculación
   * @returns {Promise<LinkingCode[]>} Lista de códigos de vinculación
   * @throws {Error} Error si no se pueden cargar los códigos
   */
  async getAllLinkingCodes(): Promise<LinkingCode[]> {
    const { execute } = useApiFetch<{ response: LinkingCode[] }>(
      API_ENDPOINTS.promotion.getAllLinkingCodes,
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  /**
   * Obtiene un código de vinculación específico por ID
   * @param {string} id - ID del código de vinculación
   * @returns {Promise<LinkingCode | null>} Código de vinculación encontrado o null
   * @throws {Error} Error si no se puede cargar el código
   */
  async getLinkingCode(id: string): Promise<LinkingCode | null> {
    const { execute } = useApiFetch<{ response: LinkingCode }>(
      `${API_ENDPOINTS.promotion.getLinkingCode}?id=${id}`,
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  /**
   * Obtiene todas las promociones del sistema
   * @returns {Promise<Promotion[]>} Lista de promociones
   * @throws {Error} Error si no se pueden cargar las promociones
   */
  async getAllPromotions(): Promise<Promotion[]> {
    const { execute } = useApiFetch<{ response: Promotion[] }>(
      API_ENDPOINTS.promotion.getAll,
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  /**
   * Obtiene una promoción específica por ID
   * @param {string} id - ID de la promoción
   * @returns {Promise<Promotion | null>} Promoción encontrada o null
   * @throws {Error} Error si no se puede cargar la promoción
   */
  async getPromotionById(id: string): Promise<Promotion | null> {
    const promotions = await this.getAllPromotions()
    return promotions.find(p => p.id === id) || null
  }

  // ========================================================================
  // MÉTODOS CRUD - POST (CREACIÓN)
  // ========================================================================

  /**
   * Crea un nuevo código de vinculación
   * @param {CreateLinkingCodeRequest} request - Datos del nuevo código
   * @returns {Promise<LinkingCode>} Información del código creado
   * @throws {Error} Error si los datos son inválidos
   */
  async createLinkingCode(request: CreateLinkingCodeRequest): Promise<LinkingCode> {
    const { execute } = useApiPost<{ response: LinkingCode }>(
      API_ENDPOINTS.promotion.createLinkingCode,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN)
  // ========================================================================

  /**
   * Actualiza un código de vinculación existente
   * @param {UpdateLinkingCodeRequest} request - Nuevos datos del código
   * @returns {Promise<LinkingCode>} Información del código actualizado
   * @throws {Error} Error si el código no existe o datos inválidos
   */
  async updateLinkingCode(request: UpdateLinkingCodeRequest): Promise<LinkingCode> {
    const { execute } = useApiPut<{ response: LinkingCode }>(
      API_ENDPOINTS.promotion.updateLinkingCode,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  /**
   * Actualiza una promoción existente
   * @param {UpdatePromotionRequest} request - Nuevos datos de la promoción
   * @returns {Promise<Promotion>} Información de la promoción actualizada
   * @throws {Error} Error si la promoción no existe o datos inválidos
   */
  async updatePromotion(request: UpdatePromotionRequest): Promise<Promotion> {
    const { execute } = useApiPut<{ response: Promotion }>(
      API_ENDPOINTS.promotion.update,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  /**
   * Archiva una promoción (soft delete)
   * @param {string} id - ID de la promoción a archivar
   * @returns {Promise<void>} Confirmación de archivado
   * @throws {Error} Error si la promoción no existe
   */
  async archivePromotion(id: string): Promise<void> {
    const { execute } = useApiPut(
      API_ENDPOINTS.promotion.archive,
      { immediate: false }
    )
    await execute({ body: { id } })
  }

  // ========================================================================
  // MÉTODOS CRUD - PATCH (ACTIVACIÓN)
  // ========================================================================

  /**
   * Activa o desactiva un código de vinculación
   * @param {ActivateLinkingCodeRequest} request - Datos para activar/desactivar
   * @returns {Promise<LinkingCode>} Información del código actualizado
   * @throws {Error} Error si el código no existe
   */
  async activateLinkingCode(request: ActivateLinkingCodeRequest): Promise<LinkingCode> {
    const { execute } = useApiPatch<{ response: LinkingCode }>(
      API_ENDPOINTS.promotion.activateLinkingCode,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina un código de vinculación del sistema
   * @param {number} id - ID del código a eliminar
   * @param {number} userModifiedId - ID del usuario que realiza la eliminación (por defecto 1)
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si el código no existe
   */
  async deleteLinkingCode(id: number, userModifiedId: number = 1): Promise<void> {
    const { execute } = useApiDelete(
      API_ENDPOINTS.promotion.deleteLinkingCode,
      { immediate: false }
    )
    await execute({ body: { id, userModifiedId } })
  }

  /**
   * Elimina una promoción del sistema
   * @param {string} id - ID de la promoción a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si la promoción no existe
   */
  async deletePromotion(id: string): Promise<void> {
    const { execute } = useApiDelete(
      API_ENDPOINTS.promotion.delete,
      { immediate: false }
    )
    await execute({ body: { id } })
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de promociones
 * @type {PromotionService}
 */
export const promotionService = new PromotionService() 