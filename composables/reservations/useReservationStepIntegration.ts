import { watch, computed } from 'vue'
import { useReservationStepLoader } from './useReservationStepLoader'
import { useReservationFormStore } from '@/stores/reservation-form'
import { useReservationGeneral } from './useReservationGeneral'
import { useReservationSchool } from './useReservationSchool'
import { useReservationCompany } from './useReservationCompany'
import { useReservationSummerCourse } from './useReservationSummerCourse'

/**
 * Composable para integrar el sistema de gestión de pasos con los stores existentes
 * 
 * Este composable actúa como un puente entre el nuevo sistema de gestión de pasos
 * y los stores existentes de reservación, sincronizando automáticamente el estado
 * cuando se completan pasos en los stores originales.
 * 
 * @example
 * ```typescript
 * const { 
 *   syncWithExistingStores,
 *   isStepComplete,
 *   loadReservationSteps 
 * } = useReservationStepIntegration()
 * 
 * // Sincronizar con stores existentes
 * await syncWithExistingStores()
 * 
 * // Verificar estado de pasos
 * const isComplete = isStepComplete(1)
 * ```
 */
export const useReservationStepIntegration = () => {
  const stepLoader = useReservationStepLoader()
  const reservationFormStore = useReservationFormStore()
  
  // Stores específicos por tipo de asistente - Inicialización perezosa
  let generalStoreInstance: any = null
  let escolarStoreInstance: any = null
  let companyStoreInstance: any = null
  let summerStoreInstance: any = null

  // ============================================================================
  // COMPUTED
  // ============================================================================

  /**
   * Obtiene el store activo según el tipo de asistente seleccionado
   * Solo inicializa el store cuando se necesita (lazy loading)
   */
  const activeStore = computed(() => {
    const attendeeType = reservationFormStore.selectedAttendeeType
    
    switch (attendeeType) {
      case 'general':
        if (!generalStoreInstance) {
          console.log('🔄 Inicializando store de reservación general...')
          generalStoreInstance = useReservationGeneral()
        }
        return generalStoreInstance.store
      case 'escolar':
        if (!escolarStoreInstance) {
          console.log('🔄 Inicializando store de reservación escolar...')
          escolarStoreInstance = useReservationSchool()
        }
        return escolarStoreInstance.store
      case 'empresarial':
        if (!companyStoreInstance) {
          console.log('🔄 Inicializando store de reservación empresarial...')
          companyStoreInstance = useReservationCompany()
        }
        return companyStoreInstance.store
      case 'curso-verano':
        if (!summerStoreInstance) {
          console.log('🔄 Inicializando store de reservación de curso de verano...')
          summerStoreInstance = useReservationSummerCourse()
        }
        return summerStoreInstance.store
      default:
        return null
    }
  })

  /**
   * Obtiene el ID de la reservación actual del store activo
   */
  const currentReservationId = computed(() => {
    const store = activeStore.value
    if (!store) return null
    
    // Cada store tiene su propia forma de obtener el ID actual
    return store.currentReservationId || store.formData?.reservationId || null
  })

  // ============================================================================
  // MÉTODOS
  // ============================================================================

  /**
   * Sincroniza el estado de los pasos con los stores existentes
   */
  const syncWithExistingStores = async (forceReload: boolean = false) => {
    const attendeeType = reservationFormStore.selectedAttendeeType
    const reservationId = currentReservationId.value

    if (!attendeeType || !reservationId) {
      return
    }


    // Cargar el estado de todos los pasos
    await stepLoader.loadReservationSteps(reservationId, attendeeType, forceReload)
  }

  /**
   * Marca un paso como completo en el nuevo sistema cuando se guarda en el store original
   */
  const markStepCompleteFromStore = (step: number, data?: any) => {
    stepLoader.markStepComplete(step, data)
  }

  /**
   * Marca un paso como incompleto en el nuevo sistema
   */
  const markStepIncompleteFromStore = (step: number) => {
    stepLoader.markStepIncomplete(step)
  }

  /**
   * Verifica si un paso está completo en el store original y lo sincroniza
   */
  const checkAndSyncStepStatus = (step: number) => {
    const store = activeStore.value
    if (!store) return false

    let isComplete = false

    // Verificar según el tipo de store y paso
    switch (reservationFormStore.selectedAttendeeType) {
      case 'general':
        if (step === 1) {
          isComplete = !!(store.formData?.reservationDate && store.formData?.visitObjectiveId)
        } else if (step === 2) {
          isComplete = !!(store.formData?.interestTopicId && store.formData?.whereAreYouVisitingFromId)
        } else if (step === 3) {
          isComplete = !!(store.formData?.paymentMethodId && store.formData?.isTermsAccepted)
        }
        break

      case 'escolar':
        if (step === 1) {
          isComplete = !!(store.formData?.reservationDate && store.formData?.visitObjectiveId)
        } else if (step === 2) {
          isComplete = true
        } else if (step === 3) {
          isComplete = !!(store.formData?.paymentMethodId && store.formData?.isTermsAccepted)
        }
        break

      case 'empresarial':
        if (step === 1) {
          isComplete = !!(store.formData?.visitDate && store.formData?.visitObjective)
        } else if (step === 2) {
          isComplete = !!(store.formData?.companyName && store.formData?.representativeName)
        } else if (step === 3) {
          isComplete = !!(store.formData?.paymentMethodId && store.formData?.totalCost)
        }
        break

      case 'curso-verano':
        if (step === 1) {
          isComplete = !!(store.formData?.visitDate && store.formData?.workshopId)
        } else if (step === 2) {
          isComplete = !!(store.formData?.fullName && store.formData?.email)
        } else if (step === 3) {
          isComplete = !!(store.formData?.paymentMethodId && store.formData?.discoveryChannelId)
        }
        break
    }

    // Sincronizar con el nuevo sistema
    if (isComplete) {
      markStepCompleteFromStore(step, store.getStepData(step))
    } else {
      markStepIncompleteFromStore(step)
    }

    return isComplete
  }

  /**
   * Sincroniza todos los pasos con el store activo
   */
  const syncAllStepsWithStore = () => {
    for (let step = 1; step <= 3; step++) {
      checkAndSyncStepStatus(step)
    }
  }

  /**
   * Configura watchers para sincronización automática
   */
  const setupAutoSync = () => {
    // Observar cambios en el tipo de asistente
    watch(
      () => reservationFormStore.selectedAttendeeType,
      async (newType, oldType) => {
        if (newType && newType !== oldType) {
          await syncWithExistingStores()
        }
      }
    )

    // Observar cambios en el ID de reservación
    watch(
      currentReservationId,
      async (newId, oldId) => {
        if (newId && newId !== oldId) {
          await syncWithExistingStores()
        }
      }
    )

    // Observar cambios en los datos del store activo
    watch(
      () => activeStore.value?.formData,
      () => {
        if (activeStore.value) {
          syncAllStepsWithStore()
        }
      },
      { deep: true }
    )
  }

  /**
   * Inicializa la integración completa
   */
  const initializeIntegration = async (forceReload: boolean = false) => {
    
    // Configurar sincronización automática
    setupAutoSync()
    
    // Sincronizar estado inicial
    await syncWithExistingStores(forceReload)
    
  }

  /**
   * Fuerza la recarga completa de todos los pasos
   */
  const forceReloadAllSteps = async () => {
    await stepLoader.forceReloadAllSteps()
  }

  return {
    // Estado del step loader
    ...stepLoader,

    // Métodos de integración
    syncWithExistingStores,
    markStepCompleteFromStore,
    markStepIncompleteFromStore,
    checkAndSyncStepStatus,
    syncAllStepsWithStore,
    setupAutoSync,
    initializeIntegration,
    forceReloadAllSteps,

    // Computed adicionales
    activeStore,
    currentReservationId
  }
}
