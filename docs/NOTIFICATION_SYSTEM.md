# Sistema de Notificaciones con SignalR

Este documento describe el sistema de notificaciones implementado que utiliza SignalR para notificaciones en tiempo real.

## Arquitectura

El sistema está compuesto por los siguientes elementos:

### 1. Servicios API (`lib/api/services/notifications/`)
- **NotificationService**: Maneja todas las operaciones CRUD con la API
- **Endpoints configurados**:
  - `GET /api/ReservationNotifications/GetAllAsync` - Obtener todas las notificaciones
  - `GET /api/ReservationNotifications/GetUnreadCountAsync` - Obtener conteo de no leídas
  - `GET /api/ReservationNotifications/MarkAsReadAsync` - Marcar como leída
  - `DELETE /api/ReservationNotifications/DeleteAsync` - Eliminar notificación

### 2. Composables (`composables/notifications/`)
- **useNotifications**: Composable principal que maneja el estado y operaciones
- **useSignalR**: Composable especializado para la conexión SignalR

### 3. Componentes (`components/notifications/`)
- **NotificationCenter**: Centro completo de notificaciones
- **NotificationBadge**: Badge con dropdown para mostrar notificaciones recientes

### 4. Tipos TypeScript (`lib/api/types/notifications/`)
- Interfaces completas para todas las estructuras de datos
- Tipos para eventos de SignalR
- Configuración de conexión

## Configuración de SignalR

### URL del Hub
```
https://api-mider-dev.buzzword.com.mx/reservationNotificationsHub
```

### Eventos de SignalR
- `NuevaNotificacion`: Nueva notificación recibida
- `UnreadCountUpdate`: Actualización del conteo de no leídas
- `NotificationRead`: Notificación marcada como leída
- `NotificationDeleted`: Notificación eliminada

### Métodos de SignalR
- `JoinUserGroup(visitorId: string)`: Unirse al grupo del usuario para recibir notificaciones (el hub espera el identificador como cadena)

## Uso Básico

### 1. Inicializar el sistema

```vue
<script setup lang="ts">
import { useNotifications } from '@/composables/notifications'

const { initialize, notifications, unreadCount } = useNotifications()

onMounted(async () => {
  await initialize(visitorId, false) // false = solo no leídas
})
</script>
```

### 2. Usar el composable completo

```vue
<script setup lang="ts">
import { useNotifications } from '@/composables/notifications'

const {
  // Estados
  notifications,
  unreadCount,
  isLoading,
  error,
  connectionState,
  isConnected,
  
  // Métodos
  loadNotifications,
  markAsRead,
  deleteNotification,
  initialize,
  cleanup
} = useNotifications()
</script>
```

### 3. Usar componentes

```vue
<template>
  <!-- Badge en el header -->
  <NotificationBadge 
    :visitor-id="visitorId" 
    @view-all="navigateToNotifications"
  />

  <!-- Centro completo de notificaciones -->
  <NotificationCenter 
    :visitor-id="visitorId" 
    :auto-load="true"
  />
</template>
```

## Configuración Avanzada

### Personalizar configuración de SignalR

```typescript
import { useSignalR } from '@/composables/notifications/useSignalR'

const signalR = useSignalR()

signalR.configure({
  baseUrl: 'https://api-mider-dev.buzzword.com.mx',
  hubUrl: 'https://api-mider-dev.buzzword.com.mx/reservationNotificationsHub',
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
})
```

### Manejar eventos personalizados

```typescript
const events = {
  onNewNotification: (notification) => {
    console.log('Nueva notificación:', notification)
    // Mostrar toast, sonido, etc.
  },
  onUnreadCountUpdate: (count) => {
    console.log('Conteo actualizado:', count)
  },
  onNotificationRead: (notificationId) => {
    console.log('Notificación leída:', notificationId)
  },
  onNotificationDeleted: (notificationId) => {
    console.log('Notificación eliminada:', notificationId)
  }
}

await signalR.initialize(events)
await signalR.startConnection() // Esto también ejecutará JoinUserGroup automáticamente
```

## Estructura de Datos

### Notificación

```typescript
interface Notification {
  notificationId: number
  visitorId: number
  reservationId: number
  title: string
  detail: string
  isRead: boolean
  isDeleted: boolean
  icon: string
  createdDate: string
  formattedDate: string
  timeAgo: string
}
```

### Respuesta de la API

```typescript
interface GetAllNotificationsResponse {
  code: number
  isValid: boolean
  comments: string
  response: Notification[]
  token: string
}
```

## Estados de Conexión

- `Disconnected`: No conectado
- `Connecting`: Conectando
- `Connected`: Conectado
- `Reconnecting`: Reconectando
- `Disconnecting`: Desconectando

## Manejo de Errores

El sistema incluye manejo automático de errores:

1. **Reconexión automática**: Se intenta reconectar automáticamente
2. **Límite de intentos**: Máximo 5 intentos de reconexión
3. **Fallback**: Si SignalR falla, las operaciones siguen funcionando via API
4. **Notificaciones de error**: Se muestran toasts para errores importantes

## Mejores Prácticas

### 1. Inicialización
- Inicializar el sistema una sola vez por sesión
- Usar `cleanup()` al desmontar componentes
- Verificar que el visitorId esté disponible antes de inicializar

### 2. Gestión de Estado
- Usar los estados reactivos del composable
- No modificar directamente los arrays de notificaciones
- Usar los métodos proporcionados para operaciones CRUD

### 3. Performance
- Cargar solo notificaciones no leídas por defecto
- Usar paginación para listas grandes
- Limpiar conexiones al cambiar de página

### 4. UX
- Mostrar indicadores de conexión
- Proporcionar feedback visual para acciones
- Manejar estados de carga y error

## Ejemplos de Integración

### En el Header

```vue
<template>
  <header>
    <NotificationBadge 
      :visitor-id="currentUser.visitorId"
      @view-all="navigateToNotifications"
    />
  </header>
</template>
```

### En una Página

```vue
<template>
  <div>
    <h1>Notificaciones</h1>
    <NotificationCenter 
      :visitor-id="currentUser.visitorId"
      :auto-load="true"
    />
  </div>
</template>
```

### En un Componente Personalizado

```vue
<script setup lang="ts">
import { useNotifications } from '@/composables/notifications'

const { 
  notifications, 
  unreadCount, 
  markAsRead 
} = useNotifications()

const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    await markAsRead(notification.notificationId, visitorId)
  }
  // Navegar a la página relevante
}
</script>
```

## Troubleshooting

### SignalR no se conecta
1. Verificar que la URL del hub sea correcta
2. Comprobar que el visitorId sea válido
3. Revisar la consola para errores de CORS
4. Verificar que el servidor SignalR esté funcionando

### Notificaciones no se actualizan
1. Verificar el estado de conexión
2. Comprobar que los eventos estén configurados correctamente
3. Revisar la consola para errores de JavaScript

### Errores de API
1. Verificar que el token de autenticación sea válido
2. Comprobar que los endpoints estén disponibles
3. Revisar los logs del servidor

## Dependencias

- **SignalR**: `microsoft-signalr@8.0.17`
- **Vue 3**: Composition API
- **Nuxt 3**: Framework
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Lucide Icons**: Iconografía



