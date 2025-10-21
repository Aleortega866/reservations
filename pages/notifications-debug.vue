<template>
  <div class="debug-page">
    <div class="container">
      <h1>🔧 Debug SignalR Connection</h1>

      <div class="debug-section">
        <h2>1. Información de Conexión</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>URL del Hub:</label>
            <code>{{ hubUrl }}</code>
          </div>
          <div class="info-item">
            <label>Estado de Conexión:</label>
            <span :class="connectionStatusClass">{{ connectionStatus }}</span>
          </div>
          <div class="info-item">
            <label>Visitante ID:</label>
            <input v-model="visitorId" type="number" placeholder="1" />
          </div>
        </div>
      </div>

      <div class="debug-section">
        <h2>2. Pruebas de Conexión</h2>
        <div class="button-group">
          <button @click="testBasicConnection" :disabled="isLoading" class="btn-primary">
            🧪 Probar Conexión Básica
          </button>
          <button
            @click="testJoinGroup"
            :disabled="isLoading || !isConnected"
            class="btn-secondary"
          >
            👥 Probar JoinUserGroup
          </button>
          <button @click="testFullConnection" :disabled="isLoading" class="btn-success">
            🚀 Conexión Completa
          </button>
          <button @click="disconnect" :disabled="!isConnected" class="btn-danger">
            ❌ Desconectar
          </button>
        </div>
      </div>

      <div class="debug-section">
        <h2>3. Logs de Debug</h2>
        <div class="logs-container">
          <div v-for="(log, index) in logs" :key="index" :class="['log-entry', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        <button @click="clearLogs" class="btn-small">Limpiar Logs</button>
      </div>

      <div class="debug-section">
        <h2>4. Información del Servidor</h2>
        <div class="server-info">
          <button @click="checkServerHealth" :disabled="isLoading" class="btn-info">
            🏥 Verificar Salud del Servidor
          </button>
          <button @click="getConnectionDetails" :disabled="isLoading" class="btn-info">
            🔍 Información de Conexión
          </button>
          <div v-if="serverInfo" class="server-details">
            <h4>Salud del Servidor:</h4>
            <pre>{{ JSON.stringify(serverInfo, null, 2) }}</pre>
          </div>
          <div v-if="connectionInfo" class="server-details">
            <h4>Información de Conexión SignalR:</h4>
            <pre>{{ JSON.stringify(connectionInfo, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div class="debug-section">
        <h2>5. Diagnóstico Avanzado</h2>
        <div class="diagnostic-info">
          <button @click="runFullDiagnostic" :disabled="isLoading" class="btn-warning">
            🔬 Diagnóstico Completo
          </button>
          <div v-if="diagnosticResults" class="diagnostic-results">
            <h4>Resultados del Diagnóstico:</h4>
            <div
              v-for="(result, index) in diagnosticResults"
              :key="index"
              class="diagnostic-item"
            >
              <div class="diagnostic-step">
                <span class="step-number">{{ index + 1 }}</span>
                <span class="step-name">{{ result.name }}</span>
                <span :class="['step-status', result.status]">{{ result.status }}</span>
              </div>
              <div v-if="result.message" class="step-message">{{ result.message }}</div>
              <div v-if="result.details" class="step-details">
                <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// ============================================================================
// ESTADOS REACTIVOS
// ============================================================================

const visitorId = ref(1);
const isLoading = ref(false);
const logs = ref<Array<{ time: string; message: string; type: string }>>([]);
const serverInfo = ref<any>(null);
const connectionInfo = ref<any>(null);
const diagnosticResults = ref<
  Array<{ name: string; status: string; message?: string; details?: any }>
>([]);

// ============================================================================
// SIGNALR PLUGIN
// ============================================================================

const { $signalr } = useNuxtApp();

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const hubUrl = "https://api-mider-dev.buzzword.com.mx/reservationNotificationsHub";

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const isConnected = computed(() => $signalr.isConnected.value);
const connectionStatus = computed(() => $signalr.connectionState.value);

const connectionStatusClass = computed(() => {
  switch (connectionStatus.value) {
    case "Connected":
      return "status-connected";
    case "Connecting":
      return "status-connecting";
    case "Reconnecting":
      return "status-reconnecting";
    case "Disconnected":
      return "status-disconnected";
    case "Error":
      return "status-error";
    default:
      return "status-unknown";
  }
});

// ============================================================================
// MÉTODOS DE LOGGING
// ============================================================================

const addLog = (message: string, type: string = "info") => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift({ time, message, type });

  // Mantener solo los últimos 50 logs
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50);
  }
};

