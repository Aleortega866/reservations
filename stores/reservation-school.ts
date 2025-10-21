import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue' 
import { reservationSchoolService } from '@/lib/api/services/reservations/reservation.school.service' 
import { useLocalStorage, clearLocalStorage } from '@/composables/utils/useLocalStorage'
import { useReservationStepStatusStore } from './reservation-step-status'
import type { ReservationSchool, ReservationSchoolStatus,
  ReservationSchoolFormData, 
  ReservationSchoolAcademicLevelsFilters,
  ReservationSchoolAcademicLevelResponse,
  ReservationSchoolCUApiResponse,
  ReservationSchoolStep1ApiResponse,
  ReservationSchoolStep2ApiResponse,
  CreateUpdateReservationSchoolStep1Request, 
  UpdateReservationSchoolStep2Request, 
  UpdateReservationSchoolStep3Request, 
  ReservationSchoolObjectiveVisitResponse
} from '@/lib/api/types/reservation/school'

  // Definir defineStore si no está disponible 
  const defineStore = (_id: string, setup: any) => { return () => setup() }



  export const useReservationSchoolStore = defineStore(
    'reservation-school',
    () => {

    // Inicializar el store de estado de pasos
    const stepStatusStore = useReservationStepStatusStore()
    
    // ============================================================================
    // CLAVES DE LOCALSTORAGE
    // ============================================================================
    
    const STORAGE_KEYS: Record<string, string> = {
      FORM_DATA: 'reservation-school-form-data',
      CURRENT_STEP: 'reservation-school-current-step',
      CURRENT_RESERVATION_ID: 'reservation-school-current-id',
      IS_COMPLETED: 'reservation-school-is-completed'
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

    // Paso 1 de reservacion escolar (plantilla). 
    const RESERVATIONSCHOOLFORMDATA_PASO1_TEMPLATE = Object.freeze({
      reservationId: null,
      institutionId: null,
      visitObjectiveId: null,
      schoolGroups: null,
      schoolLevels: null,
      visitorId: null,
      reservationDate: '',
      checkInDateId: null
    })

    // Paso 2 de reservacion escolar (plantilla). 
    const RESERVATIONSCHOOLFORMDATA_PASO2_TEMPLATE = Object.freeze({
      primaria: [],
      secundaria: [],
      mediaSuperior: [],
      superior: [],
      posgrado: [],
      isReservationPersonAlsoResponsible: true,
      isResponsibleNotAssigned: false,
      fullName: null,
      email: null,
      phone: null,
      specialAssistances: null
    })

    // Paso 3 de reservacion escolar (plantilla). 
    const RESERVATIONSCHOOLFORMDATA_PASO3_TEMPLATE = Object.freeze({
      workShops: null,
      paymentMethodId: null,
      discoveryChannelId: null,
      needCivilProtectionDocument: false,
      needHelpCrossingStreet: false,
      isTermsAccepted: false,

      // Campos adicionales del formulario
      parkingInfo: null,
      invoice: null,
      providerInfo: null,
      documents: null
    })

    // Formulario de reservacion escolar (plantilla) con ...spread de los pasos divididos por plantilla
    const RESERVATIONSCHOOLFORMDATA_TEMPLATE = Object.freeze({    
      // Con structuredClone crea una copia clon profunda de cada paso y asi los valores no se pasan por referencias
      ...structuredClone(RESERVATIONSCHOOLFORMDATA_PASO1_TEMPLATE),
      ...structuredClone(RESERVATIONSCHOOLFORMDATA_PASO2_TEMPLATE),
      ...structuredClone(RESERVATIONSCHOOLFORMDATA_PASO3_TEMPLATE)
    })
  
    // Datos de la reservación actual
    type TypeReservationSchool = ReservationSchool | null
    const currentReservation: Ref<TypeReservationSchool> = ref(null)
    
    // Datos del formulario actual con persistencia
    const defaultFormData: ReservationSchoolFormData = {
      // Con structuredClone crea una copia clon profunda del template y asi los valores no se pasan por referencias
      ...structuredClone(RESERVATIONSCHOOLFORMDATA_TEMPLATE),
    }
    
    type TypeCurrentReservationId = number | null
    const formData: Ref<ReservationSchoolFormData> = useLocalStorage(STORAGE_KEYS.FORM_DATA, defaultFormData)
    const currentReservationId: Ref<TypeCurrentReservationId> = useLocalStorage(STORAGE_KEYS.CURRENT_RESERVATION_ID, null as number | null)
  
    // Lista de reservaciones
    const reservations: Ref<ReservationSchool[]> = ref([])
  
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

    // Validación del paso 1
    const isStep1Valid: ComputedRef<boolean> = computed(() => {
      const data = formData.value
      return !!(
        data.institutionId &&
        data.visitObjectiveId &&
        data.schoolLevels &&
        data.visitorId &&
        data.reservationDate &&
        data.checkInDateId
      )
    })
  
    // Validación del paso 2
    const isStep2Valid: ComputedRef<boolean> = computed(() => {
      const data = formData.value
      if (!data.isResponsibleNotAssigned) {
        return !!(
          data.fullName?.trim() &&
          data.email?.trim() &&
          data.phone?.trim()
        )
      }
      return true
    })

    // Validación del paso 3
    const isStep3Valid: ComputedRef<boolean> = computed(() => {
      const data = formData.value
      if(data.isTermsAccepted === true) {
        return !!(
          data.workShops && data.workShops.length > 0 &&
          data.paymentMethodId &&
          data.discoveryChannelId &&
          data.isTermsAccepted
        )
      }
      return true
    })
  
    // Estado de la reservación actual
    const reservationStatus: ComputedRef<ReservationSchoolStatus> = computed(() => {
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
            console.log('🚀 Inicializando store de reservación escolar...')
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
     const setCurrentReservation = (reservation: ReservationSchool): void => {
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
    const updateFormData = (updates: Partial<ReservationSchoolFormData>): void => {
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
            institutionId: data.institutionId,
            visitObjectiveId: data.visitObjectiveId,
            schoolGroups: data.schoolGroups,
            schoolLevels: data.schoolLevels,
            visitorId: data.visitorId,
            reservationDate: data.reservationDate,
            checkInDateId: data.checkInDateId
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
            visitorId: data.visitorId,
            primaria: data.primaria,
            secundaria: data.secundaria,
            mediaSuperior: data.mediaSuperior,
            superior: data.superior,
            posgrado: data.posgrado,
            isReservationPersonAlsoResponsible: data.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: data.isResponsibleNotAssigned,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            specialAssistances: data.specialAssistances
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
            visitorId: data.visitorId,
            workShops: data.workShops,
            paymentMethodId: data.paymentMethodId,
            discoveryChannelId: data.discoveryChannelId,
            needCivilProtectionDocument: data.needCivilProtectionDocument,
            needHelpCrossingStreet: data.needHelpCrossingStreet,
            isTermsAccepted: data.isTermsAccepted,
            // Campos adicionales del formulario (mantener compatibilidad)
            parkingInfo: data.requiresDetailedLocationInformation,
            invoice: data.requestsPostVisitInvoice,
            providerInfo: data.needsCheckoutProcessInformation,
            documents: data.documents
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
            institutionId: formData.value.institutionId,
            visitObjectiveId: formData.value.visitObjectiveId,
            schoolGroups: formData.value.schoolGroups,
            schoolLevels: formData.value.schoolLevels,
            visitorId: formData.value.visitorId,
            reservationDate: formData.value.reservationDate,
            checkInDateId: formData.value.checkInDateId,
          }
        case 2:
          return {
            visitorId: formData.value.visitorId,
            reservationId: formData.value.reservationId,
            isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
            primaria: formData.value.primaria,
            secundaria: formData.value.secundaria,
            mediaSuperior: formData.value.mediaSuperior,
            superior: formData.value.superior,
            posgrado: formData.value.posgrado,
            fullName: formData.value.fullName,
            email: formData.value.email,
            phone: formData.value.phone,
            specialAssistances: formData.value.specialAssistances
          }
        case 3:
          return {
            workShops: formData.value.workShops,
            reservationId: formData.value.reservationId,
            paymentMethodId: formData.value.paymentMethodId,
            discoveryChannelId: formData.value.discoveryChannelId,
            needCivilProtectionDocument: formData.value.needCivilProtectionDocument,
            needHelpCrossingStreet: formData.value.needHelpCrossingStreet,
            isTermsAccepted: formData.value.isTermsAccepted,
            visitorId: formData.value.visitorId,
            // Campos adicionales del formulario
            parkingInfo: formData.value.parkingInfo,
            invoice: formData.value.invoice,
            providerInfo: formData.value.providerInfo,
            documents: formData.value.documents
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
    const addReservation = (reservation: ReservationSchool): void => {
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
    const updateReservation = (reservation: ReservationSchool): void => {
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
    const setReservations = (reservationsList: ReservationSchool[]): void => {
      reservations.value = reservationsList
      console.log('📝 Lista de reservaciones establecida:', reservationsList.length)
    }
  
    // ============================================================================
    // OPERACIONES DE API
    // ============================================================================
  
    /**
     * Crea una nueva reservación escolar (Paso 1)
     */
    type TypePromiseCreateReservationSchoolStep1 = ReservationSchool | null
    const createReservationSchoolsStep1 = async (requestData?: CreateUpdateReservationSchoolStep1Request): Promise<TypePromiseCreateReservationSchoolStep1> => {
      // Si se proporcionan datos, usarlos; si no, usar los del formulario
      const dataToUse = requestData || {
        institutionId: formData.value.institutionId!,
        visitObjectiveId: formData.value.visitObjectiveId!,
        schoolGroups: formData.value.schoolGroups,
        schoolLevels: formData.value.schoolLevels!,
        visitorId: formData.value.visitorId!,
        reservationDate: formData.value.reservationDate,
        checkInDateId: formData.value.checkInDateId!
      }
  
      // Validar que los datos requeridos estén presentes
      if (!dataToUse.institutionId || !dataToUse.visitObjectiveId || !dataToUse.schoolLevels || !dataToUse.visitorId || !dataToUse.reservationDate || !dataToUse.checkInDateId) {
        const errorMsg: string = 'Por favor completa todos los campos requeridos del paso 1'
        setStepError(1, errorMsg)
        return null
      }

      if (isCreating.value) return null
  
      setCreating(true)
      clearStepError(1)
  
      try {
        const response: ReservationSchoolCUApiResponse = await reservationSchoolService.createReservationSchoolsStep1(dataToUse)
        
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
        const newReservation: ReservationSchool = {
          // Paso 1
          reservationId: reservationId as unknown as number,
          institutionId: dataToUse.institutionId,
          visitObjectiveId: dataToUse.visitObjectiveId,
          schoolGroups: dataToUse.schoolGroups,
          schoolLevels: dataToUse.schoolLevels,
          visitorId: dataToUse.visitorId,
          reservationDate: dataToUse.reservationDate,
          checkInDateId: dataToUse.checkInDateId,

          // Paso 2
          ...structuredClone(RESERVATIONSCHOOLFORMDATA_PASO2_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 2 template y asi los valores no se pasan por referencias

          // Paso 3
          ...structuredClone(RESERVATIONSCHOOLFORMDATA_PASO3_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 3 template y asi los valores no se pasan por referencias

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
     * Modifica una reservación escolar (Paso 1)
     */
    type TypePromiseUpdateReservationSchoolStep1 = ReservationSchool | null
     const updateReservationSchoolsStep1 = async (requestData?: CreateUpdateReservationSchoolStep1Request): Promise<TypePromiseUpdateReservationSchoolStep1> => {
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
        const response: ReservationSchoolCUApiResponse = await reservationSchoolService.updateReservationSchoolsStep1(updateData as CreateUpdateReservationSchoolStep1Request)

        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            institutionId: requestData?.institutionId!,
            visitObjectiveId: requestData?.visitObjectiveId!,
            schoolGroups: requestData?.schoolGroups,
            schoolLevels: requestData?.schoolLevels!,
            visitorId: requestData?.visitorId!,
            reservationDate: requestData?.reservationDate,
            checkInDateId: requestData?.checkInDateId!,

            // Metadatos
            status: 'step1' as const,
            updatedAt: new Date().toISOString() // response
          }

          setCurrentReservation(updatedReservation as ReservationSchool)
          updateReservation(updatedReservation as ReservationSchool)
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
    type TypePromiseUpdateReservationSchoolStep2 = ReservationSchool | null
    const updateReservationSchoolsStep2 = async (): Promise<TypePromiseUpdateReservationSchoolStep2> => {
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
        const requestData: UpdateReservationSchoolStep2Request = {
          reservationId: typeof currentReservation.value.reservationId === 'string' ? parseInt(currentReservation.value.reservationId, 10) : currentReservation.value.reservationId!,
          visitorId: formData.value.visitorId!,
          primaria: formData.value.primaria,
          secundaria: formData.value.secundaria,
          mediaSuperior: formData.value.mediaSuperior,
          superior: formData.value.superior,
          posgrado: formData.value.posgrado,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
          fullName: formData.value.fullName,
          email: formData.value.email,
          phone: formData.value.phone,
          specialAssistances: formData.value.specialAssistances,
        }

        console.log('requestData-----------------------', requestData)
        console.log('requestData-----------------------', currentReservation)
  
        await reservationSchoolService.updateReservationSchoolsStep2(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,

            visitorId: requestData.visitorId!,
            primaria: requestData.primaria,
            secundaria: requestData.secundaria,
            mediaSuperior: requestData.mediaSuperior,
            superior: requestData.superior,
            posgrado: requestData.posgrado,
            isReservationPersonAlsoResponsible: requestData.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: requestData.isResponsibleNotAssigned,
            fullName: requestData.fullName,
            email: requestData.email,
            phone: requestData.phone,
            specialAssistances: requestData.specialAssistances,

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
    type TypePromiseUpdateReservationSchoolStep3 = ReservationSchool | null
    const updateReservationSchoolsStep3 = async (): Promise<TypePromiseUpdateReservationSchoolStep3> => {
      // Si no hay reservación activa pero sí hay ID, crear un objeto básico sin cargar datos
      if (!currentReservation.value && currentReservationId.value) {
        console.log('🔄 Creando objeto de reservación básico para actualizar paso 3:', currentReservationId.value)
        const basicReservation: ReservationSchool = {
          // Campos del paso 1
          reservationId: currentReservationId.value,
          visitorId: formData.value.visitorId!, 
          institutionId: formData.value.institutionId!,
          visitObjectiveId: formData.value.visitObjectiveId!,
          schoolGroups: formData.value.schoolGroups,
          schoolLevels: formData.value.schoolLevels!,
          reservationDate: formData.value.reservationDate,
          checkInDateId: formData.value.checkInDateId!,
          
          // Campos del paso 2
          primaria: formData.value.primaria,
          secundaria: formData.value.secundaria,
          mediaSuperior: formData.value.mediaSuperior,
          superior: formData.value.superior,
          posgrado: formData.value.posgrado,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
          fullName: formData.value.fullName,
          email: formData.value.email,
          phone: formData.value.phone,
          specialAssistances: formData.value.specialAssistances,
          // Campos del paso 3
          workShops: formData.value.workShops,
          paymentMethodId: formData.value.paymentMethodId,
          discoveryChannelId: formData.value.discoveryChannelId,
          needCivilProtectionDocument: formData.value.needCivilProtectionDocument,
          needHelpCrossingStreet: formData.value.needHelpCrossingStreet,
          isTermsAccepted: formData.value.isTermsAccepted,
          // Campos adicionales requeridos
          parkingInfo: null,
          invoice: null,
          providerInfo: null,
          documents: [],
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
        const requestData: UpdateReservationSchoolStep3Request = {
          reservationId: typeof currentReservation.value.reservationId === 'string' ? parseInt(currentReservation.value.reservationId, 10) : currentReservation.value.reservationId!,
          visitorId: formData.value.visitorId!,
          workShops: formData.value.workShops,
          paymentMethodId: formData.value.paymentMethodId!,
          discoveryChannelId: formData.value.discoveryChannelId!,
          needCivilProtectionDocument: formData.value.needCivilProtectionDocument,
          needHelpCrossingStreet: formData.value.needHelpCrossingStreet,
          isTermsAccepted: formData.value.isTermsAccepted,
          // Campos adicionales del formulario
          parkingInfo: formData.value.parkingInfo,
          invoice: formData.value.invoice,
          providerInfo: formData.value.providerInfo,
          documents: formData.value.documents
        }
  
        await reservationSchoolService.updateReservationSchoolsStep3(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,

            reservationId: requestData.reservationId!,
            visitorId: requestData.visitorId!,
            workShops: requestData?.workShops,
            paymentMethodId: requestData?.paymentMethodId,
            discoveryChannelId: requestData?.discoveryChannelId,
            needCivilProtectionDocument: requestData?.needCivilProtectionDocument,
            needHelpCrossingStreet: requestData?.needHelpCrossingStreet,
            isTermsAccepted: requestData?.isTermsAccepted,


            // Campos adicionales del formulario
            parkingInfo: requestData?.parkingInfo,
            invoice: requestData?.invoice,
            providerInfo: requestData?.providerInfo,
            documents: requestData?.documents,

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
    type TypeReservationSchoolObjectiveVisit = ReservationSchoolObjectiveVisitResponse[] | []
    const getAllReservationSchoolObjectiveVisit = async (): Promise<TypeReservationSchoolObjectiveVisit> => {

      try {
  
        const response = await reservationSchoolService.getAllReservationSchoolObjectiveVisit()
  
        return response.response // Devuelve los objetivos de visita 
  
      } catch (err) {
        console.log('Ocurrio un error al obtener los objetivos de la visita')
        throw err
      } finally {
        //
      }
    }

    /**
     * Obtiene los niveles academicos para la reservacion escolar
     */
    type TypeReservationSchoolAcademicLevel = ReservationSchoolAcademicLevelResponse[] | []
    const getAllReservationSchoolAcademicLevels = async (academicLevelFilters?: ReservationSchoolAcademicLevelsFilters): Promise<TypeReservationSchoolAcademicLevel> => {

      try {
  
        const response = await reservationSchoolService.getAllReservationSchoolAcademicLevels(academicLevelFilters)
  
        return response.response // Devuelve los objetivos de visita 
  
      } catch (err) {
        console.log('Ocurrio un error al obtener los niveles academicos')
        throw err
      } finally {
        //
      }
    }
  
    /**
     * Carga solo los datos del paso 1 de una reservación
     */
    const loadStep1 = async (reservationId: number): Promise<any> => {
      console.log('🚨 ADVERTENCIA: loadStep1 ejecutándose desde reservation-school.ts', {
        reservationId,
        stackTrace: new Error().stack
      })

      // 🚨 TINGU ADVERTENCIA: Verificar si ya está cargándose
      if (isLoadingStep1.value) {
        console.log('🚨 TINGU ADVERTENCIA: Paso 1 ya está cargándose, retornando false')
        return false
      }

      // // 🚨 TINGU ADVERTENCIA: Verificar si ya se cargó recientemente (últimos 2 segundos)
      // const now = Date.now()
      // const lastLoadTime = (window as any).lastStep1LoadTime || 0
      // if (now - lastLoadTime < 2000) {
      //   console.log('🚨 TINGU ADVERTENCIA: Paso 1 se cargó hace menos de 2 segundos, omitiendo carga duplicada')
      //   return false
      // }
      // (window as any).lastStep1LoadTime = now

      setStepLoading(1, true)
      clearStepError(1)
  
      try {
        const response: ReservationSchoolStep1ApiResponse = await reservationSchoolService.getReservationSchoolStep1(reservationId)

        console.log('🔍 loadStep1 - Respuesta completa del servidor:', response)
        
        // Extraer los datos reales de la respuesta del servidor
        // El servidor devuelve una estructura ApiResponse, no directamente los datos
        const step1Data = (response as any).response || response
        
        console.log('🔍 loadStep1 - Datos extraídos:', step1Data)
        
        // Actualizar solo los datos del paso 1 en el formulario
        const formDataUpdate: Partial<ReservationSchool> = {
          reservationId: step1Data.reservationId,
          visitorId: step1Data.visitorId,
          institutionId: step1Data.institutionId,
          visitObjectiveId: step1Data.visitObjectiveId,
          schoolGroups: step1Data.schoolGroups,
          schoolLevels: step1Data.schoolLevels,
          reservationDate: step1Data.reservationDate,
          checkInDateId: step1Data.checkInDateId
        }
        
        console.log('🔍 loadStep1 - Datos que se van a actualizar en formData:', formDataUpdate)
        updateFormData(formDataUpdate)
        console.log('🔍 loadStep1 - formData después de actualizar:', formData.value)
  
        // Actualizar o crear la reservación actual
        if (!currentReservation.value) {
          const newReservation: ReservationSchool = {
            // Paso 1
            reservationId: step1Data.reservationId,
            visitorId: step1Data.visitorId,
            institutionId: step1Data.institutionId,
            visitObjectiveId: step1Data.visitObjectiveId,
            schoolGroups: step1Data.schoolGroups,
            schoolLevels: step1Data.schoolLevels,
            reservationDate: step1Data.reservationDate,
            checkInDateId: step1Data.checkInDateId,

            // Paso 2
            ...structuredClone(RESERVATIONSCHOOLFORMDATA_PASO2_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 2 template y asi los valores no se pasan por referencias

            // Paso 3
            ...structuredClone(RESERVATIONSCHOOLFORMDATA_PASO3_TEMPLATE), // Con structuredClone crea una copia clon profunda del paso 3 template y asi los valores no se pasan por referencias

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
            visitorId: step1Data.visitorId,
            institutionId: step1Data.institutionId,
            visitObjectiveId: step1Data.visitObjectiveId,
            schoolGroups: step1Data.schoolGroups,
            schoolLevels: step1Data.schoolLevels,
            reservationDate: step1Data.reservationDate,
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
            const response: ReservationSchoolStep2ApiResponse = await reservationSchoolService.getReservationSchoolStep2(reservationId)
            
            console.log('🔍 loadStep2 - Respuesta completa del servidor:', response)
            
            // Extraer los datos reales de la respuesta del servidor
            // El servidor devuelve una estructura ApiResponse, no directamente los datos
            const step2Data = (response as any).response || response
            
            console.log('🔍 loadStep2 - Datos extraídos:', step2Data)
            console.log('🔍 loadStep2 - fullName:', step2Data.fullName)
            console.log('🔍 loadStep2 - email:', step2Data.email)
            
            // Actualizar solo los datos del paso 2 en el formulario
            const formDataUpdate: Partial<ReservationSchool> = {
              reservationId: step2Data.reservationId,
              visitorId: step2Data.visitorId,
              primaria: step2Data.primaria,
              secundaria: step2Data.secundaria,
              mediaSuperior: step2Data.mediaSuperior,
              superior: step2Data.superior,
              posgrado: step2Data.posgrado,
              isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
              isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
              fullName: step2Data.fullName,
              email: step2Data.email,
              phone: step2Data.phone,
              specialAssistances: step2Data.specialAssistances
            }
            
            console.log('🔍 loadStep2 - Datos que se van a actualizar en formData:', formDataUpdate)
            updateFormData(formDataUpdate)
            console.log('🔍 loadStep2 - formData después de actualizar:', formData.value)
    
            // Actualizar la reservación actual con los datos del paso 2
            if (currentReservation.value) {
              const updatedReservation = {
                ...currentReservation.value,
                reservationId: step2Data.reservationId,
                visitorId: step2Data.visitorId,
                primaria: step2Data.primaria,
                secundaria: step2Data.secundaria,
                mediaSuperior: step2Data.mediaSuperior,
                superior: step2Data.superior,
                posgrado: step2Data.posgrado,
                isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
                isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
                fullName: step2Data.fullName,
                email: step2Data.email,
                phone: step2Data.phone,
                specialAssistances: step2Data.specialAssistances,

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
            const hasDisability = await reservationSchoolService.checkReservationHasDisability(reservationId)
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
                const response = await reservationSchoolService.getReservationSchoolStep3(reservationId)
                
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
                  visitorId: step3Data.visitorId,
                  workShops: step3Data.workShops,
                  paymentMethodId: step3Data.paymentMethodId,
                  discoveryChannelId: step3Data.discoveryChannelId,
                  needCivilProtectionDocument: step3Data.needCivilProtectionDocument,
                  needHelpCrossingStreet: step3Data.needHelpCrossingStreet,
                  isTermsAccepted: step3Data.isTermsAccepted,
                  // Campos adicionales del formulario
                  parkingInfo: step3Data.parkingInfo,
                  invoice: step3Data.invoice,
                  providerInfo: step3Data.providerInfo,
                  documents: step3Data.documents
                }
                
                console.log('🔍 loadStep3 - Datos que se van a actualizar en formData:', formDataUpdate)
                updateFormData(formDataUpdate)
                console.log('🔍 loadStep3 - formData después de actualizar:', formData.value)
        
                // Actualizar la reservación actual con los datos del paso 3
                if (currentReservation.value) {
                  const updatedReservation = {
                    ...currentReservation.value,
                    reservationId: step3Data.reservationId,
                    visitorId: step3Data.visitorId,
                    workShops: step3Data.workShops,
                    paymentMethodId: step3Data.paymentMethodId,
                    discoveryChannelId: step3Data.discoveryChannelId,
                    needCivilProtectionDocument: step3Data.needCivilProtectionDocument,
                    needHelpCrossingStreet: step3Data.needHelpCrossingStreet,
                    isTermsAccepted: step3Data.isTermsAccepted,
                    // Campos adicionales del formulario
                    parkingInfo: step3Data.parkingInfo,
                    invoice: step3Data.invoice,
                    providerInfo: step3Data.providerInfo,
                    documents: step3Data.documents,
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
      createReservationSchoolsStep1,
      updateReservationSchoolsStep1,
      updateReservationSchoolsStep2,
      updateReservationSchoolsStep3,
      getAllReservationSchoolObjectiveVisit,
      getAllReservationSchoolAcademicLevels,
      loadStep1,
      loadStep2,
      loadStep3,
      checkReservationHasDisability
    }
  }
) 