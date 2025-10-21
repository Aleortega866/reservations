<template>
  <div class="notification-page">
    <div class="container">
      <div class="header">
        <h1>🔔 Notificaciones SignalR</h1>
        <p>Recibe notificaciones en tiempo real de tu sistema</p>
      </div>

      <div class="content">
        <!-- Panel Izquierdo: Conexión y Envío -->
        <div class="left-panel">
          <div class="connection-status" :class="connectionStatusClass">
            <div class="status-dot" :class="statusDotClass"></div>
            <span>{{ connectionStatusText }}</span>
          </div>

          <div class="form-group">
            <label for="visitorId">ID del Visitante:</label>
            <input type="number" id="visitorId" v-model="visitorId" placeholder="Ej: 1" />
          </div>

          <button
            @click="handleConnect"
            :disabled="isConnecting || isConnected"
            class="btn-success"
          >
            🔌 Conectar al Hub
          </button>

          <button @click="handleDisconnect" :disabled="!isConnected" class="btn-danger">
            ❌ Desconectar
          </button>

          <hr style="margin: 20px 0; border: 1px solid #d2d6dc" />

          <div class="system-ready">
            <h4>✅ Sistema Listo</h4>
            <p>
              Las notificaciones se enviarán automáticamente cuando generes reservaciones
              desde tu sistema.
            </p>
          </div>
        </div>

        <!-- Panel Derecho: Lista de Notificaciones -->
        <div class="right-panel">
          <div class="notifications-header">
            <div class="flex items-center gap-2">
              <div class="unread-counter">{{ unreadCount }}</div>
              <h3>Notificaciones sin leer</h3>
            </div>
          </div>

          <button @click="loadUnreadNotifications" class="load-btn">
            🔄 Cargar Notificaciones No leídas
          </button>

          <button @click="loadAllNotifications" class="load-btn">
            📖 Cargar Todas (Leídas + No Leídas)
          </button>

          <div class="notifications-list">
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando notificaciones...</p>
            </div>

            <div v-else-if="error" class="error-state">
              <p>❌ Error: {{ error }}</p>
              <button @click="clearError" class="btn-small btn-success">
                Reintentar
              </button>
            </div>

            <div v-else-if="!hasNotifications" class="empty-state">
              Haz clic en "Cargar Notificaciones" para ver tus notificaciones
            </div>

            <div v-else>
              <div
                v-for="notification in notifications"
                :key="notification.notificationId"
                class="notification-item"
                :class="{ 'notification-unread': !notification.isRead }"
              >
                <div class="notification-title">
                  {{ notification.title }}
                  <span v-if="notification.icon" class="icon-badge">{{
                    notification.icon
                  }}</span>
                </div>

                <div class="notification-detail">{{ notification.detail }}</div>

                <div v-if="notification.reservationId" class="reservation-info">
                  📋 ID Reservación: #{{ notification.reservationId }}
                </div>

                <div v-if="notification.timeAgo" class="time-info">
                  ⏰ {{ notification.timeAgo }}
                  <span v-if="notification.formattedDate"
                    >• {{ notification.formattedDate }}</span
                  >
                </div>

                <div class="notification-time">
                  {{ formatDate(notification.createdDate) }}
                </div>

                <div class="notification-actions">
                  <button
                    v-if="!notification.isRead"
                    @click="handleMarkAsRead(notification.notificationId)"
                    class="btn-small btn-success"
                  >
                    ✓ Marcar Leída
                  </button>

                  <button
                    @click="handleDeleteNotification(notification.notificationId)"
                    class="btn-small btn-danger"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificación en tiempo real -->
    <div class="real-time-notification" :class="{ show: showRealTimeNotification }">
      <div class="notification-header-top">
        <div class="notification-icon">🔔</div>
        <div>Nueva Notificación</div>
      </div>
      <div class="notification-content">
        <div class="real-time-title">
          <span>✨</span>
          <span>{{ realTimeNotificationData.title }}</span>
        </div>
        <div class="real-time-detail">{{ realTimeNotificationData.detail }}</div>
        <div class="real-time-time">
          <div class="pulse-dot"></div>
          <span>{{ realTimeNotificationData.timeAgo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotificationsWithSignalR } from "@/composables/notifications/useNotificationsWithSignalR";

// ============================================================================
// ESTADOS REACTIVOS
// ============================================================================

const visitorId = ref(1);
const isConnecting = ref(false);

// ============================================================================
// COMPOSABLE DE NOTIFICACIONES
// ============================================================================

const {
  notifications,
  unreadCount,
  isLoading,
  error,
  showRealTimeNotification,
  realTimeNotificationData,
  hasNotifications,
  hasUnreadNotifications,
  isConnected,
  connectionState,
  loadNotifications,
  updateUnreadCounter,
  markAsRead,
  deleteNotification,
  connectToHub: connectToSignalR,
  disconnectFromHub: disconnectFromSignalR,
  formatDate,
  clearError,
  refreshNotifications,
  initialize,
  cleanup,
} = useNotificationsWithSignalR();

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const connectionStatusClass = computed(() =>
  isConnected.value ? "status-connected" : "status-disconnected"
);

const statusDotClass = computed(() => (isConnected.value ? "dot-green" : "dot-red"));

const connectionStatusText = computed(() =>
  isConnected.value ? `Conectado como Visitante #${visitorId.value}` : "Desconectado"
);

// ============================================================================
// MÉTODOS
// ============================================================================

const handleConnect = async () => {
  if (!visitorId.value) {
    alert("Por favor ingresa un ID de visitante");
    return;
  }

  try {
    isConnecting.value = true;
    await initialize(visitorId.value, true);
    console.log("Conectado al Hub SignalR");
  } catch (err: any) {
    console.error("Error conectando:", err);
    alert("Error al conectar: " + err.message);
  } finally {
    isConnecting.value = false;
  }
};

const handleDisconnect = async () => {
  try {
    await disconnectFromSignalR();
    console.log("Desconectado del Hub SignalR");
  } catch (err: any) {
    console.error("Error desconectando:", err);
    alert("Error al desconectar: " + err.message);
  }
};

const loadUnreadNotifications = async () => {
  if (!visitorId.value) {
    alert("Primero conéctate al Hub");
    return;
  }

  try {
    await loadNotifications(visitorId.value, false);
  } catch (err: any) {
    console.error("Error cargando notificaciones no leídas:", err);
    alert("Error cargando notificaciones: " + err.message);
  }
};

const loadAllNotifications = async () => {
  if (!visitorId.value) {
    alert("Primero conéctate al Hub");
    return;
  }

  try {
    await loadNotifications(visitorId.value, true);
  } catch (err: any) {
    console.error("Error cargando todas las notificaciones:", err);
    alert("Error cargando notificaciones: " + err.message);
  }
};

const handleMarkAsRead = async (notificationId: number) => {
  if (!visitorId.value) return;

  try {
    await markAsRead(notificationId, visitorId.value);
  } catch (err: any) {
    console.error("Error marcando como leída:", err);
    alert("Error marcando como leída: " + err.message);
  }
};

const handleDeleteNotification = async (notificationId: number) => {
  if (!confirm("¿Estás seguro de eliminar esta notificación?")) return;

  if (!visitorId.value) return;

  try {
    await deleteNotification(notificationId, visitorId.value);
  } catch (err: any) {
    console.error("Error eliminando notificación:", err);
    alert("Error eliminando notificación: " + err.message);
  }
};

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Auto-conectar si hay un visitorId
  if (visitorId.value) {
    handleConnect();
  }
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: #f7f8fa;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  height: 800px;
}

