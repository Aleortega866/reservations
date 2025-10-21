<template>
  <div class="min-h-screen bg-background">
    <WorkshopHeader 
      title="Talleres disponibles"
      :show-back-button="false"
      @go-back="() => {}"
    />

    <AvailableWorkshops 
      :workshops="workshops" 
      :selected-time-slots="selectedTimeSlots"
      :max-workshops="2"
      @select-time-slot="handleTimeSlotSelection"
      @select-workshop="handleWorkshopSelection"
      @finish="handleFinish"
    />

    <WorkshopBottomNav @open-chat="() => {}" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WorkshopHeader from '@/components/workshops/WorkshopHeader.vue'
import AvailableWorkshops from '@/components/workshops/AvailableWorkshops.vue'
import { useWorkshopsStore } from '@/stores/workshops'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Workshop {
  id: string
  title: string
  location: string
  description: string
  duration: string
  timeSlots: string[]
}

// Usar el store de talleres
const workshopsStore = useWorkshopsStore()

// Obtener talleres y estado del store
const workshops = computed(() => workshopsStore.availableWorkshops)
const selectedTimeSlots = computed(() => workshopsStore.selectedTimeSlots)
const selectedWorkshops = computed(() => workshopsStore.selectedWorkshops)

const handleTimeSlotSelection = (workshopId: string, time: string) => {
  workshopsStore.toggleTimeSlot(workshopId, time)
}

const handleWorkshopSelection = (workshopId: string) => {
  workshopsStore.toggleWorkshop(workshopId)
}

const handleFinish = () => {
  router.push('/reservations/formulario-reservacion?step=3')

}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
  