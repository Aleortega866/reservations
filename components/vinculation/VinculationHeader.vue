<template>
  <div class="w-full mb-6">
    <!-- Header con pestañas estilo control segmentado -->
    <div class="inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 shadow-sm">
      <button
        @click="setActiveTab('materials')"
        :class="[
          'px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
          activeTab === 'materials'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        ]"
      >
        Fichas y postales
      </button>
      
      <button
        @click="setActiveTab('visit-menu')"
        :class="[
          'px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
          activeTab === 'visit-menu'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        ]"
      >
        Menú de visita
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  initialTab: {
    type: String,
    default: 'materials',
    validator: (value) => ['materials', 'visit-menu'].includes(value)
  }
})

// Emits
const emit = defineEmits(['tab-change'])

// Estado reactivo
const activeTab = ref(props.initialTab)

// Funciones
const setActiveTab = (tab) => {
  if (activeTab.value !== tab) {
    activeTab.value = tab
    emit('tab-change', tab)
  }
}

// Watcher para cambios externos
watch(() => props.initialTab, (newTab) => {
  activeTab.value = newTab
})

// Exponer el estado activo
defineExpose({
  activeTab: activeTab.value
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
