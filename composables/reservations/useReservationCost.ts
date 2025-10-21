// ============================================================================
// USE RESERVATION COST COMPOSABLE - Composable para Gestión de Costos de Reservaciones
// ============================================================================

import { ref, computed, readonly } from 'vue'
import { reservationCostService } from '~/lib/api/services/reservations'
import type { ReservationCostResponse, ReservationCostData } from '~/lib/api/types/reservation/cost'

/**
 * Composable para la gestión de costos de reservaciones
 * Proporciona funcionalidades para obtener y manejar los costos de reservaciones específicas
 * @returns {Object} Objeto con métodos y estado para gestión de costos
 */
export const useReservationCost = () => {
  // ========================================================================
  // ESTADO REACTIVO
  // ========================================================================
  
  /** Estado de carga para operaciones de costos */
  const isLoading = ref(false)
  
  /** Error actual en operaciones de costos */
  const error = ref<string | null>(null)
  
  /** Datos del costo de la reservación actual */
  const costData = ref<ReservationCostData | null>(null)
  
  /** Respuesta completa de la API */
  const apiResponse = ref<ReservationCostResponse | null>(null)

  // ========================================================================
  // COMPUTED PROPERTIES
  // ========================================================================
  
  /** Indica si hay datos de costo cargados */
  const hasCostData = computed(() => costData.value !== null)
  
  /** Indica si hay un error activo */
  const hasError = computed(() => error.value !== null)
  
  /** Total de personas calculado */
  const totalPeople = computed(() => costData.value?.totalPeople || 0)

    /** Total de personas con discapacidad calculado */
  const totalPeopleWithDisabilities = computed(() => costData.value?.totalDisabilities || 0)
  
  /** Costo total calculado */
  const totalCost = computed(() => costData.value?.totalCost || 0)
  
  /** Desglose de personas por categoría */
  const peopleBreakdown = computed(() => {
    if (!costData.value) return null
    
    return {
      kidsUnderThree: costData.value.totalKidsUnderThree,
      kids: costData.value.totalKids,
      kidsWithDisabilities: costData.value.totalKidsWithDisabilities,
      teenagers: costData.value.totalTeenagers,
      teenagersWithDisabilities: costData.value.totalTeenagersWithDisabilities,
      youngAdults: costData.value.totalYoungAdults,
      youngAdultsWithDisabilities: costData.value.totalYoungAdultsWithDisabilities,
      adults: costData.value.totalAdults,
      adultsWithDisabilities: costData.value.totalAdultsWithDisabilities,
      seniors: costData.value.totalSeniors,
      seniorsWithDisabilities: costData.value.totalSeniorsWithDisabilities,
      disabilities: costData.value.totalDisabilities
    }
  })

  // ========================================================================
  // MÉTODOS
  // ========================================================================
  
  /**
   * Obtiene el costo de una reservación específica
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<ReservationCostData | null>} Datos del costo o null si hay error
   */
  const getReservationCost = async (reservationId: number): Promise<ReservationCostData | null> => {
    if (!reservationId || reservationId <= 0) {
      error.value = 'ID de reservación inválido'
      return null
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await reservationCostService.getReservationCost(reservationId)
      
      if (response.isValid && response.code === 200) {
        costData.value = response.response
        apiResponse.value = response
        return response.response
      } else {
        error.value = response.comments || 'Error al obtener el costo de la reservación'
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener el costo'
      error.value = errorMessage
      console.error('Error en getReservationCost:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Limpia el estado del composable
   */
  const clearCostData = () => {
    costData.value = null
    apiResponse.value = null
    error.value = null
  }

  /**
   * Resetea el estado de error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Formatea el costo total como moneda
   * @param {number} amount - Cantidad a formatear
   * @returns {string} Cantidad formateada como moneda mexicana
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  /**
   * Formatea la cantidad de personas en formato 000,000,000
   * @param {number} amount - Cantidad de personas a formatear
   * @returns {string} Cantidad formateada en formato 000,000,000
   */
  const formatPeople = (amount: number): string => {
    return new Intl.NumberFormat('es-MX').format(amount)
  }

  /**
   * Obtiene un resumen del costo en formato legible
   * @returns {string} Resumen del costo
   */
  const getCostSummary = (): string => {
    if (!costData.value) return 'Sin datos de costo'
    
    const { totalPeople, totalCost } = costData.value
    return `${totalPeople} persona${totalPeople !== 1 ? 's' : ''} - ${formatCurrency(totalCost)}`
  }

  // ========================================================================
  // RETORNO DEL COMPOSABLE
  // ========================================================================
  
  return {
    // Estado
    isLoading: readonly(isLoading),
    error: readonly(error),
    costData: readonly(costData),
    apiResponse: readonly(apiResponse),
    
    // Computed
    hasCostData,
    hasError,
    totalPeople,
    totalPeopleWithDisabilities,
    totalCost,
    peopleBreakdown,
    
    // Métodos
    getReservationCost,
    clearCostData,
    clearError,
    formatCurrency,
    formatPeople,
    getCostSummary
  }
}
