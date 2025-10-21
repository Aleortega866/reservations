import { ref, computed, readonly } from 'vue'

export function useWorkshops() {
  // Estado reactivo
  const currentScreen = ref('available-workshops')
  const timeSlots = ref([
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ])
  
  const selectedTimeSlots = ref<Record<string, string[]>>({})

  // Computed properties
  const getScreenTitle = () => {
    const titles: Record<string, string> = {
      'available-workshops': 'Talleres Disponibles',
      'reserved-workshops': 'Talleres Reservados'
    }
    return titles[currentScreen.value] || 'Talleres'
  }

  // Funciones
  const selectTimeSlot = (workshop: string, time: string) => {
    if (!selectedTimeSlots.value[workshop]) {
      selectedTimeSlots.value[workshop] = []
    }
    
    const index = selectedTimeSlots.value[workshop].indexOf(time)
    if (index > -1) {
      // Remover si ya está seleccionado
      selectedTimeSlots.value[workshop].splice(index, 1)
    } else {
      // Agregar si no está seleccionado
      selectedTimeSlots.value[workshop].push(time)
    }
  }

  const isTimeSelected = (workshop: string, time: string) => {
    return selectedTimeSlots.value[workshop]?.includes(time) || false
  }

  const selectEducationalLevel = (level: string) => {
    console.log('Nivel educativo seleccionado:', level)
  }

  const resetSelections = () => {
    selectedTimeSlots.value = {}
  }

  return {
    // Estado
    currentScreen: readonly(currentScreen),
    timeSlots: readonly(timeSlots),
    selectedTimeSlots: readonly(selectedTimeSlots),

    // Computed
    getScreenTitle,

    // Funciones
    selectTimeSlot,
    isTimeSelected,
    selectEducationalLevel,
    resetSelections
  }
} 