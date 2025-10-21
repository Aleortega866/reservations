import { useReservationFormStore } from '@/stores/reservation-form'
import { useReservationGeneralStore } from '@/stores/reservation-general'
import { useReservationSchoolStore } from '@/stores/reservation-school'
import { useReservationCompanyStore } from '@/stores/reservation-company'
import { useReservationSummerCourseStore } from '@/stores/reservation-summer-course'
import { useReservationStepStatusStore } from '@/stores/reservation-step-status'

/**
 * Composable para limpiar todos los stores de reservaciones
 * 
 * @description
 * Proporciona funciones para limpiar completamente todos los stores
 * relacionados con reservaciones, útil para inicializar nuevas sesiones
 * o limpiar datos al cerrar sesión.
 */
export function useReservationStoreCleanup() {
  
  /**
   * Limpia todos los stores de reservaciones
   * 
   * @description
   * Limpia completamente todos los stores: principal, general, empresarial y curso de verano.
   * Útil para inicializar una nueva reservación desde cero.
   * 
   * @example
   * ```typescript
   * const { clearAllStores } = useStoreCleanup()
   * 
   * // Al iniciar nueva reservación
   * clearAllStores()
   * ```
   */
  const clearAllStores = () => {
    console.log('🧹 Iniciando limpieza completa de todos los stores')
    
    try {
      // Limpiar store principal
      const reservationFormStore = useReservationFormStore()
      reservationFormStore.clearForm()
      console.log('✅ Store principal limpiado')
      
      // Limpiar store de step status
      const stepStatusStore = useReservationStepStatusStore()
      stepStatusStore.resetAllSteps()
      console.log('✅ Store de step status limpiado')
      
      // Limpiar store general
      const generalStore = useReservationGeneralStore()
      generalStore.resetForm()
      console.log('✅ Store general limpiado')

      // Limpiar store escolar
      const escolarStore = useReservationSchoolStore()
      escolarStore.resetForm()
      console.log('✅ Store escolar limpiado')
      
      // Limpiar store empresarial
      const companyStore = useReservationCompanyStore()
      companyStore.resetForm()
      console.log('✅ Store empresarial limpiado')
      
      // Limpiar store curso de verano
      const summerStore = useReservationSummerCourseStore()
      summerStore.resetForm()
      console.log('✅ Store curso de verano limpiado')
      
      console.log('🎉 Todos los stores limpiados exitosamente')
      
    } catch (error) {
      console.error('❌ Error al limpiar stores:', error)
    }
  }
  
  /**
   * Limpia solo los stores específicos (no el principal)
   * 
   * @description
   * Limpia los stores de tipos específicos de reservación pero mantiene
   * el estado del store principal. Útil para cambiar entre tipos de reservación.
   * 
   * @example
   * ```typescript
   * const { clearSpecificStores } = useStoreCleanup()
   * 
   * // Al cambiar tipo de reservación
   * clearSpecificStores()
   * ```
   */
  const clearSpecificStores = () => {
    console.log('🧹 Limpiando stores específicos')
    
    try {
      // Limpiar store de step status
      const stepStatusStore = useReservationStepStatusStore()
      stepStatusStore.resetAllSteps()
      console.log('✅ Store de step status limpiado')
      
      // Limpiar store general
      const generalStore = useReservationGeneralStore()
      generalStore.resetForm()
      console.log('✅ Store general limpiado')

      // Limpiar store escolar
      const escolarStore = useReservationSchoolStore()
      escolarStore.resetForm()
      console.log('✅ Store escolar limpiado')
      
      // Limpiar store empresarial
      const companyStore = useReservationCompanyStore()
      companyStore.resetForm()
      console.log('✅ Store empresarial limpiado')
      
      // Limpiar store curso de verano
      const summerStore = useReservationSummerCourseStore()
      summerStore.resetForm()
      console.log('✅ Store curso de verano limpiado')
      
      console.log('🎉 Stores específicos limpiados exitosamente')
      
    } catch (error) {
      console.error('❌ Error al limpiar stores específicos:', error)
    }
  }
  
  /**
   * Verifica si hay datos en algún store
   * 
   * @description
   * Verifica si hay datos guardados en cualquiera de los stores.
   * Útil para determinar si se debe mostrar alertas de cambios sin guardar.
   * 
   * @returns {boolean} true si hay datos en algún store
   * 
   * @example
   * ```typescript
   * const { hasDataInStores } = useStoreCleanup()
   * 
   * if (hasDataInStores()) {
   *   // Mostrar alerta de cambios sin guardar
   * }
   * ```
   */
  const hasDataInStores = (): boolean => {
    try {
      const reservationFormStore = useReservationFormStore()
      const stepStatusStore = useReservationStepStatusStore()
      const generalStore = useReservationGeneralStore()
      const escolarStore = useReservationSchoolStore()
      const companyStore = useReservationCompanyStore()
      const summerStore = useReservationSummerCourseStore()
      
      const hasMainData = reservationFormStore.isFormStarted || 
                         reservationFormStore.selectedAttendeeType !== null ||
                         reservationFormStore.reservationId !== null
      
      const hasStepStatusData = stepStatusStore.currentReservationId !== null ||
                               stepStatusStore.currentAttendeeType !== null ||
                               stepStatusStore.completedStepsCount > 0
      
      const hasGeneralData = generalStore.isCompleted || 
                            Object.keys(generalStore.formData).length > 0

      const hasEscolarData = escolarStore.isCompleted || 
                            Object.keys(escolarStore.formData).length > 0
      
      const hasCompanyData = companyStore.isCompleted || 
                            Object.keys(companyStore.formData).length > 0
      
      const hasSummerData = summerStore.isCompleted || 
                           Object.keys(summerStore.formData).length > 0
      
      const hasData = hasMainData || hasStepStatusData || hasGeneralData || hasEscolarData || hasCompanyData || hasSummerData
      
      console.log('🔍 Verificando datos en stores:', {
        hasMainData,
        hasStepStatusData,
        hasGeneralData,
        hasEscolarData,
        hasCompanyData,
        hasSummerData,
        hasData
      })
      
      return hasData
      
    } catch (error) {
      console.error('❌ Error al verificar datos en stores:', error)
      return false
    }
  }
  
  return {
    clearAllStores,
    clearSpecificStores,
    hasDataInStores
  }
}