<template>
  <button 
    @click="$emit('download')"
    :disabled="disabled"
    class="w-full flex items-center justify-center gap-2 py-3 text-white font-medium rounded-full shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
    style="background-color: #652F6C;"
    @mouseenter="$event.target.style.backgroundColor = '#5A2A61'"
    @mouseleave="$event.target.style.backgroundColor = '#652F6C'"
  >
    <!-- Barra de progreso interna -->
    <div 
      v-if="showProgress && totalFiles > 0"
      class="absolute inset-0 transition-all duration-500 ease-out"
      :style="{ 
        width: `${(completedCount / totalFiles) * 100}%`,
        backgroundColor: '#8B4A91'
      }"
    ></div>
    
    <!-- Contenido del botón -->
    <div class="relative z-10 flex items-center justify-center gap-2">
      <span v-if="!isDownloading">{{ buttonText }}</span>
      <span v-else-if="completedCount < totalFiles">
        MIDE - {{ completedCount }}/{{ totalFiles }} - {{ currentDownload?.name || 'Preparando...' }}
      </span>
      <span v-else>¡Completado!</span>
      
      <Icon 
        v-if="!isDownloading"
        icon="material-symbols:download" 
        class="w-5 h-5" 
      />
      <Icon 
        v-else-if="completedCount < totalFiles"
        icon="material-symbols:downloading" 
        class="w-5 h-5 animate-spin" 
      />
      <Icon 
        v-else
        icon="material-symbols:check-circle" 
        class="w-5 h-5 animate-bounce" 
      />
    </div>
  </button>
</template>

<script setup>
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: 'Descargar'
  },
  isDownloading: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  totalFiles: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  currentDownload: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['download'])
</script>

<style scoped>
/* Estilos específicos del componente */
</style>
