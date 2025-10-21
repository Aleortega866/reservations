import { ref } from 'vue'
import { useReservationStepIntegration } from './useReservationStepIntegration'
import { useReservationFormStore } from '@/stores/reservation-form'
import { useToast } from '@/composables/ui/useToast'

/**
 * Composable para manejar la retoma de reservaciones existentes
 * 
 * Este composable se encarga de:
 * - Cargar una reservación existente desde una card de "ver detalle"
 * - Forzar la recarga de todos los pasos (1, 2, 3)
 * - Actualizar el estado del header con los checks correspondientes
 * - Sincronizar con los stores existentes
 * 
 * @example
 * ```typescript
 * const { resumeReservation, isLoading } = useReservationResume()
 * 
 * // Retomar una reservación desde una card
 * await resumeReservation(123, 'general')
 * ```
 */
export const useReservationResume = () => {
  const stepIntegration = useReservationStepIntegration()
  const reservationFormStore = useReservationFormStore()
  const { showSuccess, showError } = useToast()

  // Estado local
  const isLoading = ref(false)
  const lastResumedReservation = ref<{
    id: number
    type: string
    timestamp: string
  } | null>(null)

  // ============================================================================
  // MÉTODOS
  // ============================================================================

  /**
   * Retoma una reservación existente y carga todos sus pasos
   */
  const resumeReservation = async (reservationId: number, attendeeType: string) => {
    if (!reservationId || !attendeeType) {
      console.warn('❌ No se puede retomar la reservación: faltan parámetros')
      return { success: false, error: 'Parámetros faltantes' }
    }

    isLoading.value = true

    try {
      console.log(`🔄 Retomando reservación ${reservationId} (${attendeeType})`)

      // 1. Establecer el tipo de asistente en el store principal
      reservationFormStore.setAttendeeType(attendeeType)

      // 2. Forzar la recarga de todos los pasos
      const result = await stepIntegration.loadReservationSteps(reservationId, attendeeType, true)

      if (result.success) {
        // 3. Actualizar el estado de la última reservación retomada
        lastResumedReservation.value = {
          id: reservationId,
          type: attendeeType,
          timestamp: new Date().toISOString()
        }

        // 4. Mostrar mensaje de éxito
        const completedSteps = result.completedSteps
        const totalSteps = result.totalSteps

        if (completedSteps === totalSteps) {
          showSuccess(
            'Reservación cargada', 
            `Reservación ${reservationId} cargada completamente (${completedSteps}/${totalSteps} pasos)`
          )
        } else {
          showSuccess(
            'Reservación cargada', 
            `Reservación ${reservationId} cargada (${completedSteps}/${totalSteps} pasos completos)`
          )
        }

        console.log('✅ Reservación retomada exitosamente:', {
          reservationId,
          attendeeType,
          completedSteps,
          totalSteps
        })

        return {
          success: true,
          reservationId,
          attendeeType,
          completedSteps,
          totalSteps,
          stepStatus: result.stepStatus
        }
      } else {
        throw new Error(result.error || 'Error desconocido al cargar la reservación')
      }

    } catch (error) {
      console.error('❌ Error al retomar la reservación:', error)
      showError('Error', 'No se pudo cargar la reservación')
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Recarga la última reservación retomada
   */
  const reloadLastResumedReservation = async () => {
    if (!lastResumedReservation.value) {
      console.warn('❌ No hay reservación previa para recargar')
      return { success: false, error: 'No hay reservación previa' }
    }

    const { id, type } = lastResumedReservation.value
    return await resumeReservation(id, type)
  }

  /**
   * Verifica si una reservación específica está siendo retomada
   */
  const isResumingReservation = (reservationId: number) => {
    return lastResumedReservation.value?.id === reservationId
  }

  /**
   * Obtiene información de la última reservación retomada
   */
  const getLastResumedReservation = () => {
    return lastResumedReservation.value
  }

  /**
   * Limpia el estado de la última reservación retomada
   */
  const clearLastResumedReservation = () => {
    lastResumedReservation.value = null
    console.log('🧹 Estado de reservación retomada limpiado')
  }

  /**
   * Fuerza la recarga de todos los pasos para la reservación actual
   */
  const forceReloadCurrentReservation = async () => {
    if (!lastResumedReservation.value) {
      console.warn('❌ No hay reservación actual para recargar')
      return { success: false, error: 'No hay reservación actual' }
    }

    const { id, type } = lastResumedReservation.value
    console.log('🔄 Forzando recarga de reservación actual')
    
    return await stepIntegration.forceReloadAllSteps()
  }

  return {
    // Estado
    isLoading,
    lastResumedReservation,

    // Métodos principales
    resumeReservation,
    reloadLastResumedReservation,
    forceReloadCurrentReservation,

    // Métodos de utilidad
    isResumingReservation,
    getLastResumedReservation,
    clearLastResumedReservation,

    // Acceso al step integration
    ...stepIntegration
  }
}
