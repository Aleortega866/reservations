// ============================================================================
// USE RESERVATION COMPANY - Composable simplificado para Reservaciones Empresariales
// ============================================================================

import { readonly } from 'vue'
import { useReservationCompanyStore } from '@/stores/reservation-company'
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'
import { useStepSaveEvents } from './useStepSaveEvents'

/**
 * Composable simplificado para la gestión de reservaciones empresariales
 * Expone el store y proporciona funciones auxiliares para toasts y manejo de errores
 * 
 * Características:
 * - Persistencia automática con localStorage
 * - Manejo de errores con toasts
 * - Funciones de API con feedback visual
 * - Acceso directo al store para operaciones avanzadas
 */
export function useReservationCompany() {
  
  // ============================================================================
  // COMPOSABLES Y SERVICIOS BASE
  // ============================================================================
  
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()
  const { emitStep1Saved, emitStep2Saved, emitStep3Saved } = useStepSaveEvents()

  // Store de reservaciones empresariales
  const store = useReservationCompanyStore()
  
  // Verificar que el store esté inicializado
  if (!store) {
    console.error('❌ Store de reservaciones empresariales no se pudo inicializar')
    throw new Error('Store de reservaciones empresariales no disponible')
  }
  
  // Debug: verificar el store (desactivado para reducir verbosidad)
  // console.log('🔍 useReservationCompany - store inicializado:', store)
  // console.log('🔍 useReservationCompany - currentReservation:', store.currentReservation)

  // ============================================================================
  // FUNCIONES AUXILIARES CON TOASTS
  // ============================================================================

  /**
   * Crea una nueva reservación empresarial (Paso 1) con toasts
   */
  const createReservationStep1 = async (requestData?: any) => {
    try {
      const result = await store.createReservationStep1(requestData)
      if (result) {
        showSuccess('Éxito', 'Paso 1 completado correctamente. Redirigiendo al paso 2...')
        
        // Emitir evento de guardado exitoso
        emitStep1Saved('empresarial', result.id || store.currentReservationId, result)
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo crear la reservación')
      throw error
    }
  }

  /**
   * Actualiza el paso 1 de una reservación con toasts
   */
  const updateReservationStep1 = async (requestData?: any) => {
    try {
      const result = await store.updateReservationStep1(requestData)
      if (result) {
        showSuccess('Éxito', 'Paso 1 actualizado correctamente')
        emitStep1Saved('empresarial', store.currentReservationId.value, result)
        
        // Cargar datos del paso 2 y emitir evento para setear en el formulario
        console.log('🔄 Cargando datos del paso 2 para setear en formulario...')
        try {
          const step2Data = await store.loadStep2(store.currentReservationId.value)
          if (step2Data) {
            console.log('✅ Datos del paso 2 cargados, emitiendo evento para setear en formulario...')
            emitStep2Saved('empresarial', store.currentReservationId.value, step2Data)
          }
        } catch (error) {
          console.error('❌ Error al cargar datos del paso 2:', error)
        }
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo actualizar el paso 1')
      throw error
    }
  }

  /**
   * Actualiza el paso 2 de una reservación con toasts
   */
  const updateReservationStep2 = async () => {
    try {
      const result = await store.updateReservationStep2()
      if (result) {
        showSuccess('Éxito', 'Paso 2 completado correctamente')
        
        // Emitir evento de guardado exitoso
        emitStep2Saved('empresarial', store.currentReservationId.value, result)
        
        // Cargar datos del paso 3 para prellenar el formulario (sin marcar como completo)
        console.log('🔄 Cargando datos del paso 3 para prellenar formulario...')
        try {
          const step3Data = await store.loadStep3(store.currentReservationId.value)
          if (step3Data) {
            console.log('✅ Datos del paso 3 cargados para prellenar (NO se marca como completo aún)')
            // NO emitir emitStep3Saved aquí porque solo estamos CARGANDO datos, no GUARDANDO
            // El paso 3 solo se debe marcar como completo cuando el usuario lo guarde explícitamente
          }
        } catch (error) {
          console.error('❌ Error al cargar datos del paso 3:', error)
        }
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo actualizar el paso 2')
      throw error
    }
  }

  const updateReservationStep3 = async () => {
    try {
      const result = await store.updateReservationStep3()
      if (result) {
        showSuccess('Éxito', 'Reservación completada correctamente')
        
        // Emitir evento de guardado exitoso
        emitStep3Saved('empresarial', store.currentReservationId, result)
        
        store.resetForm()
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo completar la reservación')
      throw error
    }
  }

  /**
   * Carga los datos del paso 1 con manejo de errores
   */
  const loadStep1 = async (reservationId: number) => {
    try {
      const result = await store.loadStep1(reservationId)
      if (!result) {
        showError('Error', 'No se pudieron cargar los datos del paso 1')
        return null
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos del paso 1')
      throw error
    }
  }

  /**
   * Carga los datos del paso 2 con manejo de errores
   */
  const loadStep2 = async (reservationId: number) => {
    try {
      const result = await store.loadStep2(reservationId)
      if (!result) {
        showError('Error', 'No se pudieron cargar los datos del paso 2')
        return null
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos del paso 2')
      throw error
    }
  }

  /**
   * Carga los datos del paso 3 con manejo de errores
   */
  const loadStep3 = async (reservationId: number) => {
    try {
      const result = await store.loadStep3(reservationId)
      // Si result es false, significa que ya está cargando, no es un error
      if (result === false) {
        console.log('ℹ️ loadStep3 - Ya se están cargando los datos del paso 3')
        return false
      }
      // Si result es null o undefined, entonces sí hubo un error
      if (!result && result !== false) {
        showError('Error', 'No se pudieron cargar los datos del paso 3')
        return null
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos del paso 3')
      throw error
    }
  }

  /**
   * Limpia errores y muestra mensaje de éxito
   */
  const clearErrorsAndShowSuccess = (message: string) => {
    store.clearAllErrors()
    showSuccess('Éxito', message)
  }

  /**
   * Maneja errores de forma consistente
   */
  const handleError = (error: any, operation: string) => {
    const errorMessage = getErrorMessage(error)
    showError('Error', errorMessage || `No se pudo ${operation}`)
    throw error
  }

  /**
   * Limpia toda la persistencia del localStorage con confirmación
   */
  const clearPersistence = () => {
    try {
      store.clearPersistence()
      showSuccess('Éxito', 'Datos de persistencia limpiados correctamente')
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo limpiar la persistencia')
    }
  }

  /**
   * Carga y muestra datos desde localStorage (para debugging)
   */
  const loadFromStorage = () => {
    try {
      store.loadFromStorage()
      showSuccess('Info', 'Datos cargados desde localStorage (ver consola)')
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos desde localStorage')
    }
  }

  /**
   * Resetea el formulario y limpia la persistencia
   */
  const resetFormAndPersistence = () => {
    try {
      store.resetForm()
      showSuccess('Éxito', 'Formulario reseteado y persistencia limpiada')
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo resetear el formulario')
    }
  }

  /**
   * Verifica si una reservación tiene personas con discapacidad
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si tiene personas con discapacidad
   */
  const checkReservationHasDisability = async (reservationId: number): Promise<boolean> => {
    try {
      const hasDisability = await store.checkReservationHasDisability(reservationId)
      return hasDisability
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo verificar si la reservación tiene personas con discapacidad')
      return false
    }
  }

  // ============================================================================
  // RETORNO DEL COMPOSABLE
  // ============================================================================

  return {
    // Store completo (solo lectura)
    store: readonly(store),

    // Estados reactivos (solo lectura)
    currentReservation: store.currentReservation,
    currentReservationId: store.currentReservationId,
    formData: store.formData,
    reservations: store.reservations,
    currentStep: store.currentStep,
    isCompleted: store.isCompleted,
    costBreakdown: store.costBreakdown,

    // Estados de loading (solo lectura)
    isCreating: store.isCreating,
    isUpdating: store.isUpdating,
    isLoading: store.isLoading,
    isLoadingStep1: store.isLoadingStep1,
    isLoadingStep2: store.isLoadingStep2,
    isLoadingStep3: store.isLoadingStep3,
    isLoadingAny: store.isLoadingAny,

    // Estados de error (solo lectura)
    error: store.error,
    stepErrors: store.stepErrors,

    // Computed properties (solo lectura)
    totalPeople: store.totalPeople,
    isStep1Valid: store.isStep1Valid,
    isStep2Valid: store.isStep2Valid,
    isStep3Valid: store.isStep3Valid,
    reservationStatus: store.reservationStatus,
    
    // Funciones de API con toasts
    createReservationStep1,
    updateReservationStep1,
    updateReservationStep2,
    updateReservationStep3,
    loadStep1,
    loadStep2,
    loadStep3,
    checkReservationHasDisability,

    // Funciones auxiliares
    clearErrorsAndShowSuccess,
    handleError,
    
    // Funciones de persistencia con toasts
    clearPersistence,
    loadFromStorage,
    resetFormAndPersistence,
    
    // Funciones del store (acceso directo)
    resetForm: store.resetForm,
    clearStepError: store.clearStepError,
    clearAllErrors: store.clearAllErrors,
    setCurrentStep: store.setCurrentStep,
    nextStep: store.nextStep,
    previousStep: store.previousStep,
    updateFormData: store.updateFormData,
    updateStepData: store.updateStepData,
    getStepData: store.getStepData,
    setCurrentReservation: store.setCurrentReservation,
    setCurrentReservationId: store.setCurrentReservationId,
    
    // Funciones de persistencia del store (acceso directo)
    clearPersistenceStore: store.clearPersistence,
    loadFromStorageStore: store.loadFromStorage
  }
}