// ============================================================================
// RESERVATION SCHOOL SERVICE - Servicio de Gestión de Reservaciones Escolares
// ============================================================================

import { useApiFetch, useApiPost, useApiPut } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { 
  ReservationSchoolListAcademicLevelApiResponse,
  ReservationSchoolAcademicLevelsFilters,
  ReservationSchoolObjectiveVisitListApiResponse,
  ReservationSchoolStep1ApiResponse,
  ReservationSchoolStep2ApiResponse,
  ReservationSchoolStep3ApiResponse,
  ReservationSchoolCUApiResponse,
  CreateUpdateReservationSchoolStep1Request, 
  UpdateReservationSchoolStep2Request,
  UpdateReservationSchoolStep3Request,
  TypeReservationStatus
} from '../../types/reservation/school'

/**
 * Servicio especializado para la gestión de reservaciones escolares
 * Maneja los 3 pasos del proceso de reservación escolar
 * @class ReservationSchoolService
 */
export class ReservationSchoolService {
  
  // ========================================================================
  // MÉTODOS PARA PASO 1 - INFORMACIÓN BÁSICA
  // ========================================================================

  /**
   * Crea el primer paso para una nueva reservación escolar en el sistema (Step 1)
   * @param {CreateUpdateReservationSchoolStep1Request} data - Datos del primer paso de la nueva reservación escolar
   * @returns {Promise<ReservationSchoolCUApiResponse>} Información del primer paso de la nueva reservación escolar
   * @throws {Error} Error si los datos son inválidos
   */
  async createReservationSchoolsStep1(data: CreateUpdateReservationSchoolStep1Request): Promise<ReservationSchoolCUApiResponse> {
    const { execute } = useApiPost<ReservationSchoolCUApiResponse>(
      API_ENDPOINTS.reservation.school.createReservationSchoolsStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Actualiza el primer paso para una reservación escolar en el sistema (Step 1)
   * @param {CreateUpdateReservationSchoolStep1Request} data - Datos del primer paso de la reservación escolar
   * @returns {Promise<ReservationSchoolCUApiResponse>} Información del primer paso de la reservación escolar
   * @throws {Error} Error si los datos son inválidos
   */
  async updateReservationSchoolsStep1(data: CreateUpdateReservationSchoolStep1Request): Promise<ReservationSchoolCUApiResponse> {
    const { execute } = useApiPut<ReservationSchoolCUApiResponse>(
      API_ENDPOINTS.reservation.school.updateReservationSchoolsStep1,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene el paso 1 de una reservación escolar en específico por su reservationId
   * @param {number} reservationId - reservationId del paso 1 de la reservación escolar a buscar
   * @returns {Promise<ReservationSchoolStep1ApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationSchoolStep1(reservationId: number): Promise<ReservationSchoolStep1ApiResponse> {
    const { execute } = useApiFetch<ReservationSchoolStep1ApiResponse>(
      API_ENDPOINTS.reservation.school.getReservationSchoolStep1(reservationId), 
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // MÉTODOS PARA PASO 2 - INFORMACIÓN DEL RESPONSABLE
  // ========================================================================
  
  /**
   * Crea/Actualiza el segundo paso para una reservación escolar en el sistema (Step 2)
   * @param {UpdateReservationSchoolStep2Request} data - Datos del segundo paso de la reservación escolar
   * @returns {Promise<ReservationSchoolCUApiResponse>} Información del segundo paso de la reservación escolar
   * @throws {Error} Error si los datos son inválidos
   */
  async updateReservationSchoolsStep2(data: UpdateReservationSchoolStep2Request): Promise<ReservationSchoolCUApiResponse> {
    const { execute } = useApiPut<ReservationSchoolCUApiResponse>(
      API_ENDPOINTS.reservation.school.updateReservationSchoolsStep2,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene el paso 2 de una reservación escolar en específico por su reservationId
   * @param {number} reservationId - reservationId del paso 2 de la reservación escolar a buscar
   * @returns {Promise<ReservationSchoolStep2ApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationSchoolStep2(reservationId: number): Promise<ReservationSchoolStep2ApiResponse> {
    const { execute } = useApiFetch<ReservationSchoolStep2ApiResponse>(
      API_ENDPOINTS.reservation.school.getReservationSchoolStep2(reservationId), 
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // MÉTODOS PARA PASO 3 - INFORMACIÓN ADICIONAL Y PAGO
  // ========================================================================

  /**
   * Crea/Actualiza el tercer paso para una reservación escolar en el sistema (Step 3)
   * @param {UpdateReservationSchoolStep3Request} data - Datos del tercer paso de la reservación escolar
   * @returns {Promise<ReservationSchoolCUApiResponse>} Información del tercer paso de la reservación escolar
   * @throws {Error} Error si los datos son inválidos
   */
  async updateReservationSchoolsStep3(data: UpdateReservationSchoolStep3Request): Promise<ReservationSchoolCUApiResponse> {
    const { execute } = useApiPut<ReservationSchoolCUApiResponse>(
      API_ENDPOINTS.reservation.school.updateReservationSchoolsStep3,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Obtiene el paso 3 de una reservación escolar en específico por su reservationId
   * @param {number} reservationId - reservationId del paso 3 de la reservación escolar a buscar
   * @returns {Promise<ReservationSchoolStep3ApiResponse>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getReservationSchoolStep3(reservationId: number): Promise<ReservationSchoolStep3ApiResponse> {
    const { execute } = useApiFetch<ReservationSchoolStep3ApiResponse>(
      API_ENDPOINTS.reservation.school.getReservationSchoolStep3(reservationId), 
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // MÉTODOS DE CONSULTA Y GESTIÓN
  // ========================================================================

  /**
   * Obtiene los objetivos de la visita aplicables para la reservación escolar
   * @returns {Promise<ReservationSchoolObjectiveVisitListApiResponse>} Lista de objetivos de visita para reservación escolar
   * @throws {Error} Error si no se pueden cargar los objetivos de visita para reservación escolar
   */
  async getAllReservationSchoolObjectiveVisit(): Promise<ReservationSchoolObjectiveVisitListApiResponse> {
    const { execute } = useApiFetch<ReservationSchoolObjectiveVisitListApiResponse>(
      API_ENDPOINTS.reservation.school.getAllReservationSchoolObjectiveVisit, 
      { immediate: false }
    )
    
    return execute()
  }

  /**
   * Obtiene los niveles academicos aplicables para la reservación escolar
   * @param {ReservationSchoolAcademicLevelsFilters} [academicLevelFilters] - Filtros opcionales para la consulta de filtrado de niveles academicos para reservación escolar
   * @returns {Promise<ReservationSchoolListAcademicLevelApiResponse>} Lista de niveles academicos para reservación escolar
   * @throws {Error} Error si no se pueden cargar los niveles academicos para reservación escolar
   */
  async getAllReservationSchoolAcademicLevels(academicLevelFilters?: ReservationSchoolAcademicLevelsFilters): Promise<ReservationSchoolListAcademicLevelApiResponse> {
    const { execute } = useApiFetch<ReservationSchoolListAcademicLevelApiResponse>(
      API_ENDPOINTS.reservation.school.getAllReservationSchoolAcademicLevels, 
      { immediate: false }
    )
    
    const params = academicLevelFilters ? Object.entries(academicLevelFilters).reduce((acc, [key, value]) => {
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
      API_ENDPOINTS.reservation.school.checkReservationSchoolHasDisability(reservationId),
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  // ========================================================================
  // MÉTODOS AUXILIARES PARA VERIFICAR EXISTENCIA DE PASOS
  // ========================================================================
  /**
   * Verifica si existe el paso 1 de una reservación escolar
   * @param {number} reservationId - ID de la reservación escolar
   * @returns {Promise<boolean>} True si existe el paso 1
   */
  async hasStep1(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationSchoolStep1(reservationId)
      return true
    } catch (error) {
      return false
    }
  }
  /**
   * Verifica si existe el paso 2 de una reservación escolar
   * @param {number} reservationId - ID de la reservación escolar
   * @returns {Promise<boolean>} True si existe el paso 2
   */
  async hasStep2(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationSchoolStep2(reservationId)
      return true
    } catch (error) {
      return false
    }
  }
  /**
   * Verifica si existe el paso 3 de una reservación escolar
   * @param {number} reservationId - ID de la reservación escolar
   * @returns {Promise<boolean>} True si existe el paso 3
   */
  async hasStep3(reservationId: number): Promise<boolean> {
    try {
      await this.getReservationSchoolStep3(reservationId)
      return true
    } catch (error) {
      return false
    }
  }
  /**
   * Obtiene el estado actual de una reservación escolar basado en los pasos existentes
   * @param {number} reservationId - ID de la reservación escolar
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
        const step3 = await this.getReservationSchoolStep3(reservationId)
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
 * @type {ReservationSchoolService}
 */
export const reservationSchoolService = new ReservationSchoolService() 