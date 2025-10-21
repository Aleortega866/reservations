// ============================================================================
// RESERVATION COMPANY SERVICE - Servicio de Gestión de Reservaciones Empresariales
// ============================================================================

import { useApiFetch, useApiPost, useApiPut } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { 
  CreateReservationCompanyStep1Request,
  UpdateReservationCompanyStep1Request,
  UpdateReservationCompanyStep2Request,
  UpdateReservationCompanyStep3Request,
  ReservationCompanyStep1Response,
  ReservationCompanyStep2Response,
  ReservationCompanyStep3Response,
  ReservationCompany,
  ReservationCompanyFilters,
  ReservationCompanyStats
} from '../../types/reservation/company'

/**
 * Servicio especializado para la gestión de reservaciones empresariales
 * Maneja los 3 pasos del proceso de reservación empresarial
 * @class ReservationCompanyService
 */
export class ReservationCompanyService {
  
  // ========================================================================
  // MÉTODOS PARA PASO 1 - INFORMACIÓN BÁSICA
  // ========================================================================

  /**
   * Crea una nueva reservación empresarial (Paso 1)
   * @param {CreateReservationCompanyStep1Request} data - Datos del paso 1
   * @returns {Promise<ReservationCompanyStep1Response>} Respuesta con los datos creados
   * @throws {Error} Error si los datos son inválidos o hay problemas de conexión
   */
  async createReservationCompanyStep1(data: CreateReservationCompanyStep1Request): Promise<ReservationCompanyStep1Response> {
    const { execute } = useApiPost<ReservationCompanyStep1Response>(
      API_ENDPOINTS.reservation.company.createStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Actualiza una reservación empresarial existente (Paso 1)
   * @param {UpdateReservationCompanyStep1Request} data - Datos actualizados del paso 1
   * @returns {Promise<ReservationCompanyStep1Response>} Respuesta con los datos actualizados
   * @throws {Error} Error si la reservación no existe o los datos son inválidos
   */
  async updateReservationCompanyStep1(data: UpdateReservationCompanyStep1Request): Promise<ReservationCompanyStep1Response> {
    const { execute } = useApiPut<ReservationCompanyStep1Response>(
      API_ENDPOINTS.reservation.company.updateStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene los datos del paso 1 de una reservación empresarial
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<ReservationCompanyStep1Response>} Datos del paso 1
   * @throws {Error} Error si la reservación no existe
   */
  async getReservationCompanyStep1(reservationId: number): Promise<ReservationCompanyStep1Response> {
    const { execute } = useApiFetch<ReservationCompanyStep1Response>(
      API_ENDPOINTS.reservation.company.getStep1(reservationId),
      { immediate: false }
    )
    return execute()
  }

  // ========================================================================
  // MÉTODOS PARA PASO 2 - INFORMACIÓN DEL RESPONSABLE
  // ========================================================================

  /**
   * Actualiza una reservación empresarial (Paso 2)
   * @param {UpdateReservationCompanyStep2Request} data - Datos del paso 2
   * @returns {Promise<ReservationCompanyStep2Response>} Respuesta con los datos actualizados
   * @throws {Error} Error si la reservación no existe o los datos son inválidos
   */
  async updateReservationCompanyStep2(data: UpdateReservationCompanyStep2Request): Promise<ReservationCompanyStep2Response> {
    const { execute } = useApiPut<ReservationCompanyStep2Response>(
      API_ENDPOINTS.reservation.company.updateStep2,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene los datos del paso 2 de una reservación empresarial
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<ReservationCompanyStep2Response>} Datos del paso 2
   * @throws {Error} Error si la reservación no existe
   */
  async getReservationCompanyStep2(reservationId: number): Promise<ReservationCompanyStep2Response> {
    const { execute } = useApiFetch<ReservationCompanyStep2Response>(
      API_ENDPOINTS.reservation.company.getStep2(reservationId),
      { immediate: false }
    )
    return execute()
  }

  // ========================================================================
  // MÉTODOS PARA PASO 3 - INFORMACIÓN ADICIONAL Y PAGO
  // ========================================================================

  /**
   * Actualiza una reservación empresarial (Paso 3)
   * @param {UpdateReservationCompanyStep3Request} data - Datos del paso 3
   * @returns {Promise<ReservationCompanyStep3Response>} Respuesta con los datos actualizados
   * @throws {Error} Error si la reservación no existe o los datos son inválidos
   */
  async updateReservationCompanyStep3(data: UpdateReservationCompanyStep3Request): Promise<ReservationCompanyStep3Response> {
    const { execute } = useApiPut<ReservationCompanyStep3Response>(
      API_ENDPOINTS.reservation.company.updateStep3,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene los datos del paso 3 de una reservación empresarial
   * Incluye el desglose de costos (costBreakdown) dentro de la respuesta
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<ReservationCompanyStep3Response>} Datos del paso 3 con costBreakdown
   * @throws {Error} Error si la reservación no existe
   */
  async getReservationCompanyStep3(reservationId: number): Promise<ReservationCompanyStep3Response> {
    const { execute } = useApiFetch<ReservationCompanyStep3Response>(
      API_ENDPOINTS.reservation.company.getStep3(reservationId),
      { immediate: false }
    )
    return execute()
  }

  // ========================================================================
  // MÉTODOS DE CONSULTA Y GESTIÓN
  // ========================================================================

  /**
   * Obtiene una reservación empresarial completa por ID
   * NOTA: Este método NO debe usarse para flujos independientes por paso.
   * Para flujos independientes, usar los métodos específicos de cada paso:
   * - getReservationCompanyStep1()
   * - getReservationCompanyStep2() 
   * - getReservationCompanyStep3()
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<ReservationCompany>} Reservación completa
   * @throws {Error} Error si la reservación no existe
   * @deprecated Usar métodos específicos por paso para flujos independientes
   */
  async getReservationCompanyById(reservationId: number): Promise<ReservationCompany> {
    console.warn('⚠️  getReservationCompanyById() no es independiente. Usar métodos específicos por paso para flujos independientes.')
    
    try {
      // Obtener datos de los pasos de forma independiente (no en paralelo)
      let step1: ReservationCompanyStep1Response | null = null
      let step2: ReservationCompanyStep2Response | null = null
      let step3: ReservationCompanyStep3Response | null = null

      // Intentar cargar cada paso independientemente
      try {
        step1 = await this.getReservationCompanyStep1(reservationId)
      } catch (error) {
        console.warn('Paso 1 no encontrado para reservación:', reservationId)
      }

      try {
        step2 = await this.getReservationCompanyStep2(reservationId)
      } catch (error) {
        console.warn('Paso 2 no encontrado para reservación:', reservationId)
      }

      try {
        step3 = await this.getReservationCompanyStep3(reservationId)
      } catch (error) {
        console.warn('Paso 3 no encontrado para reservación:', reservationId)
      }

      // Verificar que al menos el paso 1 existe
      if (!step1) {
        throw new Error('No se encontró información del paso 1 para esta reservación')
      }

      // Combinar los datos en una estructura completa
      return {
        id: reservationId,
        visitorId: step1.visitorId,
        companyId: step1.companyId,
        
        // Paso 1
        totalYoungAdults: step1.totalYoungAdults,
        totalYoungAdultsWithDisabilities: step1.totalYoungAdultsWithDisabilities,
        totalAdults: step1.totalAdults,
        totalAdultsWithDisabilities: step1.totalAdultsWithDisabilities,
        totalSeniors: step1.totalSeniors,
        totalSeniorsWithDisabilities: step1.totalSeniorsWithDisabilities,
        reservationDate: step1.reservationDate,
        checkInDateId: step1.checkInDateId,
        visitObjectiveId: step1.visitObjectiveId,
        
        // Paso 2 (valores por defecto si no existe)
        mainEconomicConceptId: step2?.mainEconomicConceptId || null,
        secondaryEconomicConceptId: step2?.secondaryEconomicConceptId || null,
        isReservationPersonAlsoResponsible: step2?.isReservationPersonAlsoResponsible || null,
        isResponsibleNotAssigned: step2?.isResponsibleNotAssigned || null,
        fullName: step2?.fullName || null,
        email: step2?.email || null,
        phone: step2?.phone || null,
        positionTypeId: step2?.positionTypeId || null,
        ageRangeIds: step2?.ageRangeIds || null,
        specialAssistanceId: step2?.specialAssistanceId || null,
        
        // Paso 3 (valores por defecto si no existe)
        discoveryChannelId: step3?.discoveryChannelId || null,
        paymentMethodId: step3?.paymentMethodId || null,
        requiresMediationService: step3?.requiresMediationService || null,
        requiresDetailedLocationInformation: step3?.requiresDetailedLocationInformation || null,
        requestsPostVisitInvoice: step3?.requestsPostVisitInvoice || null,
        needsCheckoutProcessInformation: step3?.needsCheckoutProcessInformation || null,
        confirmsInformationAccuracy: step3?.confirmsInformationAccuracy || null,
        totalPeople: step3?.totalPeople || null,
        totalCost: step3?.totalCost || null,
        
        // Metadatos
        status: this.determineReservationStatus(step1, step2 || undefined, step3 || undefined),
        createdAt: step1.createdAt,
        updatedAt: step3?.updatedAt || step2?.updatedAt || step1.updatedAt
      }
    } catch (error) {
      console.error('Error al obtener reservación empresarial completa:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las reservaciones empresariales con filtros opcionales
   * @param {ReservationCompanyFilters} [filters] - Filtros opcionales
   * @returns {Promise<ReservationCompany[]>} Lista de reservaciones filtradas
   * @throws {Error} Error si no se pueden cargar las reservaciones
   */
  async getAllReservationCompanies(filters?: ReservationCompanyFilters): Promise<ReservationCompany[]> {
    const { execute } = useApiFetch<ReservationCompany[]>(
      API_ENDPOINTS.reservation.company.getAll,
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
   * Obtiene estadísticas de reservaciones empresariales
   * @param {ReservationCompanyFilters} [filters] - Filtros opcionales
   * @returns {Promise<ReservationCompanyStats>} Estadísticas de reservaciones
   * @throws {Error} Error si no se pueden cargar las estadísticas
   */
  async getReservationCompanyStats(filters?: ReservationCompanyFilters): Promise<ReservationCompanyStats> {
    const { execute } = useApiFetch<ReservationCompanyStats>(
      API_ENDPOINTS.reservation.company.getStats,
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
   * Verifica si existe el paso 1 de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si existe el paso 1
   */
  async hasStep1(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationCompanyStep1(reservationId)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Verifica si existe el paso 2 de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si existe el paso 2
   */
  async hasStep2(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationCompanyStep2(reservationId)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Verifica si existe el paso 3 de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si existe el paso 3
   */
  async hasStep3(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationCompanyStep3(reservationId)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Obtiene el estado actual de una reservación basado en los pasos existentes
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled'>} Estado actual
   */
  async getReservationStatus(reservationId: number): Promise<'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled'> {
    try {
      // Verificar cada paso de forma independiente
      const hasStep1Data = await this.hasStep1(reservationId)
      const hasStep2Data = await this.hasStep2(reservationId)
      const hasStep3Data = await this.hasStep3(reservationId)

      // Si tiene paso 3, verificar si está completada
      if (hasStep3Data) {
        const step3 = await this.getReservationCompanyStep3(reservationId)
        if (step3.confirmsInformationAccuracy === true) {
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

  // ========================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ========================================================================

  /**
   * Determina el estado de una reservación basado en los datos de los pasos
   * @private
   * @param {ReservationCompanyStep1Response} step1 - Datos del paso 1
   * @param {ReservationCompanyStep2Response} [step2] - Datos del paso 2 (opcional)
   * @param {ReservationCompanyStep3Response} [step3] - Datos del paso 3 (opcional)
   * @returns {string} Estado de la reservación
   */
  private determineReservationStatus(
    step1: ReservationCompanyStep1Response,
    step2?: ReservationCompanyStep2Response,
    step3?: ReservationCompanyStep3Response
  ): 'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled' {
    // Si tiene datos del paso 3 y confirma la información, está completada
    if (step3 && step3.confirmsInformationAccuracy === true) {
      return 'completed'
    }
    
    // Si tiene datos del paso 3, está en paso 3
    if (step3 && step3.reservationId > 0) {
      return 'step3'
    }
    
    // Si tiene datos del paso 2, está en paso 2
    if (step2 && step2.reservationId > 0) {
      return 'step2'
    }
    
    // Si tiene datos del paso 1, está en paso 1
    if (step1 && step1.reservationId > 0) {
      return 'step1'
    }
    
    // Por defecto, está en borrador
    return 'draft'
  }

}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de reservaciones empresariales
 * @type {ReservationCompanyService}
 */
export const reservationCompanyService = new ReservationCompanyService()
