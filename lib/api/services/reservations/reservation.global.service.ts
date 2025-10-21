// ============================================================================
// RESERVATION GLOBAL SERVICE - Servicio Global para Todas las Operaciones de Reservaciones
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { GetReservationQRResponse } from '../../types/reservation'

/**
 * Respuesta de la API para confirmar reservación
 */
export interface ConfirmReservationApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: any
  token: string
}

/**
 * Respuesta de la API para cancelar reservación
 */
export interface CancelReservationApiResponse {
  success: boolean
  message: string
  comments?: string
  data?: any
  code?: number
  isValid?: boolean
  response?: any
  token?: string
}

/**
 * Parámetros para confirmar una reservación
 */
export interface ConfirmReservationRequest {
  reservationId: number
}

/**
 * Parámetros para cancelar una reservación
 */
export interface CancelReservationRequest {
  reservationId: number
  cancelationTypeId: number
}

/**
 * Servicio global para todas las operaciones de reservaciones
 * Maneja confirmación, cancelación y otras operaciones comunes
 * @class ReservationGlobalService
 */
export class ReservationGlobalService {
  
  // ========================================================================
  // OPERACIONES DE CONFIRMACIÓN
  // ========================================================================
  
  /**
   * Confirma una reservación por su ID
   * @param {number} reservationId - ID de la reservación a confirmar
   * @returns {Promise<ConfirmReservationApiResponse>} Resultado de la confirmación
   * @throws {Error} Error si no se puede confirmar la reservación
   */
  async confirmReservation(reservationId: number): Promise<ConfirmReservationApiResponse> {
    const { execute } = useApiFetch<ConfirmReservationApiResponse>(
      API_ENDPOINTS.reservation.confirmReservation,
      { immediate: false }
    )
    
    return execute({ 
      query: { reservationId } 
    })
  }

  // ========================================================================
  // OPERACIONES DE CANCELACIÓN
  // ========================================================================
  
  /**
   * Cancela una reservación por su ID
   * @param {number} reservationId - ID de la reservación a cancelar
   * @param {number} cancelationTypeId - ID del tipo de cancelación
   * @returns {Promise<CancelReservationApiResponse>} Resultado de la cancelación
   * @throws {Error} Error si no se puede cancelar la reservación
   */
  async cancelReservation(reservationId: number, cancelationTypeId: number): Promise<CancelReservationApiResponse> {
    const { execute } = useApiDelete<CancelReservationApiResponse>(
      API_ENDPOINTS.reservation.cancelReservation,
      { immediate: false }
    )
    
    return execute({ 
      body: { 
        reservationId, 
        cancelationTypeId
      } 
    })
  }

  // ========================================================================
  // OPERACIONES DE CONSULTA
  // ========================================================================
  
  /**
   * Obtiene el estado de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<any>} Estado de la reservación
   * @throws {Error} Error si no se puede obtener el estado
   */
  async getReservationStatus(reservationId: number): Promise<any> {
    const { execute } = useApiFetch<any>(
      `/api/Reservation/GetReservationStatusAsync/${reservationId}`,
      { immediate: false }
    )
    
    return execute()
  }

  /**
   * Obtiene el código QR de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<GetReservationQRResponse>} Código QR de la reservación
   * @throws {Error} Error si no se puede obtener el QR
   */
  async getReservationQR(reservationId: number): Promise<GetReservationQRResponse> {
    const { execute } = useApiFetch<GetReservationQRResponse>(
      API_ENDPOINTS.reservation.getReservationQR(reservationId),
      { immediate: false }
    )
    
    return execute()
  }

  /**
   * Obtiene los detalles de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<any>} Detalles de la reservación
   * @throws {Error} Error si no se puede obtener la reservación
   */
  async getReservationDetails(reservationId: number): Promise<any> {
    const { execute } = useApiFetch<any>(
      `/api/Reservation/GetReservationDetailsAsync/${reservationId}`,
      { immediate: false }
    )
    
    return execute()
  }

  // ========================================================================
  // OPERACIONES DE ACTUALIZACIÓN
  // ========================================================================
  
  /**
   * Actualiza el estado de una reservación
   * @param {number} reservationId - ID de la reservación
   * @param {string} status - Nuevo estado
   * @returns {Promise<any>} Resultado de la actualización
   * @throws {Error} Error si no se puede actualizar la reservación
   */
  async updateReservationStatus(reservationId: number, status: string): Promise<any> {
    const { execute } = useApiPut<any>(
      '/api/Reservation/UpdateReservationStatusAsync',
      { immediate: false }
    )
    
    return execute({ 
      body: { 
        reservationId, 
        status 
      } 
    })
  }

  // ========================================================================
  // OPERACIONES DE NOTIFICACIÓN
  // ========================================================================
  
  /**
   * Envía una notificación relacionada con una reservación
   * @param {number} reservationId - ID de la reservación
   * @param {string} type - Tipo de notificación
   * @param {string} message - Mensaje de la notificación
   * @returns {Promise<any>} Resultado del envío
   * @throws {Error} Error si no se puede enviar la notificación
   */
  async sendReservationNotification(reservationId: number, type: string, message: string): Promise<any> {
    const { execute } = useApiPost<any>(
      '/api/Reservation/SendNotificationAsync',
      { immediate: false }
    )
    
    return execute({ 
      body: { 
        reservationId, 
        type, 
        message 
      } 
    })
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio global de reservaciones
 * @type {ReservationGlobalService}
 */
export const reservationGlobalService = new ReservationGlobalService()