.left-panel,
.right-panel {
  padding: 20px;
}

.left-panel {
  background: #edf2f7;
  border-right: 1px solid #d2d6dc;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
}

.status-connected {
  background: #e8f6f3;
  color: #0d5238;
}

.status-disconnected {
  background: #fdf2f2;
  color: #6b1d1d;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-green {
  background: #38a169;
}
.dot-red {
  background: #e53e3e;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

input,
button {
  width: 100%;
  padding: 10px;
  border: 2px solid #d2d6dc;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #4a5568;
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
}

button {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 10px;
  transition: transform 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.btn-success {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
}

.btn-danger {
  background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%);
}

.system-ready {
  padding: 20px;
  background: #e6fffa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #0d5238;
}

.system-ready h4 {
  color: #1a202c;
  margin-bottom: 10px;
}

.system-ready p {
  color: #2d3748;
  margin: 0;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.unread-counter {
  background: #e53e3e;
  color: white;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: bold;
}

.load-btn {
  width: 100%;
  margin-bottom: 10px;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #d2d6dc;
  border-radius: 8px;
  background: #f9fafb;
}

.loading-state,
.error-state,
.empty-state {
  padding: 20px;
  text-align: center;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4a5568;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  color: #dc3545;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #d2d6dc;
  transition: background 0.3s ease;
}

.notification-item:hover {
  background: #edf2f7;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-unread {
  background: #e6fffa;
  border-left: 4px solid #4a5568;
}

.notification-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-badge {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #4a5568;
  font-family: monospace;
}

.notification-detail {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.reservation-info {
  background: #f0f4f8;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 12px;
  color: #2d3748;
}

.time-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.notification-actions {
  display: flex;
  gap: 10px;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  width: auto;
  margin: 0;
}

.real-time-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #319795 0%, #2c7a7b 100%);
  color: white;
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 12px 25px rgba(49, 151, 149, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(120%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  max-width: 320px;
  min-width: 280px;
  opacity: 0;
  visibility: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.real-time-notification.show {
  transform: translateX(0);
  opacity: 1;
  visibility: visible;
  animation: slideInBounce 0.6s ease-out;
}

.notification-header-top {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-size: 14px;
}

.notification-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.notification-content {
  padding: 16px;
}

.real-time-title {
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.real-time-detail {
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 10px;
}

.real-time-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 5px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes slideInBounce {
  0% {
    transform: translateX(120%) scale(0.9);
    opacity: 0;
  }
  60% {
    transform: translateX(-10px) scale(1.02);
    opacity: 1;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@media (max-width: 768px) {
  .content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .left-panel {
    border-right: none;
    border-bottom: 1px solid #d2d6dc;
  }
}
</style>
