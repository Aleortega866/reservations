// ============================================================================
// COST SERVICE - Servicio de Gestión de Costos
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete, API_ENDPOINTS } from '../../core/useFetch'
import type { 
  Cost, 
  CreateCostRequest, 
  UpdateCostRequest, 
  ArchiveCostRequest,
  DeleteCostRequest,
  TicketPrice,
  UpdateTicketPriceRequest
} from '../../types'

/**
 * Servicio de gestión de costos que maneja CRUD y precios de tickets
 * @class CostService
 */
export class CostService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todos los costos del sistema
   * @returns {Promise<Cost[]>} Lista de todos los costos
   * @throws {Error} Error si no se pueden cargar los costos
   */
  async getAllCosts(): Promise<Cost[]> {
    const { execute } = useApiFetch<{ response: Cost[] }>(
      API_ENDPOINTS.cost.getAll, 
      { immediate: false }
    )
    const result = await execute()
    return result.response || []
  }

  /**
   * Obtiene un costo específico por su ID
   * @param {number} id - ID del costo a buscar
   * @returns {Promise<Cost>} Información del costo encontrado
   * @throws {Error} Error si el costo no existe
   */
  async getCostById(id: number): Promise<Cost> {
    const { execute } = useApiFetch<{ response: Cost }>(
      `${API_ENDPOINTS.cost.getById}?id=${id}`, 
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  /**
   * Obtiene todos los precios de tickets disponibles
   * @returns {Promise<TicketPrice[]>} Lista de precios de tickets
   * @throws {Error} Error si no se pueden cargar los precios
   */
  async getAllTicketPrices(): Promise<TicketPrice[]> {
    const { execute } = useApiFetch<{ response: TicketPrice[] }>(
      API_ENDPOINTS.cost.getAllTicketPrices, 
      { immediate: false }
    )
    const result = await execute()
    return result.response || []
  }

  /**
   * Obtiene precio de ticket por ID y tipo de visitante
   * @param {number} id - ID del ticket
   * @param {number} visitorType - Tipo de visitante
   * @returns {Promise<TicketPrice>} Precio del ticket para el tipo de visitante
   * @throws {Error} Error si el ticket no existe
   */
  async getTicketPriceById(id: number, visitorType: number): Promise<TicketPrice> {
    const { execute } = useApiFetch<{ response: TicketPrice }>(
      `${API_ENDPOINTS.cost.getAllTicketPrices}?id=${id}&visitorType=${visitorType}`,
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - POST (CREACIÓN)
  // ========================================================================

  /**
   * Crea un nuevo costo en el sistema
   * @param {CreateCostRequest} request - Datos del nuevo costo
   * @returns {Promise<Cost>} Información del costo creado
   * @throws {Error} Error si los datos son inválidos
   */
  async createCost(request: CreateCostRequest): Promise<Cost> {
    const { execute } = useApiPost<{ response: Cost }>(
      API_ENDPOINTS.cost.create,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN)
  // ========================================================================

  /**
   * Actualiza la información de un costo existente
   * @param {UpdateCostRequest} request - Nuevos datos del costo
   * @returns {Promise<Cost>} Información del costo actualizado
   * @throws {Error} Error si el costo no existe o datos inválidos
   */
  async updateCost(request: UpdateCostRequest): Promise<Cost> {
    const { execute } = useApiPut<{ response: Cost }>(
      API_ENDPOINTS.cost.update,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  /**
   * Archiva un costo (soft delete)
   * @param {ArchiveCostRequest} request - Datos del costo a archivar
   * @returns {Promise<boolean>} Confirmación de archivado
   * @throws {Error} Error si el costo no existe
   */
  async archiveCost(request: ArchiveCostRequest): Promise<boolean> {
    const { execute } = useApiPut<{ response: boolean }>(
      API_ENDPOINTS.cost.archive,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  /**
   * Actualiza el precio de un ticket específico
   * @param {UpdateTicketPriceRequest} request - Datos del nuevo precio
   * @returns {Promise<TicketPrice>} Información del precio actualizado
   * @throws {Error} Error si el ticket no existe o precio inválido
   */
  async updateTicketPrice(request: UpdateTicketPriceRequest): Promise<TicketPrice> {
    const { execute } = useApiPut<{ response: TicketPrice }>(
      API_ENDPOINTS.cost.updateTicketPrice,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina un costo del sistema permanentemente
   * @param {DeleteCostRequest} request - Datos del costo a eliminar
   * @returns {Promise<boolean>} Confirmación de eliminación
   * @throws {Error} Error si el costo no existe o no se puede eliminar
   */
  async deleteCost(request: DeleteCostRequest): Promise<boolean> {
    const { execute } = useApiDelete<{ response: boolean }>(
      API_ENDPOINTS.cost.delete,
      { immediate: false }
    )
    const result = await execute({ body: request })
    return result.response
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de costos
 * @type {CostService}
 */
export const costService = new CostService() 