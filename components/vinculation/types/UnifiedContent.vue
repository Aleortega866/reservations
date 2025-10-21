<template>
  <BaseVinculationContent
    :content-config="contentConfig"
    :loading="loading"
    :error="error"
    :is-academic="isAcademic"
    :no-materials-message="noMaterialsMessage"
    :download-log-message="downloadLogMessage"
    @select-material="$emit('select-material', $event)"
    :visitMenu="visitMenu"
    :descargar="descargar"
  />
</template>

<script setup>
import BaseVinculationContent from "./BaseVinculationContent.vue";

// Props
const props = defineProps({
  contentConfig: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  visitMenu: {
    type: Boolean,
    default: false,
  },
  descargar: {
    type: Boolean,
    default: false,
  },  
});

// Emits
const emit = defineEmits(["select-material"]);

// Computed para determinar si es académico
const isAcademic = computed(() => props.contentConfig?.type === 'academic');

// Mensajes personalizados basados en el tipo
const noMaterialsMessage = computed(() => {
  const type = props.contentConfig?.type || 'general';
  const messages = {
    academic: "No hay materiales disponibles para academic",
    company: "No hay materiales disponibles para empresas",
    summercourse: "No hay materiales disponibles para cursos de verano",
    general: "No hay materiales disponibles"
  };
  return messages[type] || messages.general;
});

const downloadLogMessage = computed(() => {
  const type = props.contentConfig?.type || 'general';
  const messages = {
    academic: "Descargando contenido académico...",
    company: "Descargando contenido empresarial...",
    summercourse: "Descargando contenido de curso de verano...",
    general: "Descargando contenido general..."
  };
  return messages[type] || messages.general;
});
</script>

<style scoped>
/* Estilos específicos si son necesarios */
</style>
