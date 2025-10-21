import { ref, computed, readonly } from 'vue'

export function useNavigation() {
  const currentScreen = ref('reservations')
  const screenHistory = ref<string[]>(['reservations'])

  const getScreenTitle = () => {
    const titles: Record<string, string> = {
      'reservations': 'Reservaciones',
      'educational-material': 'Material Didáctico',
      'reservation-type': 'Tipo de Reservación',
      'reservation-step1': 'Información Básica',
      'reservation-step2': 'Detalles de la Visita',
      'reservation-step3': 'Confirmación'
    }
    return titles[currentScreen.value] || 'Reservaciones'
  }

  const navigateTo = (screen: string) => {
    screenHistory.value.push(currentScreen.value)
    currentScreen.value = screen
  }

  const goBack = () => {
    if (screenHistory.value.length > 0) {
      currentScreen.value = screenHistory.value.pop() || 'reservations'
    } else {
      currentScreen.value = 'reservations'
    }
  }

  const resetToReservations = () => {
    currentScreen.value = 'reservations'
    screenHistory.value = ['reservations']
  }

  return {
    currentScreen: readonly(currentScreen),
    getScreenTitle,
    navigateTo,
    goBack,
    resetToReservations
  }
} 