const clearLogs = () => {
  logs.value = [];
};

// ============================================================================
// MÉTODOS DE PRUEBA
// ============================================================================

const testBasicConnection = async () => {
  isLoading.value = true;
  addLog("🧪 Iniciando prueba de conexión básica...", "info");

  try {
    await $signalr.testConnection();
    addLog("✅ Conexión básica exitosa", "success");
  } catch (error: any) {
    addLog(`❌ Error en conexión básica: ${error.message}`, "error");
    console.error("Error en conexión básica:", error);
  } finally {
    isLoading.value = false;
  }
};

const testJoinGroup = async () => {
  if (!visitorId.value) {
    addLog("❌ Por favor ingresa un ID de visitante", "error");
    return;
  }

  isLoading.value = true;
  addLog(`👥 Probando JoinUserGroup para visitante ${visitorId.value}...`, "info");

  try {
    await $signalr.joinUserGroup(visitorId.value);
    addLog("✅ JoinUserGroup exitoso", "success");
  } catch (error: any) {
    addLog(`❌ Error en JoinUserGroup: ${error.message}`, "error");
    console.error("Error en JoinUserGroup:", error);
  } finally {
    isLoading.value = false;
  }
};

const testFullConnection = async () => {
  if (!visitorId.value) {
    addLog("❌ Por favor ingresa un ID de visitante", "error");
    return;
  }

  isLoading.value = true;
  addLog(`🚀 Iniciando conexión completa para visitante ${visitorId.value}...`, "info");

  try {
    // Probar conexión básica
    addLog("Paso 1: Probando conexión básica...", "info");
    await $signalr.testConnection();
    addLog("✅ Conexión básica exitosa", "success");

    // Probar join group
    addLog("Paso 2: Probando JoinUserGroup...", "info");
    await $signalr.joinUserGroup(visitorId.value);
    addLog("✅ JoinUserGroup exitoso", "success");

    // Actualizar estado
    $signalr.currentVisitorId.value = visitorId.value;
    $signalr.connectionState.value = "Connected";
    $signalr.isConnected.value = true;

    addLog("🎉 Conexión completa exitosa", "success");
  } catch (error: any) {
    addLog(`❌ Error en conexión completa: ${error.message}`, "error");
    console.error("Error en conexión completa:", error);
  } finally {
    isLoading.value = false;
  }
};

const disconnect = async () => {
  isLoading.value = true;
  addLog("❌ Desconectando...", "info");

  try {
    await $signalr.disconnectFromHub();
    addLog("✅ Desconectado exitosamente", "success");
  } catch (error: any) {
    addLog(`❌ Error al desconectar: ${error.message}`, "error");
  } finally {
    isLoading.value = false;
  }
};

const checkServerHealth = async () => {
  isLoading.value = true;
  addLog("🏥 Verificando salud del servidor...", "info");

  try {
    const result = await $signalr.checkServerHealth();
    serverInfo.value = result;
    
    if (result.isHealthy) {
      addLog(`✅ Servidor respondió con status ${result.status}`, "success");
    } else {
      addLog(`❌ Servidor no está saludable: ${result.error || 'Error desconocido'}`, "error");
    }
  } catch (error: any) {
    addLog(`❌ Error verificando servidor: ${error.message}`, "error");
    serverInfo.value = {
      error: error.message,
    };
  } finally {
    isLoading.value = false;
  }
};

const getConnectionDetails = async () => {
  isLoading.value = true;
  addLog("🔍 Obteniendo información de conexión...", "info");

  try {
    const info = $signalr.getConnectionInfo();
    connectionInfo.value = info;
    addLog("✅ Información de conexión obtenida", "success");
  } catch (error: any) {
    addLog(`❌ Error obteniendo información: ${error.message}`, "error");
  } finally {
    isLoading.value = false;
  }
};

