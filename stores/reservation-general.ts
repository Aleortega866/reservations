import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue' 
import { reservationGeneralService } from '@/lib/api/services/reservations/reservation.general.service' 
import { useLocalStorage, clearLocalStorage } from '@/composables/utils/useLocalStorage'
import { useReservationStepStatusStore } from './reservation-step-status'
import type { ReservationGeneral, ReservationGeneralStatus,
  ReservationGeneralFormData, 
  ReservationGeneralCUApiResponse,
  ReservationGeneralStep1ApiResponse,
  ReservationGeneralStep2ApiResponse,
  ReservationGeneralStep3ApiResponse,
  CreateUpdateReservationGeneralStep1Request, 
  UpdateReservationGeneralStep2Request, 
  UpdateReservationGeneralStep3Request, 
  ReservationGeneralObjectiveVisitResponse,
  LinkingCode,
} from '@/lib/api/types/reservation/general'

  // Definir defineStore si no está disponible 
  const defineStore = (_id: string, setup: any) => { return () => setup() }



  export const useReservationGeneralStore = defineStore(
    'reservation-general',
    () => {

    // Inicializar el store de estado de pasos
    const stepStatusStore = useReservationStepStatusStore()
    
    // ============================================================================
    // CLAVES DE LOCALSTORAGE
    // ============================================================================
    
    const STORAGE_KEYS: Record<string, string> = {
      FORM_DATA: 'reservation-general-form-data',
      CURRENT_STEP: 'reservation-general-current-step',
      CURRENT_RESERVATION_ID: 'reservation-general-current-id',
      IS_COMPLETED: 'reservation-general-is-completed'
    }
    
    // ============================================================================
    // ESTADOS REACTIVOS CON PERSISTENCIA
    // ============================================================================
  
    // Estados de loading granulares
    const isCreating: Ref<boolean> = ref(false)
    const isUpdating: Ref<boolean> = ref(false)
    const isLoading: Ref<boolean> = ref(false)
    const isLoadingStep1: Ref<boolean> = ref(false)
    const isLoadingStep2: Ref<boolean> = ref(false)
    const isLoadingStep3: Ref<boolean> = ref(false)
  
    // Estados de error
    type TypeError = string | null
    const error: Ref<TypeError> = ref(null)
    const stepErrors: Ref<Record<string, any>> = ref({
      step1: null as string | null,
      step2: null as string | null,
      step3: null as string | null
    })

    // Paso 1 de reservacion general (plantilla). 
    const RESERVATIONGENERALFORMDATA_PASO1_TEMPLATE = Object.freeze({
      reservationId: null,
      visitorId: null,
      attendingWithChildrenUnder3: false,
      totalKidsUnderThree: 0,
      totalKids: 0,
      totalTeenagers: 0,
      totalYoungAdults: 0,
      totalAdults: 0,
      totalSeniors: 0,
      reservationDate: '', 
      checkInDateId: null, 
      visitObjectiveId: 0, 
      totalKidsWithDisabilities: 0,
      totalTeenagersWithDisabilities: 0,
      totalYoungAdultsWithDisabilities: 0,
      totalAdultsWithDisabilities: 0,
      totalSeniorsWithDisabilities: 0,
      linkingCode: null,
    })

    // Paso 2 de reservacion general (plantilla). 
    const RESERVATIONGENERALFORMDATA_PASO2_TEMPLATE = Object.freeze({
      interestTopicId: null,
      isReservationPersonAlsoResponsible: true,
      isResponsibleNotAssigned: false,
      fullName: null,
      email: null,
      phone: null,
      whereAreYouVisitingFromId: null,
      specialAssistances: null,
    })

    // Paso 3 de reservacion general (plantilla). 
    const RESERVATIONGENERALFORMDATA_PASO3_TEMPLATE = Object.freeze({
      paymentMethodId: null,
      discoveryChannelId: null,
      workShops: null,
      isTermsAccepted: false
    })

    // Formulario de reservacion general (plantilla) con ...spread de los pasos divididos por plantilla
    const RESERVATIONGENERALFORMDATA_TEMPLATE = Object.freeze({    
      // Con structuredClone crea una copia clon profunda de cada paso y asi los valores no se pasan por referencias
      ...structuredClone(RESERVATIONGENERALFORMDATA_PASO1_TEMPLATE),
      ...structuredClone(RESERVATIONGENERALFORMDATA_PASO2_TEMPLATE),
      ...structuredClone(RESERVATIONGENERALFORMDATA_PASO3_TEMPLATE)
    })
  
    // Datos de la reservación actual
    type TypeReservationGeneral = ReservationGeneral | null
    const currentReservation: Ref<TypeReservationGeneral> = ref(null)
    
    // Datos del formulario actual con persistencia
    const defaultFormData: ReservationGeneralFormData = {
      // Con structuredClone crea una copia clon profunda del template y asi los valores no se pasan por referencias
      ...structuredClone(RESERVATIONGENERALFORMDATA_TEMPLATE),
    }
    
    type TypeCurrentReservationId = number | null
    const formData: Ref<ReservationGeneralFormData> = useLocalStorage(STORAGE_KEYS.FORM_DATA, defaultFormData)
    const currentReservationId: Ref<TypeCurrentReservationId> = useLocalStorage(STORAGE_KEYS.CURRENT_RESERVATION_ID, null as number | null)
  
    // Lista de reservaciones
    const reservations: Ref<ReservationGeneral[]> = ref([])
  
    // Estado del proceso actual con persistencia
    type TypeSteps = 1 | 2 | 3
    const currentStep: Ref<TypeSteps> = useLocalStorage(STORAGE_KEYS.CURRENT_STEP, 1 as TypeSteps)
    const isCompleted: Ref<boolean> = useLocalStorage(STORAGE_KEYS.IS_COMPLETED, false)
  
    // ============================================================================
    // COMPUTED PROPERTIES
    // ============================================================================
  
    // Estado de loading consolidado
    const isLoadingAny: ComputedRef<boolean> = computed(() => 
      isCreating.value || 
      isUpdating.value || 
      isLoading.value ||
      isLoadingStep1.value ||
      isLoadingStep2.value ||
      isLoadingStep3.value
    )
  
    // Total de personas calculado
    const totalPeople: ComputedRef<number> = computed(() => 
      formData.value.totalKids +
      formData.value.totalTeenagers +
      formData.value.totalYoungAdults +
      formData.value.totalAdults +
      formData.value.totalSeniors +
      formData.value.totalKidsWithDisabilities +
      formData.value.totalTeenagersWithDisabilities +
      formData.value.totalYoungAdultsWithDisabilities +
      formData.value.totalAdultsWithDisabilities +
      formData.value.totalSeniorsWithDisabilities
    )
  
    // Validación del paso 1
    const isStep1Valid: ComputedRef<boolean> = computed(() => {
      const data = formData.value
      return !!(
        data.visitorId &&
        data.reservationDate &&
        data.checkInDateId && 
        data.visitObjectiveId &&
        totalPeople.value > 0
      )
    })
  
    // Validación del paso 2
    const isStep2Valid: ComputedRef<boolean> = computed(() => {
      const data = formData.value
      if (!data.isResponsibleNotAssigned) {
        return !!(
          data.fullName?.trim() &&
          data.email?.trim() &&
          data.phone?.trim() &&
          data.whereAreYouVisitingFromId
        )
      }
      return !!data.whereAreYouVisitingFromId
    })
  
    // Validación del paso 3
    const isStep3Valid: ComputedRef<boolean> = computed(() => {
      const data = formData.value
      if(data.isTermsAccepted === true) {
        return !!(
          data.paymentMethodId &&
          data.discoveryChannelId &&
          data.workShops && data.workShops.length > 0 &&
          data.isTermsAccepted
        )
      }
      return true
    })
  
    // Estado de la reservación actual
    const reservationStatus: ComputedRef<ReservationGeneralStatus> = computed(() => {
      if (!currentReservation.value) return 'draft'
      return currentReservation.value.status
    })
  
    // ============================================================================
    // FUNCIONES AUXILIARES
    // ============================================================================
  
    /**
     * Limpia errores de un paso específico
     */
    const clearStepError = (step: TypeSteps): void => {
      stepErrors.value[`step${step}` as keyof typeof stepErrors.value] = null
    }
  
    /**
     * Limpia todos los errores
     */
    const clearAllErrors = (): void => {
      error.value = null
      stepErrors.value = {
        step1: null,
        step2: null,
        step3: null
      }
    }
  
    /**
     * Limpia toda la persistencia del localStorage
     */
    const clearPersistence = (): void => {
      clearLocalStorage(STORAGE_KEYS.FORM_DATA)
      clearLocalStorage(STORAGE_KEYS.CURRENT_STEP)
      clearLocalStorage(STORAGE_KEYS.CURRENT_RESERVATION_ID)
      clearLocalStorage(STORAGE_KEYS.IS_COMPLETED)
      console.log('🗑️ Persistencia limpiada del localStorage')
    }

    /**
     * Resetea el formulario a su estado inicial y limpia la persistencia
     */
    const resetForm = (): void => {
      // Primero limpiar la persistencia del localStorage
      clearPersistence()
      // Luego resetear los valores reactivos
      formData.value = { ...defaultFormData }
      currentReservation.value = null
      currentReservationId.value = null
      currentStep.value = 1
      isCompleted.value = false
      clearAllErrors()
    }
    
    
    /**
     * Carga datos desde localStorage
     */
     const loadFromStorage = async (): Promise<void> => {
       if (process.client) {
         try {
           // Cargar datos del formulario
           const storedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
           if (storedFormData) {
             const parsedFormData = JSON.parse(storedFormData)
             formData.value = { ...formData.value, ...parsedFormData }
            console.log('📂 FormData cargado desde localStorage:', parsedFormData)
           }

          // Cargar ID de reservación actual
          const storedReservationId = localStorage.getItem(STORAGE_KEYS.CURRENT_RESERVATION_ID)
          if (storedReservationId) {
            const parsedId = parseInt(storedReservationId)
            if (!isNaN(parsedId) && parsedId > 0) {
              currentReservationId.value = parsedId
              console.log('📂 CurrentReservationId cargado desde localStorage:', currentReservationId.value)
            } else {
              console.log('⚠️ ID inválido en localStorage, intentando obtener del store principal')
              // Si el ID no es válido, intentar obtenerlo del store principal
              try {
                const { useReservationFormStore } = await import('@/stores/reservation-form')
                const mainStore = useReservationFormStore()
                if (mainStore.reservationId && !isNaN(mainStore.reservationId) && mainStore.reservationId > 0) {
                  currentReservationId.value = mainStore.reservationId
                  console.log('📂 CurrentReservationId obtenido del store principal:', currentReservationId.value)
                }
              } catch (error) {
                console.log('ℹ️ No se pudo obtener ID del store principal:', error)
              }
            }
          } else {
            // Si no hay ID en localStorage, intentar obtenerlo del store principal
            try {
              const { useReservationFormStore } = await import('@/stores/reservation-form')
              const mainStore = useReservationFormStore()
              if (mainStore.reservationId && !isNaN(mainStore.reservationId) && mainStore.reservationId > 0) {
                currentReservationId.value = mainStore.reservationId
                console.log('📂 CurrentReservationId obtenido del store principal:', currentReservationId.value)
              }
            } catch (error) {
              console.log('ℹ️ No se pudo obtener ID del store principal:', error)
            }
          }

          // Cargar paso actual
          const storedCurrentStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP)
          if (storedCurrentStep) {
            const step = parseInt(storedCurrentStep) as TypeSteps
            if (step >= 1 && step <= 3) {
              currentStep.value = step
              console.log('📂 CurrentStep cargado desde localStorage:', currentStep.value)
            }
          }

           // Cargar estado de completado
           const storedIsCompleted = localStorage.getItem(STORAGE_KEYS.IS_COMPLETED)
           if (storedIsCompleted) {
              isCompleted.value = storedIsCompleted === 'true'
              console.log('📂 IsCompleted cargado desde localStorage:', isCompleted.value)
           }

            console.log('📂 Datos cargados desde localStorage:')
            console.log('- FormData:', formData.value)
            console.log('- CurrentStep:', currentStep.value)
            console.log('- CurrentReservationId:', currentReservationId.value)
            console.log('- IsCompleted:', isCompleted.value)
         } catch (error) {
           console.error('❌ Error al cargar datos desde localStorage:', error)
         }
       }
     }

    /**
     * Inicializa el store cargando datos desde localStorage
     */
     const initializeStore = async (): Promise<void> => {
        if (process.client) {
          // Solo inicializar si no hay datos ya cargados
          if (!currentReservationId.value && !currentReservation.value) {
            console.log('🚀 Inicializando store de reservación general...')
            await loadFromStorage()
          } else {
            console.log('ℹ️ Store ya inicializado, omitiendo carga desde localStorage')
          }
        }
     }

    // Inicializar automáticamente cuando se crea el store
    initializeStore()
  
    // ============================================================================
    // OPERACIONES DE RESERVACIÓN
    // ============================================================================
  
    /**
     * Establece la reservación actual
     */
     const setCurrentReservation = (reservation: ReservationGeneral): void => {
       currentReservation.value = reservation
      currentReservationId.value = typeof reservation.reservationId === 'string' ? parseInt(reservation.reservationId!, 10) : reservation.reservationId!
      console.log('✅ Reservación actual establecida:', reservation.reservationId)
     }
  
    /**
     * Establece solo el ID de la reservación actual
     */
    const setCurrentReservationId = (id: number | string) => {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      currentReservationId.value = numericId
      console.log('✅ ID de reservación actual establecido:', numericId)
      
      // Si no hay currentReservation pero sí hay ID, intentar cargar la reservación
      if (numericId && !isNaN(numericId) && !currentReservation.value) {
        console.log('🔄 Intentando cargar reservación para ID:', numericId)
        loadStep1(numericId).catch(error => {
          console.log('ℹ️ No se pudo cargar la reservación automáticamente:', error)
        })
      }
    }
  
    /**
     * Actualiza los datos del formulario
     */
    const updateFormData = (updates: Partial<ReservationGeneralFormData>): void => {
      Object.assign(formData.value, updates)
      console.log('📝 Datos del formulario actualizados:', updates)
    }
  
    /**
     * Actualiza los datos de un paso específico
     */
    const updateStepData = (step: TypeSteps, data: any): void => {
      switch (step) {
        case 1:
          updateFormData({
            visitorId: data.visitorId,
            attendingWithChildrenUnder3: data.attendingWithChildrenUnder3,
            totalKidsUnderThree: data.totalKidsUnderThree,
            totalKids: data.totalKids,
            totalTeenagers: data.totalTeenagers,
            totalYoungAdults: data.totalYoungAdults,
            totalAdults: data.totalAdults,
            totalSeniors: data.totalSeniors,
            reservationDate: data.reservationDate,
            checkInDateId: data.checkInDateId,
            visitObjectiveId: data.visitObjectiveId,
            totalKidsWithDisabilities: data.totalKidsWithDisabilities,
            totalTeenagersWithDisabilities: data.totalTeenagersWithDisabilities,
            totalYoungAdultsWithDisabilities: data.totalYoungAdultsWithDisabilities,
            totalAdultsWithDisabilities: data.totalAdultsWithDisabilities,
            totalSeniorsWithDisabilities: data.totalSeniorsWithDisabilities,
            linkingCode: data.linkingCode
          })
          // Actualizar también el store principal
          if (process.client) {
            import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
              const mainStore = useReservationFormStore()
              mainStore.updateStepData(1, { saved: true, timestamp: Date.now() })
            })
          }
          break
        case 2:
          updateFormData({
            reservationId: data.reservationId,
            interestTopicId: data.interestTopicId,
            isReservationPersonAlsoResponsible: data.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: data.isResponsibleNotAssigned,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            whereAreYouVisitingFromId: data.whereAreYouVisitingFromId,
            specialAssistances: data.specialAssistances,
            visitorId: data.visitorId
          })
          // Actualizar también el store principal
          if (process.client) {
            import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
              const mainStore = useReservationFormStore()
              mainStore.updateStepData(2, { saved: true, timestamp: Date.now() })
            })
          }
          break
        case 3:
          updateFormData({
            reservationId: data.reservationId,
            paymentMethodId: data.paymentMethodId,
            discoveryChannelId: data.discoveryChannelId,
            workShops: data.workShops,
            isTermsAccepted: data.isTermsAccepted,
            visitorId: data.visitorId
          })
          // Actualizar también el store principal
          if (process.client) {
            import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
              const mainStore = useReservationFormStore()
              mainStore.updateStepData(3, { saved: true, timestamp: Date.now() })
            })
          }
          break
      }
    }
  
    /**
     * Obtiene los datos de un paso específico
     */
    const getStepData = (step: TypeSteps) => {
      switch (step) {
        case 1:
          return {
            reservationId: formData.value.reservationId,
            visitorId: formData.value.visitorId,
            attendingWithChildrenUnder3: formData.value.attendingWithChildrenUnder3,
            totalKidsUnderThree: formData.value.totalKidsUnderThree,
            totalKids: formData.value.totalKids,
            totalTeenagers: formData.value.totalTeenagers,
            totalYoungAdults: formData.value.totalYoungAdults,
            totalAdults: formData.value.totalAdults,
            totalSeniors: formData.value.totalSeniors,
            reservationDate: formData.value.reservationDate,
            checkInDateId: formData.value.checkInDateId,
            visitObjectiveId: formData.value.visitObjectiveId,
            totalKidsWithDisabilities: formData.value.totalKidsWithDisabilities,
            totalTeenagersWithDisabilities: formData.value.totalTeenagersWithDisabilities,
            totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities,
            totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities,
            totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities,
            linkingCode: formData.value.linkingCode
          }
        case 2:
          return {
            reservationId: formData.value.reservationId,
            interestTopicId: formData.value.interestTopicId,
            isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
            fullName: formData.value.fullName,
            email: formData.value.email,
            phone: formData.value.phone,
            whereAreYouVisitingFromId: formData.value.whereAreYouVisitingFromId,
            specialAssistances: formData.value.specialAssistances,
            visitorId: formData.value.visitorId
          }
        case 3:
          return {
            reservationId: formData.value.reservationId,
            paymentMethodId: formData.value.paymentMethodId,
            discoveryChannelId: formData.value.discoveryChannelId,
            workShops: formData.value.workShops,
            isTermsAccepted: formData.value.isTermsAccepted,
            visitorId: formData.value.visitorId
          }
        default:
          return {}
      }
    }
  
    // ============================================================================
    // OPERACIONES DE ESTADO
    // ============================================================================
  
    /**
     * Establece el paso actual
     */
    const setCurrentStep = (step: TypeSteps): void => {
      currentStep.value = step
      console.log('🔄 Paso actual establecido:', step)
    }
  
    /**
     * Avanza al siguiente paso
     */
    const nextStep = (): void => {
      if (currentStep.value < 3) {
        currentStep.value = (currentStep.value + 1) as TypeSteps
        console.log('➡️ Avanzando al paso:', currentStep.value)
      }
    }
  
    /**
     * Retrocede al paso anterior
     */
    const previousStep = (): void => {
      if (currentStep.value > 1) {
        currentStep.value = (currentStep.value - 1) as TypeSteps
        console.log('⬅️ Retrocediendo al paso:', currentStep.value)
      }
    }
  
    /**
     * Marca la reservación como completada
     */
    const markAsCompleted = (): void => {
      isCompleted.value = true
      console.log('✅ Reservación marcada como completada')
    }
  
    // ============================================================================
    // OPERACIONES DE LOADING
    // ============================================================================
  
    /**
     * Establece el estado de loading para crear
     */
    const setCreating = (loading: boolean): void => {
      isCreating.value = loading
    }
  
    /**
     * Establece el estado de loading para actualizar
     */
    const setUpdating = (loading: boolean): void => {
      isUpdating.value = loading
    }
  
    /**
     * Establece el estado de loading general
     */
    const setLoading = (loading: boolean): void => {
      isLoading.value = loading
    }
  
    /**
     * Establece el estado de loading para un paso específico
     */
    const setStepLoading = (step: TypeSteps, loading: boolean): void => {
      switch (step) {
        case 1:
          isLoadingStep1.value = loading
          break
        case 2:
          isLoadingStep2.value = loading
          break
        case 3:
          isLoadingStep3.value = loading
          break
      }
    }
  
    // ============================================================================
    // OPERACIONES DE ERROR
    // ============================================================================
  
    /**
     * Establece un error general
     */
    const setError = (errorMessage: TypeError): void => {
      error.value = errorMessage
      if (errorMessage) {
        console.error('❌ Error establecido:', errorMessage)
      }
    }
  
    /**
     * Establece un error de paso específico
     */
    const setStepError = (step: TypeSteps, errorMessage: TypeError): void => {
      stepErrors.value[`step${step}` as keyof typeof stepErrors.value] = errorMessage
      if (errorMessage) {
        console.error(`❌ Error del paso ${step}:`, errorMessage)
      }
    }
  
    // ============================================================================
    // OPERACIONES DE RESERVACIONES
    // ============================================================================
  
    /**
     * Agrega una reservación a la lista
     */
    const addReservation = (reservation: ReservationGeneral): void => {
      const existingIndex: number = reservations.value.findIndex(r => r.reservationId === reservation.reservationId)
      if (existingIndex >= 0) {
        reservations.value[existingIndex] = reservation
      } else {
        reservations.value.push(reservation)
      }
      console.log('📝 Reservación agregada/actualizada:', reservation.reservationId)
    }
  
    /**
     * Actualiza una reservación en la lista
     */
    const updateReservation = (reservation: ReservationGeneral): void => {
      const index: number = reservations.value.findIndex(r => r.reservationId === reservation.reservationId)
      if (index >= 0) {
        reservations.value[index] = reservation
        console.log('📝 Reservación actualizada:', reservation.reservationId)
      }
    }
  
    /**
     * Elimina una reservación de la lista
     */
    const removeReservation = (reservationId: number): void => {
      const index = reservations.value.findIndex(r => r.reservationId === reservationId)
      if (index >= 0) {
        reservations.value.splice(index, 1)
        console.log('🗑️ Reservación eliminada:', reservationId)
      }
    }
  
    /**
     * Establece la lista completa de reservaciones
     */
    const setReservations = (reservationsList: ReservationGeneral[]): void => {
      reservations.value = reservationsList
      console.log('📝 Lista de reservaciones establecida:', reservationsList.length)
    }
  
    // ============================================================================
    // OPERACIONES DE API
    // ============================================================================
  
    /**
     * Crea una nueva reservación general (Paso 1)
     */
    type TypePromiseCreateReservationGeneralStep1 = ReservationGeneral | null
    const createReservationGeneralStep1 = async (requestData?: CreateUpdateReservationGeneralStep1Request): Promise<TypePromiseCreateReservationGeneralStep1> => {
      // Si se proporcionan datos, usarlos; si no, usar los del formulario
      const dataToUse = requestData || {
        visitorId: formData.value.visitorId!, // Indicamos que estamos seguros que si vienen esos datos
        attendingWithChildrenUnder3: formData.value.attendingWithChildrenUnder3,
        totalKidsUnderThree: formData.value.totalKidsUnderThree,
        totalKids: formData.value.totalKids,
        totalTeenagers: formData.value.totalTeenagers,
        totalYoungAdults: formData.value.totalYoungAdults,
        totalAdults: formData.value.totalAdults,
        totalSeniors: formData.value.totalSeniors,
        reservationDate: formData.value.reservationDate,
        checkInDateId: formData.value.checkInDateId!, // Indicamos que estamos seguros que si vienen esos datos
        visitObjectiveId: formData.value.visitObjectiveId,
        totalKidsWithDisabilities: formData.value.totalKidsWithDisabilities,
        totalTeenagersWithDisabilities: formData.value.totalTeenagersWithDisabilities,
        totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities,
        totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities,
        totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities,
        linkingCode: formData.value.linkingCode
      }
  
      // Validar que los datos requeridos estén presentes
      if (!dataToUse.visitorId || !dataToUse.reservationDate || !dataToUse.checkInDateId || !dataToUse.visitObjectiveId) {
        const errorMsg: string = 'Por favor completa todos los campos requeridos del paso 1'
        setStepError(1, errorMsg)
        return null
      }

      if (isCreating.value) return null
  
      setCreating(true)
      clearStepError(1)
  
      try {
        const response: ReservationGeneralCUApiResponse = await reservationGeneralService.createReservationGeneralStep1(dataToUse)
        
        // La respuesta puede ser el ID directamente o un objeto con reservationId
        let reservationId: number
        
        if (typeof response === 'number') {
          // Si la respuesta es directamente un número (ID)
          reservationId = response
        } else if (response && typeof response === 'object') {
          const responseObj = response as any
          if (responseObj.response) {
            // Si la respuesta es un objeto con el campo 'response' (como en el ejemplo)
            reservationId = responseObj.response
          } else if (responseObj.reservationId) {
            // Si la respuesta es un objeto con el campo 'reservationId'
            reservationId = responseObj.reservationId
          } else if (responseObj.id) {
            // Si la respuesta es un objeto con el campo 'id'
            reservationId = responseObj.id
          } else {
            throw new Error('Formato de respuesta del API no reconocido')
          }
        } else {
          throw new Error('Formato de respuesta del API no reconocido')
        }
        
        console.log('🔍 ID de reservación extraído:', reservationId)
        
        // Crear objeto de reservación con los datos del paso 1
        const newReservation: ReservationGeneral = {
          // Paso 1
          reservationId: reservationId as unknown as number,
          visitorId: dataToUse.visitorId, 
          attendingWithChildrenUnder3: dataToUse.attendingWithChildrenUnder3,
          totalKidsUnderThree: dataToUse.totalKidsUnderThree!,
          totalKids: dataToUse.totalKids,
          totalTeenagers: dataToUse.totalTeenagers,
          totalYoungAdults: dataToUse.totalYoungAdults,
          totalAdults: dataToUse.totalAdults,
          totalSeniors: dataToUse.totalSeniors,
          reservationDate: dataToUse.reservationDate,
          checkInDateId: dataToUse.checkInDateId,
          visitObjectiveId: dataToUse.visitObjectiveId,
          totalKidsWithDisabilities: dataToUse.totalKidsWithDisabilities!,
          totalTeenagersWithDisabilities: dataToUse.totalTeenagersWithDisabilities!,
          totalYoungAdultsWithDisabilities: dataToUse.totalYoungAdultsWithDisabilities!,
          totalAdultsWithDisabilities: dataToUse.totalAdultsWithDisabilities!,
          totalSeniorsWithDisabilities: dataToUse.totalSeniorsWithDisabilities!,
          linkingCode: dataToUse.linkingCode!,

          // Paso 2
          ...structuredClone(RESERVATIONGENERALFORMDATA_PASO2_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 2 template y asi los valores no se pasan por referencias

          // Paso 3
          ...structuredClone(RESERVATIONGENERALFORMDATA_PASO3_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 3 template y asi los valores no se pasan por referencias

          // Metadatos
          status: 'step1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
  
        // Actualizar el store
        setCurrentReservation(newReservation)
        setCurrentStep(2)
        addReservation(newReservation)

        // Marcar el paso 1 como guardado en el store principal
        updateStepData(1, { saved: true, timestamp: Date.now() })

        // Marcar el paso 1 como completo en el store de estado de pasos
        stepStatusStore.markStepComplete(1, newReservation)
        
        return newReservation
  
      } catch (err) {
        setStepError(1, err instanceof Error ? err.message : 'Error al crear reservación')
        throw err
      } finally {
        setCreating(false)
      }
    }

    /**
     * Modifica una reservación general (Paso 1)
     */
    type TypePromiseUpdateReservationGeneralStep1 = ReservationGeneral | null
     const updateReservationGeneralStep1 = async (requestData?: CreateUpdateReservationGeneralStep1Request): Promise<TypePromiseUpdateReservationGeneralStep1> => {
      console.log('🔍 updateReservationStep1 recibió requestData:', requestData)
      console.log('🔍 requestData keys:', Object.keys(requestData || {}))

      // Si no hay reservación activa pero sí hay ID, intentar cargarla
      if (!currentReservation.value && currentReservationId.value) {
        console.log('🔄 Intentando cargar reservación desde ID antes de actualizar paso 1:', currentReservationId.value)
        try {
          await loadStep1(currentReservationId.value)
          if (!currentReservation.value) {
            setError('No se pudo cargar la reservación para actualizar')
            return null
          }
        } catch (error) {
          setError('Error al cargar la reservación: ' + (error instanceof Error ? error.message : 'Error desconocido'))
          return null
        }
      }

      if (!currentReservation.value) {
        setError('No hay una reservación activa para actualizar')
        return null
      }

      setUpdating(true)
      clearStepError(1)

      try {
        // Preparar los datos para la actualización del paso 1
        const updateData = {
          reservationId: currentReservation.value ? (typeof currentReservation.value.reservationId === 'string' ? parseInt(currentReservation.value.reservationId, 10) : currentReservation.value.reservationId!) : currentReservationId.value!,
          ...requestData
        }

        console.log('🔍 Datos para actualizar paso 1:', updateData)
        const response: ReservationGeneralCUApiResponse = await reservationGeneralService.updateReservationGeneralStep1(updateData as CreateUpdateReservationGeneralStep1Request)

        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            visitorId: requestData?.visitorId!,
            attendingWithChildrenUnder3: requestData?.attendingWithChildrenUnder3,
            totalKidsUnderThree: requestData?.totalKidsUnderThree!,
            totalKids: requestData?.totalKids,
            totalTeenagers: requestData?.totalTeenagers,
            totalYoungAdults: requestData?.totalYoungAdults,
            totalAdults: requestData?.totalAdults,
            totalSeniors: requestData?.totalSeniors,
            reservationDate: requestData?.reservationDate,
            checkInDateId: requestData?.checkInDateId!,
            visitObjectiveId: requestData?.visitObjectiveId,
            totalKidsWithDisabilities: requestData?.totalKidsWithDisabilities!,
            totalTeenagersWithDisabilities: requestData?.totalTeenagersWithDisabilities!,
            totalYoungAdultsWithDisabilities: requestData?.totalYoungAdultsWithDisabilities!,
            totalAdultsWithDisabilities: requestData?.totalAdultsWithDisabilities!,
            totalSeniorsWithDisabilities: requestData?.totalSeniorsWithDisabilities!,
            linkingCode: requestData?.linkingCode,

            // Metadatos
            status: 'step1' as const,
            updatedAt: new Date().toISOString() // response
          }

          setCurrentReservation(updatedReservation as ReservationGeneral)
          updateReservation(updatedReservation as ReservationGeneral)
        }


        // Marcar el paso 1 como guardado usando updateStepData
        updateStepData(1, { saved: true, timestamp: Date.now() })

        // Marcar el paso 1 como completo en el store de estado de pasos
        stepStatusStore.markStepComplete(1, response)
        console.log('✅ Paso 1 marcado como completo en stepStatusStore')

        setCurrentStep(2)

        return currentReservation.value

      } catch (err) {
        setStepError(1, err instanceof Error ? err.message : 'Error al actualizar paso 2')
        throw err
      }
      finally {
        setUpdating(false)
      }

    }
  
    /**
     * Actualiza el paso 2 de una reservación
     */
    type TypePromiseUpdateReservationGeneralStep2 = ReservationGeneral | null
    const updateReservationGeneralStep2 = async (): Promise<TypePromiseUpdateReservationGeneralStep2> => {
      // Si no hay reservación activa pero sí hay ID, intentar cargarla
      if (!currentReservation.value && currentReservationId.value) {
        console.log('🔄 Intentando cargar reservación desde ID antes de actualizar paso 2:', currentReservationId.value)
        try {
          await loadStep1(currentReservationId.value)
          if (!currentReservation.value) {
            setError('No se pudo cargar la reservación para actualizar')
            return null
          }
        } catch (error) {
          setError('Error al cargar la reservación: ' + (error instanceof Error ? error.message : 'Error desconocido'))
          return null
        }
      }
      
      if (!currentReservation.value) {
        setError('No hay una reservación activa para actualizar')
        return null
      }
  
      if (!isStep2Valid.value) {
        const errorMsg = 'Por favor completa todos los campos requeridos del paso 2'
        setStepError(2, errorMsg)
        return null
      }
  
      if (isUpdating.value) return null
  
      setUpdating(true)
      clearStepError(2)
  
      try {
        const requestData: UpdateReservationGeneralStep2Request = {
          reservationId: typeof currentReservation.value.reservationId === 'string' ? parseInt(currentReservation.value.reservationId, 10) : currentReservation.value.reservationId!,
          interestTopicId: formData.value.interestTopicId!,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
          fullName: formData.value.fullName!,
          email: formData.value.email!,
          phone: formData.value.phone!,
          whereAreYouVisitingFromId: formData.value.whereAreYouVisitingFromId!,
          specialAssistances: formData.value.specialAssistances!,
          visitorId: formData.value.visitorId!
        }

        console.log('requestData-----------------------', requestData)
        console.log('requestData-----------------------', currentReservation)
  
        await reservationGeneralService.updateReservationGeneralStep2(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,

            interestTopicId: requestData.interestTopicId!,
            isReservationPersonAlsoResponsible: requestData.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: requestData.isResponsibleNotAssigned,
            fullName: requestData.fullName!,
            email: requestData.email!,
            phone: requestData.phone!,
            whereAreYouVisitingFromId: requestData.whereAreYouVisitingFromId!,
            specialAssistances: requestData.specialAssistances!,
            visitorId: requestData.visitorId!,

            // Metadatos
            status: 'step2' as const,
            updatedAt: new Date().toISOString() // response
          }
          
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        }

        // Marcar el paso 2 como guardado usando updateStepData
        updateStepData(2, { saved: true, timestamp: Date.now() })

        // Marcar el paso 2 como completo en el store de estado de pasos
        stepStatusStore.markStepComplete(2, requestData)
        console.log('✅ Paso 2 marcado como completo en stepStatusStore')
  
        setCurrentStep(3)
        return currentReservation.value
  
      } catch (err) {
        setStepError(2, err instanceof Error ? err.message : 'Error al actualizar paso 2')
        throw err
      } finally {
        setUpdating(false)
      }
    }
  
    /**
     * Actualiza el paso 3 de una reservación
     */
    type TypePromiseUpdateReservationGeneralStep3 = ReservationGeneral | null
    const updateReservationGeneralStep3 = async (): Promise<TypePromiseUpdateReservationGeneralStep3> => {
      // Si no hay reservación activa pero sí hay ID, crear un objeto básico sin cargar datos
      if (!currentReservation.value && currentReservationId.value) {
        console.log('🔄 Creando objeto de reservación básico para actualizar paso 3:', currentReservationId.value)
        const basicReservation: ReservationGeneral = {
          // Campos del paso 1
          reservationId: currentReservationId.value,
          visitorId: formData.value.visitorId, 
          attendingWithChildrenUnder3: formData.value.attendingWithChildrenUnder3,
          totalKidsUnderThree: formData.value.totalKidsUnderThree!,
          totalKids: formData.value.totalKids,
          totalTeenagers: formData.value.totalTeenagers,
          totalYoungAdults: formData.value.totalYoungAdults,
          totalAdults: formData.value.totalAdults,
          totalSeniors: formData.value.totalSeniors,
          reservationDate: formData.value.reservationDate,
          checkInDateId: formData.value.checkInDateId,
          visitObjectiveId: formData.value.visitObjectiveId,
          totalKidsWithDisabilities: formData.value.totalKidsWithDisabilities!,
          totalTeenagersWithDisabilities: formData.value.totalTeenagersWithDisabilities!,
          totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities!,
          totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities!,
          totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities!,
          linkingCode: formData.value.linkingCode!,
          // Campos del paso 2
          interestTopicId: formData.value.interestTopicId!,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
          fullName: formData.value.fullName!,
          email: formData.value.email!,
          phone: formData.value.phone!,
          whereAreYouVisitingFromId: formData.value.whereAreYouVisitingFromId!,
          specialAssistances: formData.value.specialAssistances!,
          // Campos del paso 3
          paymentMethodId: formData.value.paymentMethodId,
          discoveryChannelId: formData.value.discoveryChannelId,
          workShops: formData.value.workShops,
          isTermsAccepted: formData.value.isTermsAccepted,
          // Campos adicionales requeridos
          status: 'step3' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setCurrentReservation(basicReservation)
      }

      if (!currentReservation.value) {
        setError('No hay una reservación activa para actualizar')
        return null
      }
  
      if (!isStep3Valid.value) {
        const errorMsg = 'Por favor completa todos los campos requeridos del paso 3'
        setStepError(3, errorMsg)
        return null
      }
  
      if (isUpdating.value) return null
  
      setUpdating(true)
      clearStepError(3)

  
      try {
        const requestData: UpdateReservationGeneralStep3Request = {
          reservationId: typeof currentReservation.value.reservationId === 'string' ? parseInt(currentReservation.value.reservationId, 10) : currentReservation.value.reservationId!,
          paymentMethodId: formData.value.paymentMethodId!,
          discoveryChannelId: formData.value.discoveryChannelId!,
          workShops: formData.value.workShops!,
          isTermsAccepted: formData.value.isTermsAccepted!,
          visitorId: formData.value.visitorId!,
        }
  
        await reservationGeneralService.updateReservationGeneralStep3(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,

            reservationId: requestData.reservationId!,
            paymentMethodId: requestData.paymentMethodId!,
            discoveryChannelId: requestData.discoveryChannelId!,
            workShops: requestData.workShops!,
            isTermsAccepted: requestData.isTermsAccepted!,
            visitorId: requestData.visitorId!,

            // Metadatos
            status: 'completed' as const,
            updatedAt: new Date().toISOString() // response
          }
          
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        }
  
        setCurrentStep(3)
        markAsCompleted()

        // Marcar el paso 2 como completo en el store de estado de pasos
        stepStatusStore.markStepComplete(3, requestData)

        return currentReservation.value
  
      } catch (err) {
        setStepError(3, err instanceof Error ? err.message : 'Error al actualizar paso 3')
        throw err
      } finally {
        setUpdating(false)
      }
    }

    /**
     * Obtiene los objetivos de la visita
     */
    type TypeReservationGeneralObjectiveVisit = ReservationGeneralObjectiveVisitResponse[] | []
    const getAllReservationGeneralObjectiveVisit = async (): Promise<TypeReservationGeneralObjectiveVisit> => {

      try {
  
        const response = await reservationGeneralService.getAllReservationGeneralObjectiveVisit()
  
        return response.response // Devuelve los objetivos de visita 
  
      } catch (err) {
        console.log('Ocurrio un error al obtener los objetivos de la visita')
        throw err
      } finally {
        //
      }
    }

    /**
     * Obtiene un codigo de vinculacion linkingCode por nombre
     */
    type TypePromiseLinkingCode = LinkingCode[] | []
    const getAllLinkingCodes = async (code: string, getDisabledCodes:boolean | undefined = false): Promise<TypePromiseLinkingCode> => {

      try {
  
        const response = await reservationGeneralService.getAllLinkingCodes(code)
  
        return response.response.filter(code => code.maxTickets && (getDisabledCodes ? true : code.enable)) // Devuelve los codigos de vinculacion con cantidades de cupo disponibles
  
      } catch (err) {
        console.log('Ocurrio un error al obtener el codigo de vinculacion')
        throw err
      } finally {
        //
      }
    }
  
    /**
     * Carga solo los datos del paso 1 de una reservación
     */
    const loadStep1 = async (reservationId: number): Promise<any> => {
      console.log('🚨 ADVERTENCIA: loadStep1 ejecutándose desde reservation-general.ts', {
        reservationId,
        stackTrace: new Error().stack
      })

      // 🚨 TINGU ADVERTENCIA: Verificar si ya está cargándose
      if (isLoadingStep1.value) {
        console.log('🚨 TINGU ADVERTENCIA: Paso 1 ya está cargándose, retornando false')
        return false
      }

      // 🚨 TINGU ADVERTENCIA: Verificar si ya se cargó recientemente (últimos 2 segundos)
      const now = Date.now()
      const lastLoadTime = (window as any).lastStep1LoadTime || 0
      if (now - lastLoadTime < 2000) {
        console.log('🚨 TINGU ADVERTENCIA: Paso 1 se cargó hace menos de 2 segundos, omitiendo carga duplicada')
        return false
      }
      (window as any).lastStep1LoadTime = now

      setStepLoading(1, true)
      clearStepError(1)
  
      try {
        const response: ReservationGeneralStep1ApiResponse = await reservationGeneralService.getReservationGeneralStep1(reservationId)

        console.log('🔍 loadStep1 - Respuesta completa del servidor:', response)
        
        // Extraer los datos reales de la respuesta del servidor
        // El servidor devuelve una estructura ApiResponse, no directamente los datos
        const step1Data = (response as any).response || response
        
        console.log('🔍 loadStep1 - Datos extraídos:', step1Data)
        console.log('🔍 loadStep1 - totalYoungAdults:', step1Data.totalYoungAdults)
        console.log('🔍 loadStep1 - totalAdults:', step1Data.totalAdults)
        console.log('🔍 loadStep1 - totalSeniors:', step1Data.totalSeniors)
        
        // Actualizar solo los datos del paso 1 en el formulario
        const formDataUpdate: Partial<ReservationGeneral> = {
          reservationId: step1Data.reservationId,
          attendingWithChildrenUnder3: step1Data.attendingWithChildrenUnder3,
          reservationDate: step1Data.reservationDate,
          visitObjectiveId: step1Data.visitObjectiveId,
          totalKids: step1Data.totalKids,
          totalKidsWithDisabilities: step1Data.totalKidsWithDisabilities!,
          totalTeenagers: step1Data.totalTeenagers,
          totalTeenagersWithDisabilities: step1Data.totalTeenagersWithDisabilities!,
          totalYoungAdults: step1Data.totalYoungAdults,
          totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities!,
          totalAdults: step1Data.totalAdults,
          totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities!,
          totalSeniors: step1Data.totalSeniors,
          totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities!,
          visitorId: step1Data.visitorId,
          totalKidsUnderThree: step1Data.totalKidsUnderThree!,
          linkingCode: step1Data.linkingCode,
          checkInDateId: step1Data.checkInDateId
        }
        
        console.log('🔍 loadStep1 - Datos que se van a actualizar en formData:', formDataUpdate)
        updateFormData(formDataUpdate)
        console.log('🔍 loadStep1 - formData después de actualizar:', formData.value)
  
        // Actualizar o crear la reservación actual
        if (!currentReservation.value) {
          const newReservation: ReservationGeneral = {
            // Paso 1
            reservationId: step1Data.reservationId,
            attendingWithChildrenUnder3: step1Data.attendingWithChildrenUnder3,
            reservationDate: step1Data.reservationDate,
            visitObjectiveId: step1Data.visitObjectiveId,
            totalKids: step1Data.totalKids,
            totalKidsWithDisabilities: step1Data.totalKidsWithDisabilities!,
            totalTeenagers: step1Data.totalTeenagers,
            totalTeenagersWithDisabilities: step1Data.totalTeenagersWithDisabilities!,
            totalYoungAdults: step1Data.totalYoungAdults,
            totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities!,
            totalAdults: step1Data.totalAdults,
            totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities!,
            totalSeniors: step1Data.totalSeniors,
            totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities!,
            visitorId: step1Data.visitorId,
            totalKidsUnderThree: step1Data.totalKidsUnderThree!,
            linkingCode: step1Data.linkingCode,
            checkInDateId: step1Data.checkInDateId,

            // Paso 2
            ...structuredClone(RESERVATIONGENERALFORMDATA_PASO2_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 2 template y asi los valores no se pasan por referencias

            // Paso 3
            ...structuredClone(RESERVATIONGENERALFORMDATA_PASO3_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 3 template y asi los valores no se pasan por referencias

            // Metadatos
            status: 'step1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setCurrentReservation(newReservation)
        } else {
          // Actualizar solo los campos del paso 1
          const updatedReservation = {
            ...currentReservation.value,

            reservationId: step1Data.reservationId,
            attendingWithChildrenUnder3: step1Data.attendingWithChildrenUnder3,
            reservationDate: step1Data.reservationDate,
            visitObjectiveId: step1Data.visitObjectiveId,
            totalKids: step1Data.totalKids,
            totalKidsWithDisabilities: step1Data.totalKidsWithDisabilities!,
            totalTeenagers: step1Data.totalTeenagers,
            totalTeenagersWithDisabilities: step1Data.totalTeenagersWithDisabilities!,
            totalYoungAdults: step1Data.totalYoungAdults,
            totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities!,
            totalAdults: step1Data.totalAdults,
            totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities!,
            totalSeniors: step1Data.totalSeniors,
            totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities!,
            visitorId: step1Data.visitorId,
            totalKidsUnderThree: step1Data.totalKidsUnderThree!,
            linkingCode: step1Data.linkingCode,
            checkInDateId: step1Data.checkInDateId,

            updatedAt: step1Data.updatedAt
          }
          setCurrentReservation(updatedReservation)
        }
  
        return step1Data
  
      } catch (err) {
        setStepError(1, err instanceof Error ? err.message : 'Error al cargar paso 1')
        return null
      } finally {
        setStepLoading(1, false)
      }
    }

        /**
         * Carga solo los datos del paso 2 de una reservación
         */
        const loadStep2 = async (reservationId: number): Promise<any> => {
          if (isLoadingStep2.value) return false
    
          setStepLoading(2, true)
          clearStepError(2)
    
          try {
            const response: ReservationGeneralStep2ApiResponse = await reservationGeneralService.getReservationGeneralStep2(reservationId)
            
            console.log('🔍 loadStep2 - Respuesta completa del servidor:', response)
            
            // Extraer los datos reales de la respuesta del servidor
            // El servidor devuelve una estructura ApiResponse, no directamente los datos
            const step2Data = (response as any).response || response
            
            console.log('🔍 loadStep2 - Datos extraídos:', step2Data)
            console.log('🔍 loadStep2 - interestTopicId:', step2Data.interestTopicId)
            console.log('🔍 loadStep2 - fullName:', step2Data.fullName)
            console.log('🔍 loadStep2 - email:', step2Data.email)
            
            // Actualizar solo los datos del paso 2 en el formulario
            const formDataUpdate: Partial<ReservationGeneral> = {
              reservationId: step2Data.reservationId,
              interestTopicId: step2Data.interestTopicId,
              isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
              isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
              fullName: step2Data.fullName,
              email: step2Data.email,
              phone: step2Data.phone,
              whereAreYouVisitingFromId: step2Data.whereAreYouVisitingFromId,
              specialAssistances: step2Data.specialAssistances,
              visitorId: step2Data.visitorId
            }
            
            console.log('🔍 loadStep2 - Datos que se van a actualizar en formData:', formDataUpdate)
            updateFormData(formDataUpdate)
            console.log('🔍 loadStep2 - formData después de actualizar:', formData.value)
    
            // Actualizar la reservación actual con los datos del paso 2
            if (currentReservation.value) {
              const updatedReservation = {
                ...currentReservation.value,
                reservationId: step2Data.reservationId,
                interestTopicId: step2Data.interestTopicId,
                isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
                isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
                fullName: step2Data.fullName,
                email: step2Data.email,
                phone: step2Data.phone,
                whereAreYouVisitingFromId: step2Data.whereAreYouVisitingFromId,
                specialAssistances: step2Data.specialAssistances,
                visitorId: step2Data.visitorId,

                // Metadatos
                status: 'step2' as const,
                updatedAt: new Date().toISOString()
              }
              setCurrentReservation(updatedReservation)
            }
    
            return step2Data
    
          } catch (err) {
            setStepError(2, err instanceof Error ? err.message : 'Error al cargar paso 2')
            return null
          } finally {
            setStepLoading(2, false)
          }
        }

        /**
         * Verifica si una reservación tiene personas con discapacidad
         */
        const checkReservationHasDisability = async (reservationId: number): Promise<boolean> => {
          try {
            const hasDisability = await reservationGeneralService.checkReservationHasDisability(reservationId)
            console.log('🔍 Store - Verificación de discapacidad:', { reservationId, hasDisability })
            return hasDisability
          } catch (err) {
            console.error('❌ Store - Error al verificar discapacidad:', err)
            return false
          }
        }

            /**
             * Carga solo los datos del paso 3 de una reservación
             */
            const loadStep3 = async (reservationId: number): Promise<any> => {
              if (isLoadingStep3.value) return false
        
              setStepLoading(3, true)
              clearStepError(3)
        
              try {
                const response = await reservationGeneralService.getReservationGeneralStep3(reservationId)
                
                console.log('🔍 loadStep3 - Respuesta completa del servidor:', response)
                
                // Extraer los datos reales de la respuesta del servidor
                // El servidor devuelve una estructura ApiResponse, no directamente los datos
                const step3Data = (response as any).response || response
                
                console.log('🔍 loadStep3 - Datos extraídos:', step3Data)
                console.log('🔍 loadStep3 - paymentMethodId:', step3Data.paymentMethodId)
                console.log('🔍 loadStep3 - discoveryChannelId:', step3Data.discoveryChannelId)
                
                // Actualizar solo los datos del paso 3 en el formulario
                const formDataUpdate = {
                  reservationId: step3Data.reservationId,
                  paymentMethodId: step3Data.paymentMethodId,
                  discoveryChannelId: step3Data.discoveryChannelId,
                  workShops: step3Data.workShops,
                  isTermsAccepted: step3Data.isTermsAccepted,
                  visitorId: step3Data.visitorId
                }
                
                console.log('🔍 loadStep3 - Datos que se van a actualizar en formData:', formDataUpdate)
                updateFormData(formDataUpdate)
                console.log('🔍 loadStep3 - formData después de actualizar:', formData.value)
        
                // Actualizar la reservación actual con los datos del paso 3
                if (currentReservation.value) {
                  const updatedReservation = {
                    ...currentReservation.value,
                    reservationId: step3Data.reservationId,
                    paymentMethodId: step3Data.paymentMethodId,
                    discoveryChannelId: step3Data.discoveryChannelId,
                    workShops: step3Data.workShops,
                    isTermsAccepted: step3Data.isTermsAccepted,
                    visitorId: step3Data.visitorId,
                    status: 'step3' as const,
                    updatedAt: new Date().toISOString() // response
                  }
                  setCurrentReservation(updatedReservation)
                }
        
                return step3Data
        
              } catch (err) {
                setStepError(3, err instanceof Error ? err.message : 'Error al cargar paso 3')
                return null
              } finally {
                setStepLoading(3, false)
              }
            }
  
    // ============================================================================
    // RETORNO DEL STORE
    // ============================================================================
  
    return {
      // Estados reactivos
      currentReservation,
      currentReservationId,
      formData,
      reservations,
      currentStep,
      isCompleted,
      
      // Estados de loading
      isCreating,
      isUpdating,
      isLoading,
      isLoadingStep1,
      isLoadingStep2,
      isLoadingStep3,
      isLoadingAny,
      
      // Estados de error
      error,
      stepErrors,
      
      // Computed properties
      totalPeople,
      isStep1Valid,
      isStep2Valid,
      isStep3Valid,
      reservationStatus,
      
      // Operaciones de reservación
      setCurrentReservation,
      setCurrentReservationId,
      updateFormData,
      updateStepData,
      getStepData,
      resetForm,
      clearPersistence,
      loadFromStorage,
      initializeStore,
      
      // Operaciones de estado
      setCurrentStep,
      nextStep,
      previousStep,
      markAsCompleted,
      
      // Operaciones de loading
      setCreating,
      setUpdating,
      setLoading,
      setStepLoading,
      
      // Operaciones de error
      setError,
      setStepError,
      clearStepError,
      clearAllErrors,
      
      // Operaciones de reservaciones
      addReservation,
      updateReservation,
      removeReservation,
      setReservations,
      
      // Operaciones de API
      createReservationGeneralStep1,
      updateReservationGeneralStep1,
      updateReservationGeneralStep2,
      updateReservationGeneralStep3,
      getAllReservationGeneralObjectiveVisit,
      getAllLinkingCodes,
      loadStep1,
      loadStep2,
      loadStep3,
      checkReservationHasDisability
    }
  }
) 