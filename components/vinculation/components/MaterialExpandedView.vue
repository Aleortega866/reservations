<template>
  <div class="space-y-4">
    <!-- Vista previa del material -->
    <div class="relative">
      <div
        class="w-full h-48 bg-yellow-100 rounded-lg flex items-center justify-center relative overflow-hidden"
      >
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-700 mb-2">
            {{ description }}
          </div>
          <div class="text-4xl font-bold text-gray-800 mb-4">
            {{ materialTypesCount }}
          </div>
          <div
            class="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center"
          >
            <Icon
              :icon="thumbnailIcon"
              class="w-8 h-8 text-gray-500"
            />
          </div>
          <div
            class="absolute bottom-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <span class="text-white text-xs font-bold">e</span>
          </div>
        </div>
        <div
          class="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
        >
          <Icon
            icon="lucide:image"
            class="w-4 h-4 text-gray-500"
          />
        </div>
      </div>
    </div>

    <!-- Información del material -->
    <MaterialInfo
      :material="material"
      :material-types-count="materialTypesCount"
      :duration="duration"
      :suggested-moment="suggestedMoment"
      :concept-info="conceptInfo"
      :description="description"
      :directed-to="directedTo"
      :format="format"
      :document-size="documentSize"
      @collapse="$emit('collapse')"
    />

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import MaterialInfo from './MaterialInfo.vue'

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
  },
  thumbnailIcon: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['collapse', 'view', 'download'])
</script>

