<template>
  <div class="space-y-2">
    <p class="text-xs text-muted-foreground">
      <strong>Horarios Disponibles</strong>
    </p>
    
    <div class="grid grid-cols-4 gap-2 mt-3">
      <Button 
        v-for="time in timeSlots" 
        :key="time"
        variant="outline" 
        size="sm"
        disabled
        @click="$emit('select', time)"
        :class="isSelected(time) ? 'bg-primary text-primary-foreground' : ''"
      >
        {{ time }}
      </Button>
    </div>
    
    <p class="text-xs text-muted-foreground mt-2">
      Estos horarios estarán habilitados al existir disponibilidad y se encuentran dentro del rango de 3 hrs de la hora de la visita.
    </p>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

const props = defineProps({
  timeSlots: {
    type: Array,
    required: true
  },
  selectedSlots: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select'])

const isSelected = (time) => {
  return props.selectedSlots.includes(time)
}
</script> 