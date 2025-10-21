import { computed } from 'vue'
import { useReservationStepStatusStore } from '@/stores/reservation-step-status'
import { useToast } from '@/composables/ui/useToast'

/**
 * Composable para cargar y gestionar el estado de los pasos de reservación
 * 
 * Este composable proporciona una interfaz simplificada para:
 * - Cargar automáticamente los datos de los 3 pasos
 * - Verificar el estado de completitud de cada paso
 * - Navegar entre pasos de manera segura
 * - Mostrar el estado visual en el header
 * 
 * @example
 * ```typescript
 * const { 
 *   loadReservationSteps, 
 *   isStepComplete, 
 *   canNavigateToStep,
 *   stepStatus 
 * } = useReservationStepLoader()
 * 
 * // Cargar todos los pasos de una reservación
 * await loadReservationSteps(123, 'general')
 * 
 * // Verificar si un paso está completo
 * const isComplete = isStepComplete(1)
 * 
 * // Verificar si se puede navegar a un paso
 * const canNavigate = canNavigateToStep(2)
 * ```
 */
export const useReservationStepLoader = () => {
  const stepStatusStore = useReservationStepStatusStore()
  const { showError, showSuccess } = useToast()

  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================

  /**
   * Indica si se está cargando el estado de los pasos
   */
  const isLoading = computed(() => stepStatusStore.isLoading)

  /**
   * Estado de los pasos (reactivo)
   */
  const stepStatus = computed(() => stepStatusStore.stepStatus)

  /**
   * ID de la reservación actual
   */
  const currentReservationId = computed(() => stepStatusStore.currentReservationId)

  /**
   * Tipo de asistente actual
   */
  const currentAttendeeType = computed(() => stepStatusStore.currentAttendeeType)

  // ============================================================================
  // COMPUTED
  // ============================================================================

  /**
   * Verifica si un paso específico está completo
   */
  const isStepComplete = computed(() => stepStatusStore.isStepComplete)

  /**
   * Obtiene los datos de un paso específico
   */
  const getStepData = computed(() => stepStatusStore.getStepData)

  /**
   * Verifica si todos los pasos están completos
   */
  const areAllStepsComplete = computed(() => stepStatusStore.areAllStepsComplete)

  /**
   * Obtiene el número de pasos completados
   */
  const completedStepsCount = computed(() => stepStatusStore.completedStepsCount)

  /**
   * Obtiene el siguiente paso incompleto
   */
  const nextIncompleteStep = computed(() => stepStatusStore.nextIncompleteStep)

  // ============================================================================
  // MÉTODOS
  // ============================================================================

  /**
   * Carga el estado de todos los pasos para una reservación específica
   */
  const loadReservationSteps = async (reservationId: number, attendeeType: string, forceReload: boolean = false) => {
    try {
      // console.log(`🔄 Iniciando carga de pasos para reservación ${reservationId} (${attendeeType})${forceReload ? ' [FORZADO]' : ''}`)
      // console.log('🚨 ADVERTENCIA: loadReservationSteps ejecutándose desde useReservationStepLoader.ts', {
      //   reservationId,
      //   attendeeType,
      //   forceReload,
      //   stackTrace: new Error().stack
      // })
      
      await stepStatusStore.loadAllStepsStatus(reservationId, attendeeType, forceReload)
      
      const completedCount = completedStepsCount.value
      const totalSteps = 3
      
      if (completedCount === totalSteps) {
        showSuccess('Reservación completa', 'Todos los pasos de la reservación están completos')
      } else if (completedCount > 0) {
        showSuccess('Pasos cargados', `${completedCount} de ${totalSteps} pasos están completos`)
      } else {
       // console.log('ℹ️ Ningún paso está completo aún')
      }
      
      return {
        success: true,
        completedSteps: completedCount,
        totalSteps,
        stepStatus: stepStatus.value
      }
    } catch (error) {
      console.error('❌ Error al cargar los pasos de la reservación:', error)
      showError('Error', 'No se pudieron cargar los datos de la reservación')
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Marca un paso como completo
   */
  const markStepComplete = (step: number, data?: any) => {
    stepStatusStore.markStepComplete(step, data)
   // console.log(`✅ Paso ${step} marcado como completo`)
  }

  /**
   * Marca un paso como incompleto
   */
  const markStepIncomplete = (step: number) => {
    stepStatusStore.markStepIncomplete(step)
   // console.log(`❌ Paso ${step} marcado como incompleto`)
  }

  /**
   * Actualiza los datos de un paso
   */
  const updateStepData = (step: number, data: any) => {
    stepStatusStore.updateStepData(step, data)
    //console.log(`📝 Datos del paso ${step} actualizados`)
  }

  /**
   * Verifica si se puede navegar a un paso específico
   */
  const canNavigateToStep = (step: number) => {
    return stepStatusStore.canNavigateToStep(step)
  }

  /**
   * Obtiene el estado visual de un paso para el header
   */
  const getStepVisualState = (step: number) => {
    const isComplete = isStepComplete.value(step)
    const canNavigate = canNavigateToStep(step)
    const hasData = getStepData.value(step) !== null

    return {
      isComplete,
      canNavigate,
      hasData,
      showCheck: isComplete,
      showDot: !isComplete,
      isClickable: canNavigate,
      status: isComplete ? 'complete' : canNavigate ? 'available' : 'locked'
    }
  }

  /**
   * Resetea el estado de todos los pasos
   */
  const resetSteps = () => {
    stepStatusStore.resetAllSteps()
 //   console.log('🔄 Estado de pasos reseteado')
  }

  /**
   * Recarga el estado de los pasos para la reservación actual
   */
  const reloadCurrentSteps = async (forceReload: boolean = true) => {
    if (!currentReservationId.value || !currentAttendeeType.value) {
   //   console.warn('❌ No hay reservación actual para recargar')
      return
    }

    return await loadReservationSteps(currentReservationId.value, currentAttendeeType.value, forceReload)
  }

  /**
   * Fuerza la recarga de todos los pasos
   */
  const forceReloadAllSteps = async () => {
    await stepStatusStore.forceReloadAllSteps()
  }

  /**
   * Obtiene un resumen del estado de los pasos
   */
  const getStepsSummary = () => {
    const summary = {
      total: 3,
      completed: completedStepsCount.value,
      incomplete: 3 - completedStepsCount.value,
      percentage: Math.round((completedStepsCount.value / 3) * 100),
      nextStep: nextIncompleteStep.value,
      allComplete: areAllStepsComplete.value
    }

    return summary
  }

  return {
    // Estado
    isLoading,
    stepStatus,
    currentReservationId,
    currentAttendeeType,

    // Computed
    isStepComplete,
    getStepData,
    areAllStepsComplete,
    completedStepsCount,
    nextIncompleteStep,

    // Métodos
    loadReservationSteps,
    markStepComplete,
    markStepIncomplete,
    updateStepData,
    canNavigateToStep,
    getStepVisualState,
    resetSteps,
    reloadCurrentSteps,
    forceReloadAllSteps,
    getStepsSummary
  }
}
