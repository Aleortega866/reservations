import { useRouter, useRoute } from 'vue-router'
import { watch, computed } from 'vue'
import { useReservationFormStore } from '@/stores/reservation-form'

export function useReservationStepNavigation() {
  const router = useRouter()
  const route = useRoute()
  const reservationFormStore = useReservationFormStore()

  // Inicializar el paso desde el query de forma sincrónica para SSR/CSR
  const initialStep = parseInt(route.query.step as string)
  if (!isNaN(initialStep) && initialStep >= 1 && initialStep <= 3) {
    reservationFormStore.setCurrentStep(initialStep)
  }

  // Función para navegar a un paso específico
  const goToStep = (stepNumber: number) => {
    reservationFormStore.setCurrentStep(stepNumber)
    router.push({ path: '/reservations/formulario-reservacion', query: { step: stepNumber } })
  }

  // Sincronizar el estado con el query de la URL
  watch(
    () => route.query.step,
    (step) => {
      const n = parseInt(step as string)
      if (!isNaN(n) && n >= 1 && n <= 3) {
        reservationFormStore.setCurrentStep(n)
      }
    },
    { immediate: true }
  )

  // Sincronizar el store con la URL cuando cambie el paso en el store
  watch(
    () => reservationFormStore.currentStep,
    (newStep) => {
      if (route.query.step !== newStep.toString()) {
        router.push({ 
          path: '/reservations/formulario-reservacion', 
          query: { step: newStep } 
        })
      }
    }
  )

  return {
    currentStep: computed(() => reservationFormStore.currentStep),
    goToStep
  }
} 
