// ============================================================================
// NOTIFICATION TYPES - Tipos para el sistema de notificaciones
// ============================================================================

/**
 * Notificación individual del sistema
 */
export interface Notification {
  /** ID único de la notificación */
  notificationId: number
  /** ID del visitante al que pertenece la notificación */
  visitorId: number
  /** ID de la reservación relacionada */
  reservationId: number
  /** Título de la notificación */
  title: string
  /** Detalle o descripción de la notificación */
  detail: string
  /** Indica si la notificación ha sido leída */
  isRead: boolean
  /** Indica si la notificación ha sido eliminada */
  isDeleted: boolean
  /** Icono de la notificación (formato de icono) */
  icon: string
  /** Fecha de creación en formato ISO */
  createdDate: string
  /** Fecha formateada para mostrar */
  formattedDate: string
  /** Tiempo transcurrido desde la creación */
  timeAgo: string
}

/**
 * Respuesta de la API para obtener todas las notificaciones
 */
export interface GetAllNotificationsResponse {
  /** Código de respuesta HTTP */
  code: number
  /** Indica si la respuesta es válida */
  isValid: boolean
  /** Comentarios de la respuesta */
  comments: string
  /** Array de notificaciones */
  response: Notification[]
  /** Token de autenticación */
  token: string
}

/**
 * Parámetros para obtener notificaciones
 */
export interface GetNotificationsParams {
  /** ID del visitante */
  visitorId: number
  /** Si incluir notificaciones leídas (por defecto false) */
  includeRead?: boolean
}

/**
 * Respuesta para el conteo de notificaciones no leídas
 */
export interface UnreadCountResponse {
  /** Código de respuesta HTTP */
  code: number
  /** Indica si la respuesta es válida */
  isValid: boolean
  /** Comentarios de la respuesta */
  comments: string
  /** Datos del conteo */
  response: {
    /** ID del visitante */
    visitorId: number
    /** Número de notificaciones no leídas */
    count: number
  }
  /** Token de autenticación */
  token: string
}

/**
 * Parámetros para marcar notificación como leída
 */
export interface MarkAsReadParams {
  /** ID de la notificación */
  notificationId: number
  /** ID del visitante */
  visitorId: number
}

/**
 * Respuesta al marcar notificación como leída
 */
export interface MarkAsReadResponse {
  /** Código de respuesta HTTP */
  code: number
  /** Indica si la respuesta es válida */
  isValid: boolean
  /** Comentarios de la respuesta */
  comments: string
  /** Datos de la operación */
  response: {
    /** ID de la notificación */
    notificationId: number
    /** ID del visitante */
    visitorId: number
    /** Indica si la operación fue exitosa */
    success: boolean
    /** Mensaje de confirmación */
    message: string
  }
  /** Token de autenticación */
  token: string
}

/**
 * Parámetros para eliminar notificación
 */
export interface DeleteNotificationParams {
  /** ID de la notificación */
  notificationId: number
  /** ID del visitante */
  visitorId: number
}

/**
 * Respuesta al eliminar notificación
 */
export interface DeleteNotificationResponse {
  /** Código de respuesta HTTP */
  code: number
  /** Indica si la respuesta es válida */
  isValid: boolean
  /** Comentarios de la respuesta */
  comments: string
  /** Datos de la operación */
  response: {
    /** ID de la notificación */
    notificationId: number
    /** ID del visitante */
    visitorId: number
    /** Indica si la operación fue exitosa */
    success: boolean
    /** Mensaje de confirmación */
    message: string
  }
  /** Token de autenticación */
  token: string
}

/**
 * Eventos de SignalR para notificaciones
 */
export interface NotificationSignalREvents {
  /** Evento cuando se recibe una nueva notificación */
  onNewNotification: (notification: Notification) => void
  /** Evento cuando se actualiza el conteo de no leídas */
  onUnreadCountUpdate: (count: number) => void
  /** Evento cuando se marca una notificación como leída */
  onNotificationRead: (notificationId: number) => void
  /** Evento cuando se elimina una notificación */
  onNotificationDeleted: (notificationId: number) => void
}

/**
 * Estado de conexión de SignalR
 */
export type SignalRConnectionState = 
  | 'Disconnected'
  | 'Connecting' 
  | 'Connected'
  | 'Reconnecting'
  | 'Disconnecting'

/**
 * Configuración para SignalR
 */
export interface SignalRConfig {
  /** URL base de la API */
  baseUrl: string
  /** URL del hub de SignalR */
  hubUrl: string
  /** ID del visitante actual */
  visitorId: number | null
  /** Configuración de reconexión automática */
  autoReconnect?: boolean
  /** Intervalo de reconexión en milisegundos */
  reconnectInterval?: number
  /** Número máximo de intentos de reconexión */
  maxReconnectAttempts?: number
}
