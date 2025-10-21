<template>
  <!-- Modal completo cuando está abierto -->
  <div v-if="isVisible && !isMinimized" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">
          Descargando archivos
        </h3>
        <div class="flex items-center space-x-2">
          <button 
            @click="minimizeManager"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Minimizar"
          >
            <Icon icon="material-symbols:minimize" class="w-5 h-5" />
          </button>
          <button 
            @click="closeManager"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Cerrar"
          >
            <Icon icon="material-symbols:close" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="p-4 border-b">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">
            Progreso: {{ completedCount }} de {{ totalFiles }}
          </span>
          <span class="text-sm text-gray-500">
            {{ Math.round((completedCount / totalFiles) * 100) }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(completedCount / totalFiles) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Files List -->
      <div class="p-4 max-h-96 overflow-y-auto">
        <div class="space-y-2">
          <div 
            v-for="(file, index) in downloadQueue" 
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <!-- Status Icon -->
              <div class="flex-shrink-0">
                <Icon 
                  v-if="file.status === 'pending'"
                  icon="material-symbols:schedule" 
                  class="w-5 h-5 text-gray-400"
                />
                <Icon 
                  v-else-if="file.status === 'downloading'"
                  icon="material-symbols:download" 
                  class="w-5 h-5 text-blue-500 animate-pulse"
                />
                <Icon 
                  v-else-if="file.status === 'completed'"
                  icon="material-symbols:check-circle" 
                  class="w-5 h-5 text-green-500"
                />
                <Icon 
                  v-else-if="file.status === 'error'"
                  icon="material-symbols:error" 
                  class="w-5 h-5 text-red-500"
                />
              </div>

              <!-- File Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ file.name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getStatusText(file.status) }}
                </p>
              </div>
            </div>

            <!-- Progress for current download -->
            <div v-if="file.status === 'downloading'" class="flex-shrink-0">
              <div class="w-16 h-1 bg-gray-200 rounded-full">
                <div class="w-full h-1 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between p-4 border-t bg-gray-50">
        <div class="text-sm text-gray-600">
          <span v-if="isDownloading">
            Descargando: {{ currentDownload?.name }}
          </span>
          <span v-else-if="completedCount === totalFiles">
            ¡Todas las descargas completadas!
          </span>
          <span v-else>
            {{ pendingCount }} archivos pendientes
          </span>
        </div>
        
        <div class="flex space-x-2">
          <button 
            v-if="isDownloading"
            @click="cancelDownloads"
            class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            v-if="completedCount === totalFiles"
            @click="closeManager"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button 
            v-else
            @click="minimizeManager"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Minimizar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Widget flotante minimizado -->
  <div v-if="isVisible && isMinimized" class="fixed bottom-4 right-4 z-50">
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 min-w-80 max-w-96">
      <!-- Header del widget -->
      <div class="flex items-center justify-between p-3 border-b border-gray-100">
        <div class="flex items-center space-x-2">
          <Icon icon="material-symbols:download" class="w-4 h-4 text-blue-500" />
          <span class="text-sm font-medium text-gray-900">Descargas</span>
          <span v-if="isDownloading" class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </div>
        <div class="flex items-center space-x-1">
          <button 
            @click="restoreManager"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Restaurar"
          >
            <Icon icon="material-symbols:open-in-full" class="w-4 h-4" />
          </button>
          <button 
            @click="closeManager"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Cerrar"
          >
            <Icon icon="material-symbols:close" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Contenido del widget -->
      <div class="p-3">
        <!-- Progreso compacto -->
        <div class="mb-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-600">
              {{ completedCount }} de {{ totalFiles }}
            </span>
            <span class="text-xs text-gray-500">
              {{ Math.round((completedCount / totalFiles) * 100) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              :style="{ width: `${(completedCount / totalFiles) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Estado actual -->
        <div class="text-xs text-gray-600 mb-2">
          <span v-if="isDownloading && currentDownload">
            Descargando: {{ currentDownload.name }}
          </span>
          <span v-else-if="completedCount === totalFiles">
            ¡Completado!
          </span>
          <span v-else>
            {{ pendingCount }} pendientes
          </span>
        </div>

        <!-- Acciones compactas -->
        <div class="flex items-center justify-between">
          <button 
            v-if="isDownloading"
            @click="cancelDownloads"
            class="text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            Cancelar
          </button>
          <div v-else class="text-xs text-gray-500">
            {{ errorCount > 0 ? `${errorCount} errores` : 'Sin errores' }}
          </div>
          
          <button 
            @click="restoreManager"
            class="text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'cancel'])

// Estado reactivo
const downloadQueue = ref([])
const isDownloading = ref(false)
const currentDownload = ref(null)
const isMinimized = ref(false)

// Computed
const totalFiles = computed(() => downloadQueue.value.length)
const completedCount = computed(() => 
  downloadQueue.value.filter(file => file.status === 'completed').length
)
const pendingCount = computed(() => 
  downloadQueue.value.filter(file => file.status === 'pending').length
)
const errorCount = computed(() => 
  downloadQueue.value.filter(file => file.status === 'error').length
)

// Métodos
const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pendiente',
    downloading: 'Descargando...',
    completed: 'Completado',
    error: 'Error'
  }
  return statusMap[status] || 'Desconocido'
}

const closeManager = () => {
  emit('close')
}

const minimizeManager = () => {
  isMinimized.value = true
}

const restoreManager = () => {
  isMinimized.value = false
}

const cancelDownloads = () => {
  emit('cancel')
  isDownloading.value = false
  currentDownload.value = null
}

// Métodos públicos para controlar las descargas
const startDownload = (files) => {
  downloadQueue.value = files.map(file => ({
    ...file,
    status: 'pending'
  }))
  isDownloading.value = true
}

const updateFileStatus = (index, status) => {
  if (downloadQueue.value[index]) {
    downloadQueue.value[index].status = status
  }
}

const setCurrentDownload = (file) => {
  currentDownload.value = file
}

const stopDownload = () => {
  isDownloading.value = false
  currentDownload.value = null
}

// Exponer métodos para uso externo
defineExpose({
  startDownload,
  updateFileStatus,
  setCurrentDownload,
  stopDownload
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
