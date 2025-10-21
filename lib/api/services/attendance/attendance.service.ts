// ============================================================================
// ATTENDANCE SERVICE - Servicio de Gestión de Asistencias
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  AttendanceReservation,
  AddAttendanceReservationRequest,
  UpdateAttendanceReservationRequest,
  UpdateVisitStatusRequest,
  AttendanceFilters
} from '../../types/attendance'

/**
 * Servicio de gestión de asistencias que maneja reservaciones y estados de visita
 * @class AttendanceService
 */
export class AttendanceService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene las reservaciones de asistencia por día específico
   * @param {string} date - Fecha en formato string para filtrar reservaciones
   * @returns {Promise<AttendanceReservation[]>} Lista de reservaciones del día
   * @throws {Error} Error si no se pueden cargar las reservaciones
   */
  async getReservationByDay(date: string): Promise<AttendanceReservation[]> {
    const { execute } = useApiFetch<AttendanceReservation[]>(
      `${API_ENDPOINTS.attendance.getReservationByDay}?date=${date}`,
      { immediate: false }
    )
    return execute()
  }

  /**
   * Obtiene las asistencias con filtros opcionales
   * @param {AttendanceFilters} [filters] - Filtros opcionales para la consulta
   * @returns {Promise<AttendanceReservation[]>} Lista de asistencias filtradas
   * @throws {Error} Error si no se pueden cargar las asistencias
   */
  async getAttendance(filters?: AttendanceFilters): Promise<AttendanceReservation[]> {
    const { execute } = useApiFetch<AttendanceReservation[]>(
      API_ENDPOINTS.attendance.getAttendance,
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
  // MÉTODOS CRUD - POST (CREACIÓN)
  // ========================================================================

  /**
   * Agrega una nueva reservación de asistencia
   * @param {AddAttendanceReservationRequest} data - Datos de la nueva reservación
   * @returns {Promise<AttendanceReservation>} Información de la reservación creada
   * @throws {Error} Error si los datos son inválidos
   */
  async addAttendanceReservation(data: AddAttendanceReservationRequest): Promise<AttendanceReservation> {
    const { execute } = useApiPost<AttendanceReservation>(
      API_ENDPOINTS.attendance.addReservation,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN)
  // ========================================================================

  /**
   * Actualiza el estado de una visita
   * @param {UpdateVisitStatusRequest} data - Datos para actualizar el estado
   * @returns {Promise<void>} Confirmación de actualización
   * @throws {Error} Error si la reservación no existe
   */
  async updateVisitStatus(data: UpdateVisitStatusRequest): Promise<void> {
    const { execute } = useApiPut(
      API_ENDPOINTS.attendance.updateVisitStatus,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Actualiza una reservación de asistencia existente
   * @param {UpdateAttendanceReservationRequest} data - Nuevos datos de la reservación
   * @returns {Promise<AttendanceReservation>} Información de la reservación actualizada
   * @throws {Error} Error si la reservación no existe o datos inválidos
   */
  async updateAttendanceReservation(data: UpdateAttendanceReservationRequest): Promise<AttendanceReservation> {
    const { execute } = useApiPut<AttendanceReservation>(
      API_ENDPOINTS.attendance.updateReservation,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina una reservación de asistencia
   * @param {string} id - ID de la reservación a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si la reservación no existe
   */
  async deleteAttendanceReservation(id: string): Promise<void> {
    const { execute } = useApiDelete(
      `${API_ENDPOINTS.attendance.deleteReservation}?id=${id}`,
      { immediate: false }
    )
    return execute()
  }

  // ========================================================================
  // MÉTODOS ESPECÍFICOS DE ASISTENCIA
  // ========================================================================

  /**
   * Registra el check-in de una reservación (entrada)
   * @param {string} reservationId - ID de la reservación
   * @returns {Promise<void>} Confirmación de check-in
   * @throws {Error} Error si la reservación no existe
   */
  async checkIn(reservationId: string): Promise<void> {
    return this.updateVisitStatus({
      reservationId,
      status: 'in-progress',
      checkInTime: new Date().toISOString()
    })
  }

  /**
   * Registra el check-out de una reservación (salida)
   * @param {string} reservationId - ID de la reservación
   * @returns {Promise<void>} Confirmación de check-out
   * @throws {Error} Error si la reservación no existe
   */
  async checkOut(reservationId: string): Promise<void> {
    return this.updateVisitStatus({
      reservationId,
      status: 'completed',
      checkOutTime: new Date().toISOString()
    })
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de asistencias
 * @type {AttendanceService}
 */
export const attendanceService = new AttendanceService() 