<template>
  <div class="mx-auto py-4">
    <DesktopNavigation title="Notificaciones" :showBackButton="true" @goBack="goBack" />
    <NotificationHeader title="Notificaciones" :showBackButton="true" @goBack="goBack" />

    <!-- Connection Status -->
    <div
      v-if="isConnected"
      class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
    >
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium text-green-800">
          Conectado - Recibiendo notificaciones en tiempo real
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-2 text-sm text-gray-600">Cargando notificaciones...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center gap-2">
        <span class="text-red-600">❌</span>
        <span class="text-sm text-red-800">{{ error }}</span>
        <button
          @click="clearError"
          class="ml-auto text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div v-else>
      <div v-if="!hasNotifications" class="text-center py-8 text-gray-500">
        <div class="text-4xl mb-2">🔔</div>
        <p>No tienes notificaciones</p>
        <button
          @click="loadNotifications"
          class="mt-2 text-sm text-primary hover:underline"
        >
          Cargar notificaciones
        </button>
      </div>

      <div v-else>
        <!-- Unread Counter -->
        <div v-if="unreadCount > 0" class="mb-3 flex items-center gap-2">
          <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{{
            unreadCount
          }}</span>
          <span class="text-sm text-gray-600">notificaciones sin leer</span>
        </div>

        <!-- Action Buttons -->
        <div class="mb-4 flex gap-2">
          <button
            @click="loadUnreadNotifications"
            class="flex-1 bg-primary text-white px-3 py-2 rounded text-sm hover:bg-primary/90"
          >
            🔄 Cargar No Leídas
          </button>
          <button
            @click="loadAllNotifications"
            class="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
          >
            📖 Cargar Todas
          </button>
        </div>

        <NotificationList
          :notifications="formattedNotifications"
          @markAsRead="handleMarkAsRead"
          @delete="handleDeleteNotification"
        />
      </div>
    </div>

    <!-- Real-time Notification Popup -->
    <div
      v-if="showRealTimeNotification"
      class="fixed top-4 right-4 bg-teal-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
    >
      <div class="flex items-center gap-2 mb-2">
        <div
          class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs"
        >
          🔔
        </div>
        <span class="font-semibold">Nueva Notificación</span>
      </div>
      <div class="text-sm">
        <div class="font-medium">{{ realTimeNotificationData.title }}</div>
        <div class="text-teal-100 mt-1">{{ realTimeNotificationData.detail }}</div>
        <div class="text-xs text-teal-200 mt-2 flex items-center gap-1">
          <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          {{ realTimeNotificationData.timeAgo }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NotificationList from "@/components/notifications/NotificationList.vue";
import { computed, onMounted, onUnmounted } from "vue";
import NotificationHeader from "@/components/notifications/NotificationHeader.vue";
import DesktopNavigation from "@/components/app/DesktopNavigation.vue";
import { useNotificationsWithSignalR } from "@/composables/notifications/useNotificationsWithSignalR";

// Definir nombre del componente para keepalive
defineOptions({
  name: "notifications-index",
});

const router = useRouter();

// ============================================================================
// SIGNALR NOTIFICATIONS COMPOSABLE
// ============================================================================

const {
  notifications,
  unreadCount,
  isLoading,
  error,
  showRealTimeNotification,
  realTimeNotificationData,
  hasNotifications,
  isConnected,
  loadNotifications: loadNotificationsAPI,
  markAsRead,
  deleteNotification,
  clearError,
  initialize,
  cleanup,
} = useNotificationsWithSignalR();

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const formattedNotifications = computed(() => {
  return notifications.value.map((notification) => ({
    type: getNotificationType(notification),
    title: notification.title || notification.Title || "Sin título",
    description: notification.detail || notification.Detail || "Sin descripción",
    inactive: notification.isRead || false,
    timeAgo: notification.timeAgo || notification.TimeAgo || "Hace un momento",
    notificationId: notification.notificationId,
    reservationId: notification.reservationId,
  }));
});

// ============================================================================
// METHODS
// ============================================================================

const getNotificationType = (notification: Record<string, any>): string => {
  // Mapear tipos de notificación del API a tipos del componente
  if (
    notification.title?.includes("confirmar") ||
    notification.title?.includes("confirm")
  ) {
    return "pending";
  }
  if (
    notification.title?.includes("confirmada") ||
    notification.title?.includes("confirmed")
  ) {
    return "confirmed";
  }
  if (
    notification.title?.includes("comentario") ||
    notification.title?.includes("comment")
  ) {
    return "comment";
  }
  if (notification.title?.includes("estatus") || notification.title?.includes("status")) {
    return "status";
  }
  if (
    notification.title?.includes("formulario") ||
    notification.title?.includes("form")
  ) {
    return "form";
  }
  return "info";
};

const loadNotifications = async () => {
  try {
    // Usar visitorId = 1 por defecto, en producción esto vendría del usuario autenticado
    const visitorId = 1;
    await loadNotificationsAPI(visitorId, false);
  } catch (err: any) {
    console.error("Error cargando notificaciones:", err);
  }
};

const loadUnreadNotifications = async () => {
  try {
    const visitorId = 1;
    await loadNotificationsAPI(visitorId, false);
  } catch (err: any) {
    console.error("Error cargando notificaciones no leídas:", err);
  }
};

const loadAllNotifications = async () => {
  try {
    const visitorId = 1;
    await loadNotificationsAPI(visitorId, true);
  } catch (err: any) {
    console.error("Error cargando todas las notificaciones:", err);
  }
};

const handleMarkAsRead = async (notificationId: number) => {
  try {
    const visitorId = 1;
    await markAsRead(notificationId, visitorId);
  } catch (err: any) {
    console.error("Error marcando como leída:", err);
  }
};

const handleDeleteNotification = async (notificationId: number) => {
  if (!confirm("¿Estás seguro de eliminar esta notificación?")) return;

  try {
    const visitorId = 1;
    await deleteNotification(notificationId, visitorId);
  } catch (err: any) {
    console.error("Error eliminando notificación:", err);
  }
};

const goBack = () => {
  router.push("/reservations");
};

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(async () => {
  try {
    // Auto-conectar y cargar notificaciones
    const visitorId = 1;
    await initialize(visitorId, true);
  } catch (err: any) {
    console.error("Error inicializando notificaciones:", err);
  }
});

onUnmounted(() => {
  cleanup();
});
</script>
