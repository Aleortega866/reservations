// ============================================================================
// AVAILABILITY SERVICE - Servicio de Gestión de Disponibilidad
// ============================================================================

import { useApiFetch } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  MonthlyAvailabilityApiResponse,
  MonthlyAvailabilityResponse,
  AvailabilityFilters
} from '../../types/availability'

/**
 * Servicio de gestión de disponibilidad que maneja la disponibilidad mensual
 * @class AvailabilityService
 */
export class AvailabilityService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene la disponibilidad mensual para un mes y año específicos
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<MonthlyAvailabilityResponse>} Disponibilidad mensual
   * @throws {Error} Error si no se puede cargar la disponibilidad
   */
  async getMonthlyAvailability(month: number, year: number): Promise<MonthlyAvailabilityResponse> {
    const endpoint = `${API_ENDPOINTS.form.getMonthlyAvailability}?month=${month}&year=${year}`
    const { execute } = useApiFetch<MonthlyAvailabilityApiResponse>(endpoint, { immediate: false })
    
    const result = await execute()
    
    if (!result.response) {
      throw new Error('No se pudo obtener la disponibilidad mensual')
    }
    
    return result.response
  }

  /**
   * Obtiene la disponibilidad mensual usando filtros
   * @param {AvailabilityFilters} filters - Filtros de mes y año
   * @returns {Promise<MonthlyAvailabilityResponse>} Disponibilidad mensual
   * @throws {Error} Error si no se puede cargar la disponibilidad
   */
  async getMonthlyAvailabilityWithFilters(filters: AvailabilityFilters): Promise<MonthlyAvailabilityResponse> {
    return this.getMonthlyAvailability(filters.month, filters.year)
  }
}
