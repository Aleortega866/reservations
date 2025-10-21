<template>
  <div v-if="!mostrarVacio" class="flex flex-col items-center justify-center text-center mb-8 h-full min-h-[300px]">
    <h3 v-if="!mostrarVacio" class="text-xl font-medium mb-4">
      Aún no tienes reservaciones, inicia creando una nueva
    </h3>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import ReservationCard from '../ReservationCard.vue'

const props = defineProps({
  hasReservations: {
    type: Boolean,
    default: false
  }
})


const mostrarVacio = computed(() => {
  return props.hasReservations
})


const reservasDemo = [
  {
    id: 1,
    status: 'Confirmada',
    visitDate: '2024-06-25',
    visitTime: '10:00',
    institution: 'Escuela Primaria Benito Juárez',
    attendees: 25
  },
  {
    id: 2,
    status: 'Pendiente',
    visitDate: '2024-06-27',
    visitTime: '14:00',
    institution: 'Colegio Nacional',
    attendees: 18
  },
  {
    id: 3,
    status: 'Reagendó',
    visitDate: '2024-07-01',
    visitTime: '09:00',
    institution: 'Universidad Autónoma',
    attendees: 32
  }
]
// Componente simple para el mensaje de estado vacío
</script> 