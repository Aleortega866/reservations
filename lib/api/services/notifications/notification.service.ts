// ============================================================================
// NOTIFICATION SERVICE - Servicio de Notificaciones
// ============================================================================

import { useApiFetch, useApiPost, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  GetAllNotificationsResponse,
  GetNotificationsParams,
  UnreadCountResponse,
  MarkAsReadParams,
  MarkAsReadResponse,
  DeleteNotificationParams,
  DeleteNotificationResponse
} from '../../types/notifications'

/**
 * Servicio de notificaciones que maneja todas las operaciones relacionadas
 * con notificaciones de reservaciones
 * @class NotificationService
 */
export class NotificationService {
  
  // ========================================================================
  // MÉTODOS DE CONSULTA
  // ========================================================================

  /**
   * Obtiene todas las notificaciones de un visitante
   * @param {GetNotificationsParams} params - Parámetros de consulta
   * @param {number} params.visitorId - ID del visitante
   * @param {boolean} [params.includeRead=false] - Si incluir notificaciones leídas
   * @returns {Promise<GetAllNotificationsResponse>} Lista de notificaciones
   * @throws {Error} Error si no se pueden obtener las notificaciones
   */
  async getAllNotifications(params: GetNotificationsParams): Promise<GetAllNotificationsResponse> {
    const { execute } = useApiFetch<GetAllNotificationsResponse>(
      API_ENDPOINTS.notifications.getAll,
      { immediate: false }
    )
    return execute({
      query: {
        VisitorId: params.visitorId,
        IncludeRead: params.includeRead ?? false
      }
    })
  }

  /**
   * Obtiene el conteo de notificaciones no leídas de un visitante
   * @param {number} visitorId - ID del visitante
   * @returns {Promise<UnreadCountResponse>} Conteo de notificaciones no leídas
   * @throws {Error} Error si no se puede obtener el conteo
   */
  async getUnreadCount(visitorId: number): Promise<UnreadCountResponse> {
    const { execute } = useApiFetch<UnreadCountResponse>(
      API_ENDPOINTS.notifications.getUnreadCount,
      { immediate: false }
    )
    return execute({
      query: {
        VisitorId: visitorId
      }
    })
  }

  // ========================================================================
  // MÉTODOS DE ACTUALIZACIÓN
  // ========================================================================

  /**
   * Marca una notificación como leída
   * @param {MarkAsReadParams} params - Parámetros para marcar como leída
   * @param {number} params.notificationId - ID de la notificación
   * @param {number} params.visitorId - ID del visitante
   * @returns {Promise<MarkAsReadResponse>} Confirmación de la operación
   * @throws {Error} Error si no se puede marcar como leída
   */
  async markAsRead(params: MarkAsReadParams): Promise<MarkAsReadResponse> {
    const { execute } = useApiFetch<MarkAsReadResponse>(
      API_ENDPOINTS.notifications.markAsRead,
      { method: 'PUT', immediate: false }
    )
    return execute({
      query: {
        NotificationId: params.notificationId,
        VisitorId: params.visitorId
      }
    })
  }

  // ========================================================================
  // MÉTODOS DE ELIMINACIÓN
  // ========================================================================

  /**
   * Elimina una notificación
   * @param {DeleteNotificationParams} params - Parámetros para eliminar
   * @param {number} params.notificationId - ID de la notificación
   * @param {number} params.visitorId - ID del visitante
   * @returns {Promise<DeleteNotificationResponse>} Confirmación de la eliminación
   * @throws {Error} Error si no se puede eliminar la notificación
   */
  async deleteNotification(params: DeleteNotificationParams): Promise<DeleteNotificationResponse> {
    const { execute } = useApiDelete<DeleteNotificationResponse>(
      API_ENDPOINTS.notifications.delete,
      { immediate: false }
    )
    return execute({
      body: {
        notificationId: params.notificationId,
        visitorId: params.visitorId
      }
    })
  }

  // ========================================================================
  // MÉTODOS DE UTILIDAD
  // ========================================================================

  /**
   * Obtiene solo las notificaciones no leídas
   * @param {number} visitorId - ID del visitante
   * @returns {Promise<GetAllNotificationsResponse>} Lista de notificaciones no leídas
   */
  async getUnreadNotifications(visitorId: number): Promise<GetAllNotificationsResponse> {
    return this.getAllNotifications({
      visitorId,
      includeRead: false
    })
  }

  /**
   * Obtiene todas las notificaciones (leídas y no leídas)
   * @param {number} visitorId - ID del visitante
   * @returns {Promise<GetAllNotificationsResponse>} Lista completa de notificaciones
   */
  async getAllNotificationsIncludingRead(visitorId: number): Promise<GetAllNotificationsResponse> {
    return this.getAllNotifications({
      visitorId,
      includeRead: true
    })
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de notificaciones
 * @type {NotificationService}
 */
export const notificationService = new NotificationService()
