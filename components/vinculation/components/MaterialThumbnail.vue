<template>
  <div class="rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" @click="$emit('expand')">
    <!-- Imagen del material -->
    <div class="relative mb-2">
      <img :src="caratulaImage" alt="Imagen de la caratula" class="mx-auto h-32 object-cover rounded-lg">
 
    </div>
    
    <!-- Descripción -->
    <p class="text-xs text-gray-600 text-center">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import caratulaImage from '@/assets/Caratula.png'

// Props
const props = defineProps({
  material: {
    type: Object,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['expand'])

// Computed
const fileExtension = computed(() => {
  if (props.material.documentFormat) {
    return props.material.documentFormat
  }
  
  const fileName = props.material.materialName || props.material.fileName || ''
  const extension = fileName.split('.').pop()
  return extension || 'pdf'
})
</script>

