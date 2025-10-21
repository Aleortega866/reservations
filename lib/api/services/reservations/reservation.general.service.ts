// ============================================================================
// RESERVATION GENERAL SERVICE - Servicio de Gestión de Reservaciones Generales
// ============================================================================

import { useApiFetch, useApiPost, useApiPut } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { 
  ReservationGeneralResponse, 
  ReservationGeneralListApiResponse,
  ReservationGeneralFilters,
  ReservationGeneralObjectiveVisitListApiResponse,
  LinkingCodeApiResponse,
  ReservationCostApiResponse,
  ReservationGeneralStep1Response,
  ReservationGeneralStep1ApiResponse,
  ReservationGeneralStep2Response,
  ReservationGeneralStep2ApiResponse,
  ReservationGeneralStep3Response,
  ReservationGeneralStep3ApiResponse,
  ReservationGeneralCUApiResponse,
  CreateUpdateReservationGeneralStep1Request, 
  UpdateReservationGeneralStep2Request,
  UpdateReservationGeneralStep3Request,
  TypeReservationStatus
} from '../../types/reservation/general'

/**
 * Servicio especializado para la gestión de reservaciones generales
 * Maneja los 3 pasos del proceso de reservación general
 * @class ReservationGeneralService
 */
export class ReservationGeneralService {
  
  // ========================================================================
  // MÉTODOS PARA PASO 1 - INFORMACIÓN BÁSICA
  // ========================================================================

