// ============================================================================
// USE RESERVATION OPERATIONS - Composable General para Operaciones de Reservaciones
// ============================================================================

import { ref, readonly } from 'vue'
import { useRouter } from 'vue-router'
import { reservationGlobalService } from '@/lib/api/services/reservations'
import { useToast } from '@/composables/ui/useToast'
import type { 
  ConfirmReservationApiResponse, 
  CancelReservationApiResponse 
} from '@/lib/api/services/reservations/reservation.global.service'
import type { GetReservationQRResponse } from '@/lib/api/types/reservation'

/**
 * Composable general para manejar todas las operaciones de reservaciones
 * @returns {Object} Funciones y estado para operaciones de reservaciones
 */
export function useReservationOperations() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  // ========================================================================
  // OPERACIONES DE CONFIRMACIÓN
  // ========================================================================

  /**
   * Confirma una reservación por su ID
   * @param {number} reservationId - ID de la reservación a confirmar
   * @param {boolean} showToastAndRedirect - Si debe mostrar toast y redirigir automáticamente (default: true)
   * @returns {Promise<ConfirmReservationApiResponse | null>} Resultado de la confirmación
   */
  const confirmReservation = async (reservationId: number, showToastAndRedirect: boolean = true): Promise<ConfirmReservationApiResponse | null> => {
    if (!reservationId) {
      error.value = 'ID de reservación requerido'
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      console.log('🔄 Confirmando reservación:', reservationId)
      
      const result = await reservationGlobalService.confirmReservation(reservationId)
      
      if (result.isValid && result.code === 200) {
        console.log('✅ Reservación confirmada exitosamente:', result)
        
        // Mostrar toast de éxito si está habilitado
        if (showToastAndRedirect) {
          // Usar el mensaje de la respuesta si está disponible, sino usar uno por defecto
          const successMessage = result.comments || '¡Felicidades! Su reservación ha sido confirmada.'
          showSuccess('¡Reservación confirmada!', successMessage)
          
          // Redirigir al inicio de reservaciones después de un breve delay
          setTimeout(() => {
            router.push('/reservations')
          }, 2000) // 2 segundos para que el usuario vea el toast
        }
        
        return result
      } else {
        error.value = result.comments || 'No se pudo confirmar la reservación'
        if (showToastAndRedirect) {
          showError('Error al confirmar', result.comments || 'No se pudo confirmar la reservación')
        }
        return result
      }
    } catch (err) {
      console.error('❌ Error al confirmar reservación:', err)
      error.value = 'Ocurrió un error al confirmar la reservación'
      if (showToastAndRedirect) {
        showError('Error al confirmar', 'Ocurrió un error al confirmar la reservación')
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ========================================================================
  // OPERACIONES DE CANCELACIÓN
  // ========================================================================

  /**
   * Cancela una reservación por su ID
   * @param {number} reservationId - ID de la reservación a cancelar
   * @param {number} cancelationTypeId - ID del tipo de cancelación
   * @returns {Promise<CancelReservationApiResponse | null>} Resultado de la cancelación
   */
  const cancelReservation = async (reservationId: number, cancelationTypeId: number): Promise<CancelReservationApiResponse | null> => {
    if (!reservationId) {
      error.value = 'ID de reservación requerido'
      return null
    }

    if (!cancelationTypeId) {
      error.value = 'ID del tipo de cancelación requerido'
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      console.log('🔄 Cancelando reservación:', reservationId, `Tipo de cancelación: ${cancelationTypeId}`)
      
      const result = await reservationGlobalService.cancelReservation(reservationId, cancelationTypeId)
      
      // Verificar si la operación fue exitosa (success o isValid)
      const isSuccess = result.success || result.isValid
      
      if (isSuccess) {
        console.log('✅ Reservación cancelada exitosamente:', result)
        return result
      } else {
        // Priorizar el campo comments sobre message
        error.value = result.comments || result.message || 'No se pudo cancelar la reservación'
        return result
      }
    } catch (err) {
      console.error('❌ Error al cancelar reservación:', err)
      error.value = 'Ocurrió un error al cancelar la reservación'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ========================================================================
  // OPERACIONES DE CONSULTA
  // ========================================================================

  /**
   * Obtiene el estado de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<any | null>} Estado de la reservación
   */
  const getReservationStatus = async (reservationId: number): Promise<any | null> => {
    if (!reservationId) {
      error.value = 'ID de reservación requerido'
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      console.log('🔄 Obteniendo estado de reservación:', reservationId)
      
      const result = await reservationGlobalService.getReservationStatus(reservationId)
      
      console.log('✅ Estado de reservación obtenido:', result)
      return result
    } catch (err) {
      console.error('❌ Error al obtener estado de reservación:', err)
      error.value = 'Ocurrió un error al obtener el estado de la reservación'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene los detalles de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<any | null>} Detalles de la reservación
   */
  const getReservationDetails = async (reservationId: number): Promise<any | null> => {
    if (!reservationId) {
      error.value = 'ID de reservación requerido'
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      console.log('🔄 Obteniendo detalles de reservación:', reservationId)
      
      const result = await reservationGlobalService.getReservationDetails(reservationId)
      
      console.log('✅ Detalles de reservación obtenidos:', result)
      return result
    } catch (err) {
      console.error('❌ Error al obtener detalles de reservación:', err)
      error.value = 'Ocurrió un error al obtener los detalles de la reservación'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene el código QR de una reservación
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<GetReservationQRResponse | null>} Código QR de la reservación
   */
  const getReservationQR = async (reservationId: number): Promise<GetReservationQRResponse | null> => {
    if (!reservationId) {
      error.value = 'ID de reservación requerido'
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      console.log('🔄 Obteniendo QR de reservación:', reservationId)
      
      const result = await reservationGlobalService.getReservationQR(reservationId)
      
      if (result.isValid && result.code === 200) {
        console.log('✅ QR de reservación obtenido exitosamente:', result)
        return result
      } else {
        error.value = result.comments || result.message || 'No se pudo obtener el QR de la reservación'
        return result
      }
    } catch (err) {
      console.error('❌ Error al obtener QR de reservación:', err)
      error.value = 'Ocurrió un error al obtener el QR de la reservación'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ========================================================================
  // UTILIDADES
  // ========================================================================

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Métodos de confirmación
    confirmReservation,
    
    // Métodos de cancelación
    cancelReservation,
    
    // Métodos de consulta
    getReservationStatus,
    getReservationDetails,
    getReservationQR,
    
    // Utilidades
    clearError
  }
}
