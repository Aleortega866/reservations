<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="font-semibold text-gray-900">
        Información sobre la ficha o postal
      </h4>
      <button
        @click="$emit('collapse')"
        class="text-gray-400 hover:text-gray-600 transition-colors p-1"
        title="Cerrar vista expandida"
        aria-label="Cerrar vista expandida"
      >
        <Icon icon="lucide:chevron-up" class="w-4 h-4" />
      </button>
    </div>
    <div class="space-y-2 text-sm text-gray-600 leading-relaxed">
      <p>
        <strong>Archivos que incluye este material:</strong>
        {{ materialTypesCount }}
      </p>
      <p>
        <strong>Duración aproximada:</strong>
        {{ duration }}
      </p>
      <p>
        <strong>Momento de consulta sugerido:</strong>
        {{ suggestedMoment }}
      </p>
      <p>
        <strong>Dato por el cuál se vinculó:</strong>
        {{ conceptInfo }}
      </p>
      <p>
        <strong>Descripción:</strong>
        {{ description }}
      </p>
      <p>
        <strong>Dirigido a:</strong>
        {{ directedTo }}
      </p>
      <p>
        <strong>Formato:</strong>
        {{ format }}
      </p>
      <p>
        <strong>Tamaño del documento:</strong>
        {{ documentSize }}
      </p>
      <p
        v-if="material.conceptType"
        class="flex items-center"
      >
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2"
          :class="
            material.conceptType === 'primary'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          "
        >
          {{
            material.conceptType === 'primary'
              ? "Concepto Principal"
              : "Concepto Secundario"
          }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  material: {
    type: Object,
    required: true
  },
  materialTypesCount: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  suggestedMoment: {
    type: String,
    required: true
  },
  conceptInfo: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  directedTo: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  documentSize: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['collapse'])
</script>

