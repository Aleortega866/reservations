// ============================================================================
// USE NOTIFICATIONS WITH SIGNALR - Composable para notificaciones con SignalR
// ============================================================================

import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'

export function useNotificationsWithSignalR() {
  // ========================================================================
  // CONFIGURACIÓN
  // ========================================================================
  
  const BASE_URL = 'https://api-mider-dev.buzzword.com.mx';
  const API_BASE = `${BASE_URL}/api`;

  // ========================================================================
  // SIGNALR PLUGIN
  // ========================================================================
  
  const { $signalr } = useNuxtApp();

  // ========================================================================
  // ESTADOS REACTIVOS
  // ========================================================================

  const notifications = ref<any[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const showRealTimeNotification = ref(false)
  const realTimeNotificationData = ref({
    title: '',
    detail: '',
    timeAgo: ''
  })

  // ========================================================================
  // COMPUTED PROPERTIES
  // ========================================================================

  const hasNotifications = computed(() => notifications.value.length > 0)
  const hasUnreadNotifications = computed(() => unreadCount.value > 0)
  const isConnected = computed(() => $signalr?.isConnected?.value ?? false)
  const connectionState = computed(() => $signalr?.connectionState?.value ?? 'Disconnected')

  // ========================================================================
  // MÉTODOS DE API
  // ========================================================================

  const loadNotifications = async (visitorId: number, includeRead: boolean = false): Promise<void> => {
    if (!visitorId) {
      throw new Error('ID de visitante es requerido')
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`${API_BASE}/reservationnotifications/GetAllAsync?visitorId=${visitorId}&includeRead=${includeRead}`)
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.isValid && result.response) {
        notifications.value = result.response
      } else {
        throw new Error(result.comments || 'Error cargando notificaciones')
      }
    } catch (err: any) {
      console.error('Error cargando notificaciones:', err)
      error.value = err.message || 'Error cargando notificaciones'
      notifications.value = []
    } finally {
      isLoading.value = false
    }
  }

  const updateUnreadCounter = async (visitorId: number): Promise<void> => {
    if (!visitorId) return

    try {
      const response = await fetch(`${API_BASE}/reservationnotifications/GetUnreadCountAsync?visitorId=${visitorId}`)
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.isValid && result.response) {
        unreadCount.value = result.response.count
      } else {
        console.error('Error en respuesta del contador:', result.comments)
        unreadCount.value = 0
      }
    } catch (err: any) {
      console.error('Error obteniendo contador:', err)
      unreadCount.value = 0
    }
  }

  const markAsRead = async (notificationId: number, visitorId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/reservationnotifications/MarkAsReadAsync?notificationId=${notificationId}&visitorId=${visitorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.isValid) {
        // Actualizar el estado local
        const notification = notifications.value.find(n => n.notificationId === notificationId)
        if (notification) {
          notification.isRead = true
        }
        
        // Actualizar contador
        if (unreadCount.value > 0) {
          unreadCount.value--
        }
        
        return true
      } else {
        throw new Error(result.comments || 'Error marcando como leída')
      }
    } catch (err: any) {
      console.error('Error marcando como leída:', err)
      throw err
    }
  }

  const deleteNotification = async (notificationId: number, visitorId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/reservationnotifications/DeleteAsync?notificationId=${notificationId}&visitorId=${visitorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.isValid) {
        // Remover de la lista local
        const index = notifications.value.findIndex(n => n.notificationId === notificationId)
        if (index !== -1) {
          const notification = notifications.value[index]
          notifications.value.splice(index, 1)
          
          // Actualizar contador si no estaba leída
          if (!notification.isRead && unreadCount.value > 0) {
            unreadCount.value--
          }
        }
        
        return true
      } else {
        throw new Error(result.comments || 'Error eliminando notificación')
      }
    } catch (err: any) {
      console.error('Error eliminando notificación:', err)
      throw err
    }
  }

  // ========================================================================
  // MÉTODOS DE SIGNALR
  // ========================================================================

  const connectToHub = async (visitorId: number): Promise<void> => {
    if (!process.client || !$signalr) {
      console.warn('SignalR no está disponible (SSR o plugin no cargado)')
      return
    }
    
    try {
      await $signalr.connectToHub(visitorId)
      console.log('Conectado al Hub SignalR para visitante:', visitorId)
    } catch (err: any) {
      console.error('Error conectando a SignalR:', err)
      throw new Error(`Error conectando: ${err.message}`)
    }
  }

  const disconnectFromHub = async (): Promise<void> => {
    if (!process.client || !$signalr) {
      console.warn('SignalR no está disponible (SSR o plugin no cargado)')
      return
    }
    
    try {
      await $signalr.disconnectFromHub()
      console.log('Desconectado del Hub SignalR')
    } catch (err: any) {
      console.error('Error desconectando de SignalR:', err)
      throw new Error(`Error desconectando: ${err.message}`)
    }
  }

  // ========================================================================
  // MÉTODOS DE NOTIFICACIONES EN TIEMPO REAL
  // ========================================================================

  const showRealTimeNotificationPopup = (notification: any): void => {
    console.log('Mostrando notificación en tiempo real:', notification)
    
    realTimeNotificationData.value = {
      title: notification.Title || notification.title || 'Nueva Notificación',
      detail: notification.Detail || notification.detail || 'Sin detalle',
      timeAgo: notification.TimeAgo || notification.timeAgo || 'Justo ahora'
    }
    
    showRealTimeNotification.value = true
    
    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
      showRealTimeNotification.value = false
    }, 8000)
  }

  const hideRealTimeNotification = (): void => {
    showRealTimeNotification.value = false
  }

  // ========================================================================
  // MÉTODOS DE UTILIDAD
  // ========================================================================

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  const clearError = (): void => {
    error.value = null
  }

  const refreshNotifications = async (visitorId: number, includeRead: boolean = false): Promise<void> => {
    await Promise.all([
      loadNotifications(visitorId, includeRead),
      updateUnreadCounter(visitorId)
    ])
  }

  // ========================================================================
  // SETUP DE SIGNALR
  // ========================================================================

  let notificationHandler: ((notification: any) => void) | null = null

  const setupSignalRHandlers = (visitorId: number): void => {
    if (!process.client || !$signalr) {
      console.warn('SignalR no está disponible (SSR o plugin no cargado)')
      return
    }
    
    // Limpiar handler anterior si existe
    if (notificationHandler) {
      $signalr.offNotificationReceived(notificationHandler)
    }

    // Crear nuevo handler
    notificationHandler = (notification: any) => {
      console.log('Nueva notificación recibida via SignalR:', notification)
      
      // Mostrar popup
      showRealTimeNotificationPopup(notification)
      
      // Actualizar datos
      refreshNotifications(visitorId, false)
    }

    // Registrar handler
    $signalr.onNotificationReceived(notificationHandler)
  }

  const cleanupSignalRHandlers = (): void => {
    if (!process.client || !$signalr) {
      return
    }
    
    if (notificationHandler) {
      $signalr.offNotificationReceived(notificationHandler)
      notificationHandler = null
    }
  }

  // ========================================================================
  // LIFECYCLE HOOKS
  // ========================================================================

  const initialize = async (visitorId: number, autoConnect: boolean = true): Promise<void> => {
    try {
      if (autoConnect) {
        await connectToHub(visitorId)
        setupSignalRHandlers(visitorId)
      }
      
      await refreshNotifications(visitorId, false)
    } catch (err: any) {
      console.error('Error inicializando notificaciones:', err)
      error.value = err.message
    }
  }

  const cleanup = (): void => {
    cleanupSignalRHandlers()
    
    if (process.client && $signalr && isConnected.value) {
      disconnectFromHub()
    }
    
    // Limpiar estado
    notifications.value = []
    unreadCount.value = 0
    error.value = null
    showRealTimeNotification.value = false
  }

  // ========================================================================
  // RETORNO DEL COMPOSABLE
  // ========================================================================

  return {
    // Estados
    notifications: readonly(notifications),
    unreadCount: readonly(unreadCount),
    isLoading: readonly(isLoading),
    error: readonly(error),
    showRealTimeNotification: readonly(showRealTimeNotification),
    realTimeNotificationData: readonly(realTimeNotificationData),

    // Computed
    hasNotifications,
    hasUnreadNotifications,
    isConnected,
    connectionState,

    // Métodos de API
    loadNotifications,
    updateUnreadCounter,
    markAsRead,
    deleteNotification,

    // Métodos de SignalR
    connectToHub,
    disconnectFromHub,

    // Métodos de notificaciones en tiempo real
    showRealTimeNotificationPopup,
    hideRealTimeNotification,

    // Métodos de utilidad
    formatDate,
    clearError,
    refreshNotifications,

    // Lifecycle
    initialize,
    cleanup
  }
}
