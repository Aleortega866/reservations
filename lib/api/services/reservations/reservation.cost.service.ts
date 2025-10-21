// ============================================================================
// RESERVATION COST SERVICE - Servicio de Gestión de Costos de Reservaciones
// ============================================================================

import { useApiFetch } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { ReservationCostResponse } from '../../types/reservation/cost'

/**
 * Servicio especializado para la gestión de costos de reservaciones
 * Maneja el cálculo y obtención de costos totales de reservaciones
 * @class ReservationCostService
 */
export class ReservationCostService {
  
  // ========================================================================
  // MÉTODOS PARA GESTIÓN DE COSTOS
  // ========================================================================

  /**
   * Obtiene el costo total calculado de una reservación específica
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<ReservationCostResponse>} Información del costo total de la reservación
   * @throws {Error} Error si la reservación no existe o hay problemas de cálculo
   */
  async getReservationCost(reservationId: number): Promise<ReservationCostResponse> {
    const { execute } = useApiFetch<ReservationCostResponse>(
      API_ENDPOINTS.reservation.getReservationCost(reservationId),
      { immediate: false }
    )
    return execute()
  }
}

// ========================================================================
// INSTANCIA SINGLETON DEL SERVICIO
// ========================================================================

/**
 * Instancia singleton del servicio de costos de reservaciones
 * Se exporta para uso en toda la aplicación
 */
export const reservationCostService = new ReservationCostService()
