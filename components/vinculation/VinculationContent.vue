<template>
  <!-- No renderizar nada si hay error o datos inválidos -->
  <div v-if="!error && hasValidData">
    <!-- Contenido Principal -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        {{ contentConfig.title }}
      </h2>

      <div class="space-y-3 mb-6 text-gray-700">
        <p v-for="(paragraph, index) in contentConfig.description" :key="index">
          {{ paragraph }}
        </p>
      </div>
    </div>

    <!-- Contenido de materiales didácticos -->
    <ClientOnly>
      <UnifiedContent
        :content-config="contentConfig"
        :loading="loading"
        :error="error"
        @select-material="selectMaterial"
        :visitMenu="visitMenu"
        :descargar="!visitMenu"
      />
      
      <template #fallback>
        <div class="space-y-3">
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p>Cargando materiales...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { UnifiedContent } from "./types";

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
  reservationId: {
    type: Number,
    required: true,
  },
  visitMenu: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["edit-vinculation", "select-material"]);

// Computed para verificar si hay datos válidos
const hasValidData = computed(() => {
  if (!props.contentConfig || !props.contentConfig.data) {
    return false;
  }

  // Para academic, la data es un objeto con academicLevels
  if (props.contentConfig.type === 'academic') {
    return props.contentConfig.data.academicLevels &&
           Array.isArray(props.contentConfig.data.academicLevels) &&
           props.contentConfig.data.academicLevels.length > 0;
  }

  // Para otros tipos, la data es un array
  return Array.isArray(props.contentConfig.data) &&
         props.contentConfig.data.length > 0;
});

// Funciones
const editVinculation = () => {
  emit("edit-vinculation");
};

const selectMaterial = (material) => {
  emit("select-material", material);
};
</script>

<style scoped>
/* Estilos específicos del componente si son necesarios */
</style>