const runFullDiagnostic = async () => {
  isLoading.value = true;
  diagnosticResults.value = [];
  addLog("🔬 Iniciando diagnóstico completo...", "info");

  const steps = [
    {
      name: "Verificar salud del servidor",
      action: async () => {
        const result = await $signalr.checkServerHealth();
        return {
          status: result.isHealthy ? "success" : "error",
          message: result.isHealthy ? "Servidor saludable" : `Error: ${result.error}`,
          details: result
        };
      }
    },
    {
      name: "Verificar estado de conexión SignalR",
      action: async () => {
        const info = $signalr.getConnectionInfo();
        return {
          status: info.state === "Connected" ? "success" : "warning",
          message: `Estado: ${info.state}`,
          details: info
        };
      }
    },
    {
      name: "Probar conexión básica",
      action: async () => {
        try {
          await $signalr.testConnection();
          return {
            status: "success",
            message: "Conexión básica exitosa",
            details: { connected: true }
          };
        } catch (error: any) {
          return {
            status: "error",
            message: `Error: ${error.message}`,
            details: { error: error.message }
          };
        }
      }
    },
    {
      name: "Probar JoinUserGroup",
      action: async () => {
        if (!visitorId.value) {
          return {
            status: "warning",
            message: "ID de visitante no especificado",
            details: null
          };
        }
        
        try {
          await $signalr.joinUserGroup(visitorId.value);
          return {
            status: "success",
            message: "JoinUserGroup exitoso",
            details: { visitorId: visitorId.value }
          };
        } catch (error: any) {
          return {
            status: "error",
            message: `Error: ${error.message}`,
            details: { 
              error: error.message,
              visitorId: visitorId.value,
              connectionState: $signalr.connectionState.value
            }
          };
        }
      }
    }
  ];

  for (const step of steps) {
    addLog(`🔍 Ejecutando: ${step.name}`, "info");
    
    try {
      const result = await step.action();
      diagnosticResults.value.push({
        name: step.name,
        status: result.status,
        message: result.message,
        details: result.details
      });
      
      addLog(`${result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'} ${step.name}: ${result.message}`, result.status);
    } catch (error: any) {
      diagnosticResults.value.push({
        name: step.name,
        status: "error",
        message: `Error inesperado: ${error.message}`,
        details: { error: error.message }
      });
      
      addLog(`❌ ${step.name}: Error inesperado - ${error.message}`, "error");
    }
  }

  addLog("🎯 Diagnóstico completo finalizado", "info");
  isLoading.value = false;
};

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  addLog("🔧 Página de debug inicializada", "info");
  addLog(`📡 URL del Hub: ${hubUrl}`, "info");
});
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  color: #555;
  margin-bottom: 15px;
  border-bottom: 2px solid #eee;
  padding-bottom: 5px;
}

.debug-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #666;
}

.info-item code {
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.info-item input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}
.btn-secondary {
  background: #6c757d;
  color: white;
}
.btn-success {
  background: #28a745;
  color: white;
}
.btn-danger {
  background: #dc3545;
  color: white;
}
.btn-info {
  background: #17a2b8;
  color: white;
}
.btn-warning {
  background: #ffc107;
  color: #212529;
}
.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.status-connected {
  color: #28a745;
  font-weight: bold;
}
.status-connecting {
  color: #ffc107;
  font-weight: bold;
}
.status-reconnecting {
  color: #fd7e14;
  font-weight: bold;
}
.status-disconnected {
  color: #6c757d;
  font-weight: bold;
}
.status-error {
  color: #dc3545;
  font-weight: bold;
}
.status-unknown {
  color: #6c757d;
  font-weight: bold;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  color: #fff;
  padding: 15px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  margin-bottom: 10px;
}

.log-entry {
  margin-bottom: 5px;
  display: flex;
  gap: 10px;
}

.log-time {
  color: #888;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-entry.success .log-message {
  color: #4ade80;
}
.log-entry.error .log-message {
  color: #f87171;
}
.log-entry.info .log-message {
  color: #60a5fa;
}
.log-entry.warning .log-message {
  color: #fbbf24;
}

.server-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.server-details {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
}

.server-details pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  color: #495057;
}

.diagnostic-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.diagnostic-results {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
}

.diagnostic-item {
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.diagnostic-step {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.step-number {
  background: #6c757d;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.step-name {
  font-weight: 600;
  flex: 1;
}

.step-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.step-status.success {
  background: #d4edda;
  color: #155724;
}

.step-status.error {
  background: #f8d7da;
  color: #721c24;
}

.step-status.warning {
  background: #fff3cd;
  color: #856404;
}

.step-message {
  font-size: 14px;
  color: #495057;
  margin-left: 34px;
}

.step-details {
  margin-left: 34px;
  margin-top: 5px;
}

.step-details pre {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #495057;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