  /**
   * Crea el primer paso para una nueva reservación general en el sistema (Step 1)
   * @param {CreateUpdateReservationGeneralStep1Request} data - Datos del primer paso de la nueva reservación general
   * @returns {Promise<ReservationGeneralCUApiResponse>} Información del primer paso de la nueva reservación general
   * @throws {Error} Error si los datos son inválidos
   */
  async createReservationGeneralStep1(data: CreateUpdateReservationGeneralStep1Request): Promise<ReservationGeneralCUApiResponse> {
    const { execute } = useApiPost<ReservationGeneralCUApiResponse>(
      API_ENDPOINTS.reservation.createReservationGeneralStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Actualiza el primer paso para una reservación general en el sistema (Step 1)
   * @param {CreateUpdateReservationGeneralStep1Request} data - Datos del primer paso de la reservación general
   * @returns {Promise<ReservationGeneralCUApiResponse>} Información del primer paso de la reservación general
   * @throws {Error} Error si los datos son inválidos
   */
  async updateReservationGeneralStep1(data: CreateUpdateReservationGeneralStep1Request): Promise<ReservationGeneralCUApiResponse> {
    const { execute } = useApiPut<ReservationGeneralCUApiResponse>(
      API_ENDPOINTS.reservation.updateReservationGeneralStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene el paso 1 de una reservación general en específico por su reservationId
   * @param {number} reservationId - reservationId del paso 1 de la reservación general a buscar
   * @returns {Promise<ReservationGeneralStep1ApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationGeneralStep1(reservationId: number): Promise<ReservationGeneralStep1ApiResponse> {
    const { execute } = useApiFetch<ReservationGeneralStep1ApiResponse>(
      API_ENDPOINTS.reservation.getReservationGeneralStep1(reservationId), 
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // MÉTODOS PARA PASO 2 - INFORMACIÓN DEL RESPONSABLE
  // ========================================================================
  
  /**
   * Crea/Actualiza el segundo paso para una reservación general en el sistema (Step 2)
   * @param {UpdateReservationGeneralStep2Request} data - Datos del segundo paso de la reservación general
   * @returns {Promise<ReservationGeneralCUApiResponse>} Información del segundo paso de la reservación general
   * @throws {Error} Error si los datos son inválidos
   */
  async updateReservationGeneralStep2(data: UpdateReservationGeneralStep2Request): Promise<ReservationGeneralCUApiResponse> {
    const { execute } = useApiPut<ReservationGeneralCUApiResponse>(
      API_ENDPOINTS.reservation.updateReservationGeneralStep2,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene el paso 2 de una reservación general en específico por su reservationId
   * @param {number} reservationId - reservationId del paso 2 de la reservación general a buscar
   * @returns {Promise<ReservationGeneralStep2ApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationGeneralStep2(reservationId: number): Promise<ReservationGeneralStep2ApiResponse> {
    const { execute } = useApiFetch<ReservationGeneralStep2ApiResponse>(
      API_ENDPOINTS.reservation.getReservationGeneralStep2(reservationId), 
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // MÉTODOS PARA PASO 3 - INFORMACIÓN ADICIONAL Y PAGO
  // ========================================================================

  /**
   * Crea/Actualiza el tercer paso para una reservación general en el sistema (Step 3)
   * @param {UpdateReservationGeneralStep3Request} data - Datos del tercer paso de la reservación general
   * @returns {Promise<ReservationGeneralCUApiResponse>} Información del tercer paso de la reservación general
   * @throws {Error} Error si los datos son inválidos
   */
  async updateReservationGeneralStep3(data: UpdateReservationGeneralStep3Request): Promise<ReservationGeneralCUApiResponse> {
    const { execute } = useApiPut<ReservationGeneralCUApiResponse>(
      API_ENDPOINTS.reservation.updateReservationGeneralStep3,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene el paso 3 de una reservación general en específico por su reservationId
   * @param {number} reservationId - reservationId del paso 3 de la reservación general a buscar
   * @returns {Promise<ReservationGeneralStep3ApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationGeneralStep3(reservationId: number): Promise<ReservationGeneralStep3ApiResponse> {
    const { execute } = useApiFetch<ReservationGeneralStep3ApiResponse>(
      API_ENDPOINTS.reservation.getReservationGeneralStep3(reservationId), 
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // MÉTODOS DE CONSULTA Y GESTIÓN
  // ========================================================================

  /**
   * Obtiene todas las reservaciones generales con filtros opcionales
   * @param {ReservationGeneralFilters} [filters] - Filtros opcionales para la consulta
   * @returns {Promise<ReservationGeneralListApiResponse>} Lista de reservaciones generales filtradas
   * @throws {Error} Error si no se pueden cargar las reservaciones
   */
  async getAllReservationGenerals(filters?: ReservationGeneralFilters): Promise<ReservationGeneralListApiResponse> {
    const { execute } = useApiFetch<ReservationGeneralListApiResponse>(
      API_ENDPOINTS.reservation.getAllReservationGenerals, 
      { immediate: false }
    )
    
    const params = filters ? Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>) : {}
    
    return execute({ query: params })
  }

  /**
   * Obtiene una reservación general específica por su ID
   * @param {string} reservationId - ID de la reservación general a buscar
   * @returns {Promise<{success: boolean; data: ReservationGeneralResponse | undefined}>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationGeneralsById(reservationId: string) {
    const reservationsGeneral = await this.getAllReservationGenerals()
    const reservationGeneral = reservationsGeneral.response.find((r: ReservationGeneralResponse) => r.reservationId === Number(reservationId))
    return {
      success: !!reservationGeneral,
      data: reservationGeneral
    }
  }

  /**
   * Obtiene los objetivos de la visita aplicables para la reservación general
   * @returns {Promise<ReservationGeneralObjectiveVisitListApiResponse>} Lista de objetivos de visita para reservación general
   * @throws {Error} Error si no se pueden cargar los objetivos de visita para reservación general
   */
  async getAllReservationGeneralObjectiveVisit(): Promise<ReservationGeneralObjectiveVisitListApiResponse> {
    const { execute } = useApiFetch<ReservationGeneralObjectiveVisitListApiResponse>(
      API_ENDPOINTS.reservation.getAllReservationGeneralObjectiveVisit, 
      { immediate: false }
    )
    
    return execute()
  }

  /**
   * Obtiene un código de vinculación específico por su code
   * @param {string} code - code del código de vinculación a buscar
   * @returns {Promise<LinkingCodeApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getAllLinkingCodes(code: string): Promise<LinkingCodeApiResponse> {
    const { execute } = useApiFetch<LinkingCodeApiResponse>(
      API_ENDPOINTS.promotion.getAllLinkingCodes, 
      { immediate: false }
    )

    const params = { code }
    
    return execute({ query: params})
  }

  /**
   * Obtiene el costo de una reservación general en específico por su reservationId
   * @param {number} reservationId - reservationId del costo de la reservación general a buscar
   * @returns {Promise<ReservationCostApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationCost(reservationId: number): Promise<ReservationCostApiResponse> {
    const { execute } = useApiFetch<ReservationCostApiResponse>(
      API_ENDPOINTS.reservation.getReservationCost(reservationId), 
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // MÉTODOS DE VERIFICACIÓN
  // ========================================================================

  /**
   * Verifica si una reservación tiene personas con discapacidad
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si la reservación tiene personas con discapacidad
   * @throws {Error} Error si la reservación no existe
   */
  async checkReservationHasDisability(reservationId: number): Promise<boolean> {
    const { execute } = useApiFetch<{ response: boolean }>(
      API_ENDPOINTS.reservation.company.checkHasDisability(reservationId),
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  // ========================================================================
  // MÉTODOS AUXILIARES PARA VERIFICAR EXISTENCIA DE PASOS
  // ========================================================================
  /**
   * Verifica si existe el paso 1 de una reservación general
   * @param {number} reservationId - ID de la reservación general
   * @returns {Promise<boolean>} True si existe el paso 1
   */
  async hasStep1(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationGeneralStep1(reservationId)
      return true
    } catch (error) {
      return false
    }
  }
  /**
   * Verifica si existe el paso 2 de una reservación general
   * @param {number} reservationId - ID de la reservación general
   * @returns {Promise<boolean>} True si existe el paso 2
   */
  async hasStep2(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationGeneralStep2(reservationId)
      return true
    } catch (error) {
      return false
    }
  }
  /**
   * Verifica si existe el paso 3 de una reservación general
   * @param {number} reservationId - ID de la reservación general
   * @returns {Promise<boolean>} True si existe el paso 3
   */
  async hasStep3(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationGeneralStep3(reservationId)
      return true
    } catch (error) {
      return false
    }
  }
  /**
   * Obtiene el estado actual de una reservación general basado en los pasos existentes
   * @param {number} reservationId - ID de la reservación general
   * @returns {Promise<TypeReservationStatus>} Estado actual
   */
  async getReservationStatus(reservationId: number): Promise<TypeReservationStatus> {
    try {
      // Verificar cada paso de forma independiente
      const hasStep1Data: boolean = await this.hasStep1(reservationId)
      const hasStep2Data: boolean = await this.hasStep2(reservationId)
      const hasStep3Data: boolean = await this.hasStep3(reservationId)
      // Si tiene paso 3, verificar si está completada
      if (hasStep3Data) {
        const step3 = await this.getReservationGeneralStep3(reservationId)
        if (step3.response.isTermsAccepted === true) {
          return 'completed'
        }
        return 'step3'
      }
      // Si tiene paso 2, está en paso 2
      if (hasStep2Data) {
        return 'step2'
      }
      // Si tiene paso 1, está en paso 1
      if (hasStep1Data) {
        return 'step1'
      }
      // Por defecto, está en borrador
      return 'draft'
    } catch (error) {
      console.error('Error al obtener estado de la reservación:', error)
      return 'draft'
    }
  }

}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de reservaciones
 * @type {ReservationGeneralService}
 */
export const reservationGeneralService = new ReservationGeneralService() 