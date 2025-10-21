import { ref, readonly } from "vue";

export default defineNuxtPlugin((nuxtApp) => {
  const connectionState = ref('Disconnected');
  const isConnected = ref(false);
  const currentVisitorId = ref(null);

  const warn = (method: string) => {
    if (process.dev) {
      console.warn(`[SignalR stub] ${method} called during SSR`);
    }
  };

  nuxtApp.provide('signalr', {
    connection: null,
    connectionState: readonly(connectionState),
    isConnected: readonly(isConnected),
    currentVisitorId: readonly(currentVisitorId),
    async connectToHub() {
      warn('connectToHub');
      return false;
    },
    async disconnectFromHub() {
      warn('disconnectFromHub');
    },
    async testConnection() {
      warn('testConnection');
      return false;
    },
    async joinUserGroup() {
      warn('joinUserGroup');
      return false;
    },
    async checkServerHealth() {
      warn('checkServerHealth');
      return { isHealthy: false, error: 'SignalR not available during SSR' };
    },
    getConnectionInfo() {
      warn('getConnectionInfo');
      return {
        state: 'Disconnected',
        connectionId: null,
        baseUrl: null,
        transport: null,
        serverTimeoutInMilliseconds: null,
        keepAliveIntervalInMilliseconds: null,
      };
    },
    onNotificationReceived(_callback: (notification: any) => void) {
      warn('onNotificationReceived');
    },
    offNotificationReceived(_callback: (notification: any) => void) {
      warn('offNotificationReceived');
    }
  });
});
