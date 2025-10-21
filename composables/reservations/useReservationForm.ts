import { computed } from 'vue'
import { useReservationFormStore } from '@/stores/reservation-form'

export function useReservationForm() {
  const store = useReservationFormStore()

  // Computed properties para facilitar el acceso
  const selectedAttendeeType = computed(() => store.selectedAttendeeType)
  const currentStep = computed(() => store.currentStep)
  const canShowForm = computed(() => store.canShowForm)
  const isFormStarted = computed(() => store.isFormStarted)

  // Funciones de conveniencia
  const startForm = (attendeeType: string) => {
    store.setAttendeeType(attendeeType)
  }

  const goToStep = (step: number) => {
    if (store.canGoToStep(step)) {
      store.setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (currentStep.value < 3) {
      store.goToNextStep()
    }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      store.goToPreviousStep()
    }
  }

  const saveStepData = (step: number, data: any) => {
    store.updateStepData(step, data)
  }

  const getStepData = (step: number) => {
    return store.getStepData(step)
  }

  const resetForm = () => {
    store.resetForm()
  }

  const canGoToStep = (step: number) => {
    return store.canGoToStep(step)
  }

  const isStepValid = (step: number) => {
    return store.isStepValid(step)
  }

  return {
    // State
    selectedAttendeeType,
    currentStep,
    canShowForm,
    isFormStarted,

    // Actions
    startForm,
    goToStep,
    nextStep,
    previousStep,
    saveStepData,
    getStepData,
    resetForm,
    canGoToStep,
    isStepValid,

    // Store direct access (for advanced usage)
    store
  }
}
