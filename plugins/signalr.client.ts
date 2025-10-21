// ============================================================================
// SIGNALR CLIENT PLUGIN - Plugin para SignalR en Nuxt 3
// ============================================================================

import * as signalR from "@microsoft/signalr";
import { ref, readonly } from 'vue';

export default defineNuxtPlugin((nuxtApp) => {
  // Solo ejecutar en el cliente
  if (!process.client) {
    return;
  }

  // Configuración del hub
  const HUB_URL = 'https://api-mider-dev.buzzword.com.mx/reservationNotificationsHub';
  
  console.log('🔧 Configurando SignalR con URL:', HUB_URL);
  
  // Crear la conexión SignalR
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect([0, 2000, 10000, 30000]) // Reintentos automáticos
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Estado de la conexión
  const connectionState = ref('Disconnected');
  const isConnected = ref(false);
  const currentVisitorId = ref<number | null>(null);

  // Eventos de conexión
  connection.onclose((error) => {
    console.log('SignalR connection closed:', error);
    connectionState.value = 'Disconnected';
    isConnected.value = false;
  });

  connection.onreconnecting((error) => {
    console.log('SignalR reconnecting:', error);
    connectionState.value = 'Reconnecting';
    isConnected.value = false;
  });

  connection.onreconnected((connectionId) => {
    console.log('SignalR reconnected:', connectionId);
    connectionState.value = 'Connected';
    isConnected.value = true;
    
    // Re-join al grupo si había un visitorId
    if (currentVisitorId.value) {
      connection.invoke("JoinUserGroup", String(currentVisitorId.value))
        .catch(err => console.error('Error re-joining group:', err));
    }
  });

  // Métodos para manejar la conexión
  const connectToHub = async (visitorId: number) => {
    try {
      console.log('🚀 Iniciando conexión SignalR para visitante:', visitorId);
      console.log('📊 Estado actual de la conexión:', connection.state);
      
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        console.log('🔌 Iniciando conexión SignalR...');
        await connection.start();
        console.log('✅ Conexión SignalR iniciada exitosamente');
      } else {
        console.log('ℹ️ Conexión SignalR ya está activa');
      }
      
      console.log('👥 Intentando unirse al grupo para visitante:', visitorId);
      await connection.invoke("JoinUserGroup", String(visitorId));
      console.log('✅ Unido exitosamente al grupo para visitante:', visitorId);
      
      currentVisitorId.value = visitorId;
      connectionState.value = 'Connected';
      isConnected.value = true;
      
      console.log('🎉 SignalR conectado exitosamente para visitante:', visitorId);
      return true;
    } catch (error: any) {
      console.error('❌ Error conectando a SignalR:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      connectionState.value = 'Error';
      isConnected.value = false;
      
      // Proporcionar mensaje de error más específico
      let errorMessage = 'Error desconocido al conectar';
      if (error.message.includes('JoinUserGroup')) {
        errorMessage = 'Error al unirse al grupo de notificaciones. Verifica que el visitante existe.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.message.includes('404')) {
        errorMessage = 'El hub de notificaciones no se encontró en el servidor.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Intenta más tarde.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const disconnectFromHub = async () => {
    try {
      if (connection.state !== signalR.HubConnectionState.Disconnected) {
        await connection.stop();
      }
      currentVisitorId.value = null;
      connectionState.value = 'Disconnected';
      isConnected.value = false;
      console.log('SignalR disconnected');
    } catch (error) {
      console.error('Error disconnecting from SignalR:', error);
    }
  };

  // Método para probar la conexión básica
  const testConnection = async () => {
    try {
      console.log('🧪 Probando conexión básica a SignalR...');
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        await connection.start();
      }
      console.log('✅ Conexión básica exitosa');
      return true;
    } catch (error: any) {
      console.error('❌ Error en conexión básica:', error);
      throw error;
    }
  };

  // Método para unirse al grupo (separado de la conexión)
  const joinUserGroup = async (visitorId: number) => {
    try {
      // Verificar estado de conexión antes de invocar
      if (connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error(`Conexión no está en estado Connected. Estado actual: ${connection.state}`);
      }

      console.log('👥 Uniéndose al grupo para visitante:', visitorId);
      console.log('📊 Estado de conexión antes de invoke:', connection.state);
      console.log('🔗 Connection ID:', connection.connectionId);
      
      // Invocar con logging detallado
      const result = await connection.invoke("JoinUserGroup", String(visitorId));
      console.log('✅ Unido exitosamente al grupo. Resultado:', result);
      return true;
    } catch (error: any) {
      console.error('❌ Error uniéndose al grupo:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        connectionState: connection.state,
        connectionId: connection.connectionId
      });
      
      // Proporcionar mensaje de error más específico
      let errorMessage = 'Error desconocido al unirse al grupo';
      
      if (error.message.includes('Connection is not in the Connected state')) {
        errorMessage = 'La conexión no está establecida. Intenta reconectar.';
      } else if (error.message.includes('Failed to invoke')) {
        errorMessage = `Error del servidor al ejecutar JoinUserGroup. Verifica que el visitante ${visitorId} existe y que el método está implementado correctamente en el servidor.`;
      } else if (error.message.includes('HubException')) {
        errorMessage = `Excepción del Hub: ${error.message}`;
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'No autorizado para unirse al grupo. Verifica la autenticación.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Método para registrar handlers de notificaciones
  const onNotificationReceived = (callback: (notification: any) => void) => {
    connection.on("NuevaNotificacion", callback);
  };

  const offNotificationReceived = (callback: (notification: any) => void) => {
    connection.off("NuevaNotificacion", callback);
  };

  // Método para verificar la salud del servidor
  const checkServerHealth = async () => {
    try {
      console.log('🏥 Verificando salud del servidor...');
      const response = await fetch('https://api-mider-dev.buzzword.com.mx/api/health');
      const data = await response.json();
      
      console.log('✅ Servidor respondió:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      return {
        isHealthy: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data
      };
    } catch (error: any) {
      console.error('❌ Error verificando salud del servidor:', error);
      return {
        isHealthy: false,
        error: error.message
      };
    }
  };

  // Método para obtener información detallada de la conexión
  const getConnectionInfo = () => {
    return {
      state: connection.state,
      connectionId: connection.connectionId,
      baseUrl: connection.baseUrl,
      transport: connection.transport,
      serverTimeoutInMilliseconds: connection.serverTimeoutInMilliseconds,
      keepAliveIntervalInMilliseconds: connection.keepAliveIntervalInMilliseconds
    };
  };

  // Proporcionar la conexión y métodos a la aplicación
  nuxtApp.provide('signalr', {
    connection,
    connectionState: readonly(connectionState),
    isConnected: readonly(isConnected),
    currentVisitorId: readonly(currentVisitorId),
    connectToHub,
    disconnectFromHub,
    testConnection,
    joinUserGroup,
    checkServerHealth,
    getConnectionInfo,
    onNotificationReceived,
    offNotificationReceived
  });

  // Limpiar la conexión cuando la aplicación se cierre
  nuxtApp.hook('app:beforeUnmount', () => {
    if (connection.state !== signalR.HubConnectionState.Disconnected) {
      connection.stop();
    }
  });
});

