import { ref, computed } from 'vue'
import { formService } from '@/lib/api/services/form'

// Interfaz extendida para incluir availability
interface ExtendedTimeSlot {
  id: string
  time: string
  availability: 'high' | 'medium' | 'low' | 'no'
}

export function useTimeSlots() {
  const timeSlots = ref<ExtendedTimeSlot[]>([])
  const selectedTimeSlots = ref<string[]>([])
  const selectAllTimeSlots = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadTimeSlots = async () => {
    loading.value = true
    error.value = null
    try {
      const apiTimeSlots = await formService.getAllTimeSlots()
      
      // Convertir los datos de la API al formato esperado por el componente
      timeSlots.value = apiTimeSlots.map(slot => ({
        id: slot.id.toString(), // Convertir a string para compatibilidad
        time: slot.time,
        availability: 'high' as const // Por defecto todos los horarios están disponibles
      }))
    } catch (err) {
      error.value = 'Error al cargar los horarios'
      console.error('Error loading time slots:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleSelectAll = () => {
    selectAllTimeSlots.value = !selectAllTimeSlots.value
    if (selectAllTimeSlots.value) {
      selectedTimeSlots.value = timeSlots.value.map(slot => slot.id)
    } else {
      selectedTimeSlots.value = []
    }
  }

  const toggleTimeSlot = (timeSlotId: string) => {
    const index = selectedTimeSlots.value.indexOf(timeSlotId)
    if (index > -1) {
      selectedTimeSlots.value.splice(index, 1)
    } else {
      selectedTimeSlots.value.push(timeSlotId)
    }
    
    // Actualizar el estado de "seleccionar todos"
    selectAllTimeSlots.value = selectedTimeSlots.value.length === timeSlots.value.length
  }

  const isTimeSlotSelected = (timeSlotId: string) => {
    return selectedTimeSlots.value.includes(timeSlotId)
  }

  const clearSelections = () => {
    selectedTimeSlots.value = []
    selectAllTimeSlots.value = false
  }

  return {
    timeSlots: computed(() => timeSlots.value),
    selectedTimeSlots, // Ahora devuelve la ref directamente
    selectAllTimeSlots, // Ahora devuelve la ref directamente
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getSelectedTimeSlots: computed(() => timeSlots.value.filter(slot => selectedTimeSlots.value.includes(slot.id))),
    loadTimeSlots,
    toggleSelectAll,
    toggleTimeSlot,
    isTimeSlotSelected,
    clearSelections
  }
}
