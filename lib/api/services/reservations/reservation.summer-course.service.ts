// ============================================================================
// RESERVATION SUMMER COURSE SERVICE - Servicio de Gestión de Reservaciones de Cursos de Verano
// ============================================================================

import { useApiFetch, useApiPost, useApiPut } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { 
  CreateReservationSummerCourseStep1Request,
  CreateReservationSummerCourseStep2Request,
  UpdateReservationSummerCourseStep1Request,
  UpdateReservationSummerCourseStep2Request,
  UpdateReservationSummerCourseStep3Request,
  ReservationSummerCourseStep1Response,
  ReservationSummerCourseStep2Response,
  ReservationSummerCourseStep3Response,
  ReservationSummerCourseFilters,
  ReservationSummerCourseStats,
  ReservationSummerCourseGetAllDto
} from '../../types/reservation/summer-course'

/**
 * Servicio especializado para la gestión de reservaciones de cursos de verano
 * Maneja los 3 pasos del proceso de reservación de cursos de verano
 * @class ReservationSummerCourseService
 */
export class ReservationSummerCourseService {
  
  // ========================================================================
  // MÉTODOS PARA PASO 1 - INFORMACIÓN BÁSICA
  // ========================================================================

  /**
   * Crea una nueva reservación de curso de verano (Paso 1)
   * @param {CreateReservationSummerCourseStep1Request} data - Datos del paso 1
   * @returns {Promise<ReservationSummerCourseStep1Response>} Respuesta con los datos creados
   * @throws {Error} Error si los datos son inválidos o hay problemas de conexión
   */
  async createReservationSummerCourseStep1(data: CreateReservationSummerCourseStep1Request): Promise<ReservationSummerCourseStep1Response> {
    const { execute } = useApiPost<ReservationSummerCourseStep1Response>(
      API_ENDPOINTS.reservation.summerCourse.createStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Actualiza una reservación de curso de verano existente (Paso 1)
   * @param {UpdateReservationSummerCourseStep1Request} data - Datos actualizados del paso 1
   * @returns {Promise<ReservationSummerCourseStep1Response>} Respuesta con los datos actualizados
   * @throws {Error} Error si la reservación no existe o los datos son inválidos
   */
  async updateReservationSummerCourseStep1(data: UpdateReservationSummerCourseStep1Request): Promise<ReservationSummerCourseStep1Response> {
    const { execute } = useApiPut<ReservationSummerCourseStep1Response>(
      API_ENDPOINTS.reservation.summerCourse.updateStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS PARA PASO 2 - DETALLES DE LA RESERVACIÓN
  // ========================================================================


  /**
   * Actualiza los detalles de una reservación de curso de verano (Paso 2)
   * @param {UpdateReservationSummerCourseStep2Request} data - Datos actualizados del paso 2
   * @returns {Promise<ReservationSummerCourseStep2Response>} Respuesta con los datos actualizados
   * @throws {Error} Error si la reservación no existe o los datos son inválidos
   */
  async updateReservationSummerCourseStep2(data: UpdateReservationSummerCourseStep2Request): Promise<ReservationSummerCourseStep2Response> {
    const { execute } = useApiPut<ReservationSummerCourseStep2Response>(
      API_ENDPOINTS.reservation.summerCourse.updateStep2,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS PARA PASO 3 - INFORMACIÓN DE PAGO
  // ========================================================================

  /**
   * Actualiza la información de pago de una reservación de curso de verano (Paso 3)
   * @param {UpdateReservationSummerCourseStep3Request} data - Datos del paso 3
   * @returns {Promise<ReservationSummerCourseStep3Response>} Respuesta con los datos actualizados
   * @throws {Error} Error si la reservación no existe o los datos son inválidos
   */
  async updateReservationSummerCourseStep3(data: UpdateReservationSummerCourseStep3Request): Promise<ReservationSummerCourseStep3Response> {
    const { execute } = useApiPut<ReservationSummerCourseStep3Response>(
      API_ENDPOINTS.reservation.summerCourse.updateStep3,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS DE CONSULTA Y GESTIÓN
  // ========================================================================

  /**
   * Obtiene todas las reservaciones de cursos de verano con filtros opcionales
   * @param {ReservationSummerCourseFilters} [filters] - Filtros opcionales (id, visitorId, folio)
   * @returns {Promise<ReservationSummerCourseGetAllDto[]>} Lista de reservaciones filtradas
   * @throws {Error} Error si no se pueden cargar las reservaciones
   */
  async getAllReservationSummerCourses(filters?: ReservationSummerCourseFilters): Promise<ReservationSummerCourseGetAllDto[]> {
    const { execute } = useApiFetch<ReservationSummerCourseGetAllDto[]>(
      API_ENDPOINTS.reservation.summerCourse.getAll,
      { immediate: false }
    )
    
    // Construir parámetros de consulta según la documentación de la API
    const params: Record<string, any> = {}
    
    if (filters) {
      if (filters.id !== undefined && filters.id !== null) {
        params.id = filters.id
      }
      if (filters.visitorId !== undefined && filters.visitorId !== null) {
        params.visitorId = filters.visitorId
      }
      if (filters.folio !== undefined && filters.folio !== null) {
        params.folio = filters.folio
      }
    }
    
    return execute({ query: params })
  }

  /**
   * Obtiene reservaciones de cursos de verano por ID, visitorId o folio
   * @param {number} [id] - ID de la reservación
   * @param {number} [visitorId] - ID del visitante
   * @param {string} [folio] - Folio de la reservación
   * @returns {Promise<ReservationSummerCourseGetAllDto[]>} Lista de reservaciones
   * @throws {Error} Error si no se pueden cargar las reservaciones
   */
  async getReservationSummerCoursesById(id?: number, visitorId?: number, folio?: string): Promise<ReservationSummerCourseGetAllDto[]> {
    const filters: ReservationSummerCourseFilters = {}
    
    if (id !== undefined && id !== null) {
      filters.id = id
    }
    if (visitorId !== undefined && visitorId !== null) {
      filters.visitorId = visitorId
    }
    if (folio !== undefined && folio !== null) {
      filters.folio = folio
    }
    
    return this.getAllReservationSummerCourses(filters)
  }

  /**
   * Obtiene los datos del paso 1 de una reservación de curso de verano
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<any>} Datos del paso 1
   * @throws {Error} Error si no se pueden obtener los datos
   */
  async getReservationSummerCourseStep1(reservationId: number): Promise<any> {
    const endpoint = API_ENDPOINTS.reservation.summerCourse.getStep1(reservationId)
    const { execute } = useApiFetch<any>(endpoint, { immediate: false })
    return execute()
  }

  /**
   * Obtiene los datos del paso 2 de una reservación de curso de verano
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<any>} Datos del paso 2
   * @throws {Error} Error si no se pueden obtener los datos
   */
  async getReservationSummerCourseStep2(reservationId: number): Promise<any> {
    const endpoint = API_ENDPOINTS.reservation.summerCourse.getStep2(reservationId)
    const { execute } = useApiFetch<any>(endpoint, { immediate: false })
    return execute()
  }

  /**
   * Obtiene los datos del paso 3 de una reservación de curso de verano
   * Incluye el desglose de costos (costBreakdown) dentro de la respuesta
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<ReservationSummerCourseStep3Response>} Datos del paso 3 con costBreakdown
   * @throws {Error} Error si no se pueden obtener los datos
   */
  async getReservationSummerCourseStep3(reservationId: number): Promise<ReservationSummerCourseStep3Response> {
    const endpoint = API_ENDPOINTS.reservation.summerCourse.getStep3(reservationId)
    const { execute } = useApiFetch<ReservationSummerCourseStep3Response>(endpoint, { immediate: false })
    return execute()
  }

  /**
   * Obtiene estadísticas de reservaciones de cursos de verano
   * @param {ReservationSummerCourseFilters} [filters] - Filtros opcionales
   * @returns {Promise<ReservationSummerCourseStats>} Estadísticas de reservaciones
   * @throws {Error} Error si no se pueden cargar las estadísticas
   */
  async getReservationSummerCourseStats(filters?: ReservationSummerCourseFilters): Promise<ReservationSummerCourseStats> {
    const { execute } = useApiFetch<ReservationSummerCourseStats>(
      API_ENDPOINTS.reservation.summerCourse.getStats,
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
  // MÉTODOS AUXILIARES PARA VERIFICAR EXISTENCIA DE PASOS
  // ========================================================================

  /**
   * Verifica si existe el paso 1 de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si existe el paso 1
   */
  async hasStep1(reservationId: number): Promise<boolean> {
    try {
      const reservations = await this.getAllReservationSummerCourses({ id: reservationId })
      return reservations.length > 0
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
      // Para verificar el paso 2, intentamos actualizar con datos mínimos
      // Si no existe, el servidor devolverá un error
      await this.updateReservationSummerCourseStep2({
        reservationId,
        isReservationPersonAlsoResponsible: false,
        isResponsibleNotAssigned: false,
        fullName: '',
        email: '',
        phone: '',
        specialAssistances: [],
        mainEconomicConceptId: 0,
        secondaryEconomicConceptId: 0,
        userModifiedId: 0
      })
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
      // Para verificar el paso 3, intentamos actualizar con datos mínimos
      // Si no existe, el servidor devolverá un error
      await this.updateReservationSummerCourseStep3({
        reservationId,
        paymentMethodId: 0,
        discoveryChannelId: 0,
        acknowledgedCivilProtectionDocs: false,
        requiresStreetCrossingAssistance: false,
        confirmsInformationAccuracy: false,
        workShopsIds: [1],
        userModifiedId: 0
      })
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Verifica si una reservación tiene personas con discapacidad
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si la reservación tiene personas con discapacidad
   * @throws {Error} Error si la reservación no existe
   */
  async checkReservationHasDisability(reservationId: number): Promise<boolean> {
    const { execute } = useApiFetch<{ response: boolean }>(
      API_ENDPOINTS.reservation.summerCourse.checkHasDisability(reservationId),
      { immediate: false }
    )
    const result = await execute()
    return result.response
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

      // Si tiene paso 3, está completada
      if (hasStep3Data) {
        return 'completed'
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


}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de reservaciones de cursos de verano
 * @type {ReservationSummerCourseService}
 */
export const reservationSummerCourseService = new ReservationSummerCourseService()
