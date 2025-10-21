import { ref, computed } from 'vue' 
import { reservationCompanyService } from '@/lib/api/services/reservations/reservation.company.service' 
import { useLocalStorage, clearLocalStorage } from '@/composables/utils/useLocalStorage'
import { useReservationStepStatusStore } from './reservation-step-status'
import type { ReservationCompany,
  ReservationCompanyFormData,

  CreateReservationCompanyStep1Request,
  UpdateReservationCompanyStep2Request,
  UpdateReservationCompanyStep3Request,
  CostBreakdown } from '@/lib/api/types/reservation/company'

  // Definir defineStore si no está disponible 
  const defineStore = (_id: string, setup: any) => { return () => setup() }



  export const useReservationCompanyStore = defineStore(
    'reservation-company',
    () => {
    
    // Inicializar el store de estado de pasos
    const stepStatusStore = useReservationStepStatusStore()
    
    // ============================================================================
    // CLAVES DE LOCALSTORAGE
    // ============================================================================
    
    const STORAGE_KEYS = {
      FORM_DATA: 'reservation-company-form-data',
      CURRENT_STEP: 'reservation-company-current-step',
      CURRENT_RESERVATION_ID: 'reservation-company-current-id',
      IS_COMPLETED: 'reservation-company-is-completed'
    }
    
    // ============================================================================
    // ESTADOS REACTIVOS CON PERSISTENCIA
    // ============================================================================
  
    // Estados de loading granulares
    const isCreating = ref(false)
    const isUpdating = ref(false)
    const isLoading = ref(false)
    const isLoadingStep1 = ref(false)
    const isLoadingStep2 = ref(false)
    const isLoadingStep3 = ref(false)
  
    // Estados de error
    const error = ref<string | null>(null)
    const stepErrors = ref({
      step1: null as string | null,
      step2: null as string | null,
      step3: null as string | null
    })

    // Datos de la reservación actual
    const currentReservation = ref<ReservationCompany | null>(null)

    // Desglose de costos del paso 3 (se obtiene del endpoint getStep3)
    const costBreakdown = ref<CostBreakdown | null>(null)
    
    // Datos del formulario actual con persistencia
    const defaultFormData: ReservationCompanyFormData = {
      // Paso 1
      visitorId: null,
      companyId: null,
      totalYoungAdults: 0,
      totalYoungAdultsWithDisabilities: 0,
      totalAdults: 0,
      totalAdultsWithDisabilities: 0,
      totalSeniors: 0,
      totalSeniorsWithDisabilities: 0,
      reservationDate: '',
      checkInDateId: null,
      visitObjectiveId: null,
      
      // Paso 2
      mainEconomicConceptId: null,
      secondaryEconomicConceptId: null,
      isReservationPersonAlsoResponsible: null,
      isResponsibleNotAssigned: null,
      fullName: '',
      email: '',
      phone: '',
      positionTypeIds: [],
      ageRangeIds: [],
      specialAssistanceIds: [],
      
      // Paso 3
      discoveryChannelId: null,
      paymentMethodId: null,
      requiresMediationService: null,
      requiresDetailedLocationInformation: null,
      requestsPostVisitInvoice: null,
      needsCheckoutProcessInformation: null,
      confirmsInformationAccuracy: null,
      totalPeople: null,
      totalCost: null,
      // Campos adicionales del formulario
      parkingInfo: null,
      invoice: null,
      providerInfo: null,
      documents: null
    }
    
    const formData = useLocalStorage(STORAGE_KEYS.FORM_DATA, defaultFormData)
    const currentReservationId = useLocalStorage(STORAGE_KEYS.CURRENT_RESERVATION_ID, null as number | null)
  
    // Lista de reservaciones
    const reservations = ref<ReservationCompany[]>([])
  
    // Estado del proceso actual con persistencia
    const currentStep = useLocalStorage(STORAGE_KEYS.CURRENT_STEP, 1 as 1 | 2 | 3)
    const isCompleted = useLocalStorage(STORAGE_KEYS.IS_COMPLETED, false)
  
    // ============================================================================
    // COMPUTED PROPERTIES
    // ============================================================================
  
    // Estado de loading consolidado
    const isLoadingAny = computed(() => 
      isCreating.value || 
      isUpdating.value || 
      isLoading.value ||
      isLoadingStep1.value ||
      isLoadingStep2.value ||
      isLoadingStep3.value
    )
  
    // Total de personas calculado
    const totalPeople = computed(() => 
      formData.value.totalYoungAdults +
      formData.value.totalYoungAdultsWithDisabilities +
      formData.value.totalAdults +
      formData.value.totalAdultsWithDisabilities +
      formData.value.totalSeniors +
      formData.value.totalSeniorsWithDisabilities
    )
  
    // Validación del paso 1
    const isStep1Valid = computed(() => {
      const data = formData.value
      return !!(
        data.visitorId &&
        data.companyId &&
        data.reservationDate &&
        data.checkInDateId &&
        data.visitObjectiveId &&
        totalPeople.value > 0
      )
    })
  
    // Validación del paso 2
    const isStep2Valid = computed(() => {
      const data = formData.value
      if (data.isResponsibleNotAssigned === false) {
        return !!(
          data.fullName?.trim() &&
          data.email?.trim() &&
          data.phone?.trim()
        )
      }
      return true
    })
  
    // Validación del paso 3
    const isStep3Valid = computed(() => {
      const data = formData.value
      console.log('🔍 Validando paso 3 - confirmsInformationAccuracy:', data.confirmsInformationAccuracy)
      
      // Solo validar que confirmsInformationAccuracy sea true
      const isValid = data.confirmsInformationAccuracy === true
      console.log('🔍 Validación paso 3 resultado:', isValid)
      return isValid
    })
  
    // Estado de la reservación actual
    const reservationStatus = computed(() => {
      if (!currentReservation.value) return 'draft'
      return currentReservation.value.status
    })
  
    // ============================================================================
    // FUNCIONES AUXILIARES
    // ============================================================================
  
    /**
     * Limpia errores de un paso específico
     */
    const clearStepError = (step: 1 | 2 | 3) => {
      stepErrors.value[`step${step}` as keyof typeof stepErrors.value] = null
    }
  
    /**
     * Limpia todos los errores
     */
    const clearAllErrors = () => {
      error.value = null
      stepErrors.value = {
        step1: null,
        step2: null,
        step3: null
      }
    }
  
    /**
     * Resetea el formulario a su estado inicial y limpia la persistencia
     */
    const resetForm = () => {
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
     * Limpia toda la persistencia del localStorage
     */
    const clearPersistence = () => {
      clearLocalStorage(STORAGE_KEYS.FORM_DATA)
      clearLocalStorage(STORAGE_KEYS.CURRENT_STEP)
      clearLocalStorage(STORAGE_KEYS.CURRENT_RESERVATION_ID)
      clearLocalStorage(STORAGE_KEYS.IS_COMPLETED)
      console.log('🗑️ Persistencia limpiada del localStorage')
    }
    
    /**
     * Carga datos desde localStorage (útil para debugging)
     */
    const loadFromStorage = async () => {
      if (process.client) {
        try {
          // Cargar datos del formulario
          const storedFormData = localStorage.getItem('reservation-company-form-data')
          if (storedFormData) {
            const parsedFormData = JSON.parse(storedFormData)
            formData.value = { ...formData.value, ...parsedFormData }
            console.log('📂 FormData cargado desde localStorage:', parsedFormData)
          }

          // Cargar ID de reservación actual
          const storedReservationId = localStorage.getItem('reservation-company-current-id')
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
          const storedCurrentStep = localStorage.getItem('reservation-company-current-step')
          if (storedCurrentStep) {
            const step = parseInt(storedCurrentStep) as 1 | 2 | 3
            if (step >= 1 && step <= 3) {
              currentStep.value = step
              console.log('📂 CurrentStep cargado desde localStorage:', currentStep.value)
            }
          }

          // Cargar estado de completado
          const storedIsCompleted = localStorage.getItem('reservation-company-is-completed')
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
    const initializeStore = async () => {
      if (process.client) {
        // Solo inicializar si no hay datos ya cargados
        if (!currentReservationId.value && !currentReservation.value) {
          console.log('🚀 Inicializando store de reservación empresarial...')
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
    const setCurrentReservation = (reservation: ReservationCompany) => {
      currentReservation.value = reservation
      currentReservationId.value = typeof reservation.id === 'string' ? parseInt(reservation.id, 10) : reservation.id
      console.log('✅ Reservación actual establecida:', reservation.id)
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
    const updateFormData = (updates: Partial<ReservationCompanyFormData>) => {
      Object.assign(formData.value, updates)
      console.log('📝 Datos del formulario actualizados:', updates)
    }
  
    /**
     * Actualiza los datos de un paso específico
     */
    const updateStepData = (step: 1 | 2 | 3, data: any) => {
      switch (step) {
        case 1:
          updateFormData({
            visitorId: data.visitorId,
            companyId: data.companyId,
            totalYoungAdults: data.totalYoungAdults,
            totalYoungAdultsWithDisabilities: data.totalYoungAdultsWithDisabilities,
            totalAdults: data.totalAdults,
            totalAdultsWithDisabilities: data.totalAdultsWithDisabilities,
            totalSeniors: data.totalSeniors,
            totalSeniorsWithDisabilities: data.totalSeniorsWithDisabilities,
            reservationDate: data.reservationDate,
            checkInDateId: data.checkInDateId,
            visitObjectiveId: data.visitObjectiveId
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
            mainEconomicConceptId: data.mainEconomicConceptId,
            secondaryEconomicConceptId: data.secondaryEconomicConceptId,
            isReservationPersonAlsoResponsible: data.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: data.isResponsibleNotAssigned,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            positionTypeIds: data.positionTypeIds,
            ageRangeIds: data.ageRangeIds,
            specialAssistanceIds: data.specialAssistanceIds
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
            discoveryChannelId: data.discoveryChannelId ? parseInt(data.discoveryChannelId) : null,
            paymentMethodId: data.paymentMethodId ? parseInt(data.paymentMethodId) : null,
            requiresMediationService: data.requiresMediationService,
            requiresDetailedLocationInformation: data.requiresDetailedLocationInformation,
            requestsPostVisitInvoice: data.requestsPostVisitInvoice,
            needsCheckoutProcessInformation: data.needsCheckoutProcessInformation,
            confirmsInformationAccuracy: data.confirmsInformationAccuracy,
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
    const getStepData = (step: 1 | 2 | 3) => {
      switch (step) {
        case 1:
          return {
            visitorId: formData.value.visitorId,
            companyId: formData.value.companyId,
            totalYoungAdults: formData.value.totalYoungAdults,
            totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities,
            totalAdults: formData.value.totalAdults,
            totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities,
            totalSeniors: formData.value.totalSeniors,
            totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities,
            reservationDate: formData.value.reservationDate,
            checkInDateId: formData.value.checkInDateId,
            visitObjectiveId: formData.value.visitObjectiveId
          }
        case 2:
          return {
            mainEconomicConceptId: formData.value.mainEconomicConceptId,
            secondaryEconomicConceptId: formData.value.secondaryEconomicConceptId,
            isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
            fullName: formData.value.fullName,
            email: formData.value.email,
            phone: formData.value.phone,
            positionTypeIds: formData.value.positionTypeIds,
            ageRangeIds: formData.value.ageRangeIds,
            specialAssistanceIds: formData.value.specialAssistanceIds
          }
        case 3:
          return {
            discoveryChannelId: formData.value.discoveryChannelId,
            paymentMethodId: formData.value.paymentMethodId,
            requiresMediationService: formData.value.requiresMediationService,
            requiresDetailedLocationInformation: formData.value.requiresDetailedLocationInformation,
            requestsPostVisitInvoice: formData.value.requestsPostVisitInvoice,
            needsCheckoutProcessInformation: formData.value.needsCheckoutProcessInformation,
            confirmsInformationAccuracy: formData.value.confirmsInformationAccuracy,
            totalPeople: formData.value.totalPeople,
            totalCost: formData.value.totalCost,
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
    const setCurrentStep = (step: 1 | 2 | 3) => {
      currentStep.value = step
      console.log('🔄 Paso actual establecido:', step)
    }
  
    /**
     * Avanza al siguiente paso
     */
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value = (currentStep.value + 1) as 1 | 2 | 3
        console.log('➡️ Avanzando al paso:', currentStep.value)
      }
    }
  
    /**
     * Retrocede al paso anterior
     */
    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value = (currentStep.value - 1) as 1 | 2 | 3
        console.log('⬅️ Retrocediendo al paso:', currentStep.value)
      }
    }
  
    /**
     * Marca la reservación como completada
     */
    const markAsCompleted = () => {
      isCompleted.value = true
      console.log('✅ Reservación marcada como completada')
    }
  
    // ============================================================================
    // OPERACIONES DE LOADING
    // ============================================================================
  
    /**
     * Establece el estado de loading para crear
     */
    const setCreating = (loading: boolean) => {
      isCreating.value = loading
    }
  
    /**
     * Establece el estado de loading para actualizar
     */
    const setUpdating = (loading: boolean) => {
      isUpdating.value = loading
    }
  
    /**
     * Establece el estado de loading general
     */
    const setLoading = (loading: boolean) => {
      isLoading.value = loading
    }
  
    /**
     * Establece el estado de loading para un paso específico
     */
    const setStepLoading = (step: 1 | 2 | 3, loading: boolean) => {
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
    const setError = (errorMessage: string | null) => {
      error.value = errorMessage
      if (errorMessage) {
        console.error('❌ Error establecido:', errorMessage)
      }
    }
  
    /**
     * Establece un error de paso específico
     */
    const setStepError = (step: 1 | 2 | 3, errorMessage: string | null) => {
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
    const addReservation = (reservation: ReservationCompany) => {
      const existingIndex = reservations.value.findIndex(r => r.id === reservation.id)
      if (existingIndex >= 0) {
        reservations.value[existingIndex] = reservation
      } else {
        reservations.value.push(reservation)
      }
      console.log('📝 Reservación agregada/actualizada:', reservation.id)
    }
  
    /**
     * Actualiza una reservación en la lista
     */
    const updateReservation = (reservation: ReservationCompany) => {
      const index = reservations.value.findIndex(r => r.id === reservation.id)
      if (index >= 0) {
        reservations.value[index] = reservation
        console.log('📝 Reservación actualizada:', reservation.id)
      }
    }
  
    /**
     * Elimina una reservación de la lista
     */
    const removeReservation = (reservationId: number) => {
      const index = reservations.value.findIndex(r => r.id === reservationId)
      if (index >= 0) {
        reservations.value.splice(index, 1)
        console.log('🗑️ Reservación eliminada:', reservationId)
      }
    }
  
    /**
     * Establece la lista completa de reservaciones
     */
    const setReservations = (reservationsList: ReservationCompany[]) => {
      reservations.value = reservationsList
      console.log('📝 Lista de reservaciones establecida:', reservationsList.length)
    }
  
    // ============================================================================
    // OPERACIONES DE API
    // ============================================================================
  
    /**
     * Crea una nueva reservación empresarial (Paso 1)
     */
    const createReservationStep1 = async (requestData?: CreateReservationCompanyStep1Request): Promise<ReservationCompany | null> => {
      // Si se proporcionan datos, usarlos; si no, usar los del formulario
      const dataToUse = requestData || {
        visitorId: formData.value.visitorId!,
        companyId: formData.value.companyId!,
        totalYoungAdults: formData.value.totalYoungAdults,
        totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities,
        totalAdults: formData.value.totalAdults,
        totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities,
        totalSeniors: formData.value.totalSeniors,
        totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities,
        reservationDate: formData.value.reservationDate,
        checkInDateId: formData.value.checkInDateId!,
        visitObjectiveId: formData.value.visitObjectiveId!
      }
  
      // Validar que los datos requeridos estén presentes
      if (!dataToUse.visitorId || !dataToUse.companyId || !dataToUse.checkInDateId || !dataToUse.visitObjectiveId) {
        const errorMsg = 'Por favor completa todos los campos requeridos del paso 1'
        setStepError(1, errorMsg)
        return null
      }
  
      if (isCreating.value) return null
  
      setCreating(true)
      clearStepError(1)
  
      try {
        const response = await reservationCompanyService.createReservationCompanyStep1(dataToUse)
        
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
        const newReservation: ReservationCompany = {
          id: reservationId,
          visitorId: dataToUse.visitorId,
          companyId: dataToUse.companyId,
          totalYoungAdults: dataToUse.totalYoungAdults,
          totalYoungAdultsWithDisabilities: dataToUse.totalYoungAdultsWithDisabilities,
          totalAdults: dataToUse.totalAdults,
          totalAdultsWithDisabilities: dataToUse.totalAdultsWithDisabilities,
          totalSeniors: dataToUse.totalSeniors,
          totalSeniorsWithDisabilities: dataToUse.totalSeniorsWithDisabilities,
          reservationDate: dataToUse.reservationDate,
          checkInDateId: dataToUse.checkInDateId,
          visitObjectiveId: dataToUse.visitObjectiveId,
          mainEconomicConceptId: null,
          secondaryEconomicConceptId: null,
          isReservationPersonAlsoResponsible: null,
          isResponsibleNotAssigned: null,
          fullName: null,
          email: null,
          phone: null,
          positionTypeIds: null,
          ageRangeIds: null,
          specialAssistanceIds: null,
          discoveryChannelId: null,
          paymentMethodId: null,
          requiresMediationService: null,
          requiresDetailedLocationInformation: null,
          requestsPostVisitInvoice: null,
          needsCheckoutProcessInformation: null,
          confirmsInformationAccuracy: null,
          totalPeople: null,
          totalCost: null,
          // Campos adicionales del formulario
          parkingInfo: null,
          invoice: null,
          providerInfo: null,
          documents: null,
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
        console.log('✅ Paso 1 marcado como completo en stepStatusStore')
        
        return newReservation
  
      } catch (err) {
        setStepError(1, err instanceof Error ? err.message : 'Error al crear reservación')
        throw err
      } finally {
        setCreating(false)
      }
    }

    const updateReservationStep1 = async (requestData: any): Promise<ReservationCompany | null> => {
      console.log('🔍 updateReservationStep1 recibió requestData:', requestData)
      console.log('🔍 requestData keys:', Object.keys(requestData || {}))

      setUpdating(true)
      clearStepError(1)

      try {
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

        // Preparar los datos para la actualización del paso 1
        const updateData = {
          reservationId: typeof currentReservation.value.id === 'string' ? parseInt(currentReservation.value.id, 10) : currentReservation.value.id,
          ...requestData
        }

        console.log('🔍 Datos para actualizar paso 1:', updateData)
        const response = await reservationCompanyService.updateReservationCompanyStep1(updateData)


       // Actualizar el objeto de reservación en el store
       if (currentReservation.value) {
        const updatedReservation = {
          ...currentReservation.value,
          visitorId: response.visitorId,
          companyId: response.companyId,
          totalYoungAdults: response.totalYoungAdults,
          totalYoungAdultsWithDisabilities: response.totalYoungAdultsWithDisabilities,
          totalAdults: response.totalAdults,
          totalAdultsWithDisabilities: response.totalAdultsWithDisabilities,
          totalSeniors: response.totalSeniors,
          totalSeniorsWithDisabilities: response.totalSeniorsWithDisabilities,
          reservationDate: response.reservationDate,
          checkInDateId: response.checkInDateId,
          visitObjectiveId: response.visitObjectiveId,
          status: 'step1' as const,
          updatedAt: response.updatedAt
        }
        
        setCurrentReservation(updatedReservation)
        updateReservation(updatedReservation)
      }

        // Marcar el paso 1 como guardado usando updateStepData
        updateStepData(1, { saved: true, timestamp: Date.now() })

        // Marcar el paso 1 como completo en el store de estado de pasos
        stepStatusStore.markStepComplete(1, response)
        console.log('✅ Paso 1 marcado como completo en stepStatusStore')

        setCurrentStep(2)

        return currentReservation.value

      } catch (err) {
        setStepError(1, err instanceof Error ? err.message : 'Error al actualizar el paso 1')
        throw err
      } finally {
        setUpdating(false)
      }
    }
  
    /**
     * Actualiza el paso 2 de una reservación
     */
    const updateReservationStep2 = async (): Promise<ReservationCompany | null> => {
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
        const requestData: UpdateReservationCompanyStep2Request = {
          reservationId: typeof currentReservation.value.id === 'string' ? parseInt(currentReservation.value.id, 10) : currentReservation.value.id,
          mainEconomicConceptId: formData.value.mainEconomicConceptId,
          secondaryEconomicConceptId: formData.value.secondaryEconomicConceptId,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
          fullName: formData.value.fullName || null,
          email: formData.value.email || null,
          phone: formData.value.phone || null,
          positionTypeIds: formData.value.positionTypeIds && formData.value.positionTypeIds.length > 0 ? formData.value.positionTypeIds : null,
          ageRangeIds: formData.value.ageRangeIds && formData.value.ageRangeIds.length > 0 ? formData.value.ageRangeIds : null,
          specialAssistanceIds: formData.value.specialAssistanceIds && formData.value.specialAssistanceIds.length > 0 ? formData.value.specialAssistanceIds : []
        }
  
        const response = await reservationCompanyService.updateReservationCompanyStep2(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            mainEconomicConceptId: response.mainEconomicConceptId,
            secondaryEconomicConceptId: response.secondaryEconomicConceptId,
            isReservationPersonAlsoResponsible: response.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: response.isResponsibleNotAssigned,
            fullName: response.fullName,
            email: response.email,
            phone: response.phone,
            positionTypeIds: response.positionTypeIds,
            ageRangeIds: response.ageRangeIds,
            specialAssistanceIds: response.specialAssistanceIds,
            status: 'step2' as const,
            updatedAt: response.updatedAt
          }
          
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        }
  
        // Marcar el paso 2 como guardado usando updateStepData
        updateStepData(2, { saved: true, timestamp: Date.now() })
        
        // Marcar el paso 2 como completo en el store de estado de pasos
        stepStatusStore.markStepComplete(2, response)
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
    const updateReservationStep3 = async (): Promise<ReservationCompany | null> => {
      // Si no hay reservación activa pero sí hay ID, crear un objeto básico sin cargar datos
      if (!currentReservation.value && currentReservationId.value) {
        console.log('🔄 Creando objeto de reservación básico para actualizar paso 3:', currentReservationId.value)
        const basicReservation: ReservationCompany = {
          id: currentReservationId.value,
          visitorId: formData.value.visitorId || 0,
          companyId: formData.value.companyId || 0,
          totalYoungAdults: formData.value.totalYoungAdults || 0,
          totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities || 0,
          totalAdults: formData.value.totalAdults || 0,
          totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities || 0,
          totalSeniors: formData.value.totalSeniors || 0,
          totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities || 0,
          reservationDate: formData.value.reservationDate || '',
          checkInDateId: formData.value.checkInDateId || 0,
          visitObjectiveId: formData.value.visitObjectiveId || 0,
          // Campos del paso 2
          mainEconomicConceptId: formData.value.mainEconomicConceptId || null,
          secondaryEconomicConceptId: formData.value.secondaryEconomicConceptId || null,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible || null,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned || null,
          fullName: formData.value.fullName || null,
          email: formData.value.email || null,
          phone: formData.value.phone || null,
          specialAssistanceIds: formData.value.specialAssistanceIds || [],
          positionTypeIds: formData.value.positionTypeIds || [],
          ageRangeIds: formData.value.ageRangeIds || [],
          // Campos del paso 3
          discoveryChannelId: formData.value.discoveryChannelId || null,
          paymentMethodId: formData.value.paymentMethodId || null,
          requiresMediationService: formData.value.requiresMediationService || null,
          requiresDetailedLocationInformation: formData.value.requiresDetailedLocationInformation || null,
          requestsPostVisitInvoice: formData.value.requestsPostVisitInvoice || null,
          needsCheckoutProcessInformation: formData.value.needsCheckoutProcessInformation || null,
          confirmsInformationAccuracy: formData.value.confirmsInformationAccuracy || null,
          totalPeople: formData.value.totalPeople || 0,
          totalCost: formData.value.totalCost || 0,
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
        const requestData: UpdateReservationCompanyStep3Request = {
          reservationId: typeof currentReservation.value.id === 'string' ? parseInt(currentReservation.value.id, 10) : currentReservation.value.id,
          discoveryChannelId: formData.value.discoveryChannelId,
          paymentMethodId: formData.value.paymentMethodId,
          requiresMediationService: formData.value.requiresMediationService,
          requiresDetailedLocationInformation: formData.value.requiresDetailedLocationInformation,
          requestsPostVisitInvoice: formData.value.requestsPostVisitInvoice,
          needsCheckoutProcessInformation: formData.value.needsCheckoutProcessInformation,
          confirmsInformationAccuracy: formData.value.confirmsInformationAccuracy,
          // Campos adicionales del formulario
          parkingInfo: formData.value.parkingInfo,
          invoice: formData.value.invoice,
          providerInfo: formData.value.providerInfo,
          documents: formData.value.documents
        }
  
        const response = await reservationCompanyService.updateReservationCompanyStep3(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            discoveryChannelId: response.discoveryChannelId,
            paymentMethodId: response.paymentMethodId,
            requiresMediationService: response.requiresMediationService,
            requiresDetailedLocationInformation: response.requiresDetailedLocationInformation,
            requestsPostVisitInvoice: response.requestsPostVisitInvoice,
            needsCheckoutProcessInformation: response.needsCheckoutProcessInformation,
            confirmsInformationAccuracy: response.confirmsInformationAccuracy,
            totalPeople: response.totalPeople,
            totalCost: response.totalCost,
            // Campos adicionales del formulario
            parkingInfo: response.parkingInfo,
            invoice: response.invoice,
            providerInfo: response.providerInfo,
            documents: response.documents,
            status: 'completed' as const,
            updatedAt: response.updatedAt
          }
          
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        }
  
        setCurrentStep(3)
        markAsCompleted()
        
        // Marcar el paso 3 como completo en el store de estado de pasos
        stepStatusStore.markStepComplete(3, response)
        console.log('✅ Paso 3 marcado como completo en stepStatusStore')
        
        return currentReservation.value
  
      } catch (err) {
        setStepError(3, err instanceof Error ? err.message : 'Error al actualizar paso 3')
        throw err
      } finally {
        setUpdating(false)
      }
    }
  
    /**
     * Carga solo los datos del paso 1 de una reservación
     */
    const loadStep1 = async (reservationId: number): Promise<any> => {
      console.log('🚨 ADVERTENCIA: loadStep1 ejecutándose desde reservation-company.ts', {
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
        const response = await reservationCompanyService.getReservationCompanyStep1(reservationId)
        
        console.log('🔍 loadStep1 - Respuesta completa del servidor:', response)
        
        // Extraer los datos reales de la respuesta del servidor
        // El servidor devuelve una estructura ApiResponse, no directamente los datos
        const step1Data = (response as any).response || response
        
        console.log('🔍 loadStep1 - Datos extraídos:', step1Data)
        console.log('🔍 loadStep1 - totalYoungAdults:', step1Data.totalYoungAdults)
        console.log('🔍 loadStep1 - totalAdults:', step1Data.totalAdults)
        console.log('🔍 loadStep1 - totalSeniors:', step1Data.totalSeniors)
        
        // Actualizar solo los datos del paso 1 en el formulario
        const formDataUpdate = {
          visitorId: step1Data.visitorId,
          companyId: step1Data.companyId,
          totalYoungAdults: step1Data.totalYoungAdults,
          totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities,
          totalAdults: step1Data.totalAdults,
          totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities,
          totalSeniors: step1Data.totalSeniors,
          totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities,
          reservationDate: step1Data.reservationDate,
          checkInDateId: step1Data.checkInDateId,
          visitObjectiveId: step1Data.visitObjectiveId
        }
        
        console.log('🔍 loadStep1 - Datos que se van a actualizar en formData:', formDataUpdate)
        updateFormData(formDataUpdate)
        console.log('🔍 loadStep1 - formData después de actualizar:', formData.value)

        // Actualizar o crear la reservación actual
        if (!currentReservation.value) {
          const newReservation: ReservationCompany = {
            id: reservationId,
            visitorId: step1Data.visitorId,
            companyId: step1Data.companyId,
            totalYoungAdults: step1Data.totalYoungAdults,
            totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities,
            totalAdults: step1Data.totalAdults,
            totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities,
            totalSeniors: step1Data.totalSeniors,
            totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities,
            reservationDate: step1Data.reservationDate,
            checkInDateId: step1Data.checkInDateId,
            visitObjectiveId: step1Data.visitObjectiveId,
            mainEconomicConceptId: null,
            secondaryEconomicConceptId: null,
            isReservationPersonAlsoResponsible: null,
            isResponsibleNotAssigned: null,
            fullName: null,
            email: null,
            phone: null,
            positionTypeIds: null,
            ageRangeIds: null,
            specialAssistanceIds: null,
          discoveryChannelId: null,
          paymentMethodId: null,
          requiresMediationService: null,
          requiresDetailedLocationInformation: null,
          requestsPostVisitInvoice: null,
          needsCheckoutProcessInformation: null,
          confirmsInformationAccuracy: null,
          totalPeople: null,
          totalCost: null,
          // Campos adicionales del formulario
          parkingInfo: null,
          invoice: null,
          providerInfo: null,
          documents: null,
          status: 'step1',
            createdAt: step1Data.createdAt,
            updatedAt: step1Data.updatedAt
          }
          setCurrentReservation(newReservation)
        } else {
          // Actualizar solo los campos del paso 1
          const updatedReservation = {
            ...currentReservation.value,
            visitorId: step1Data.visitorId,
            companyId: step1Data.companyId,
            totalYoungAdults: step1Data.totalYoungAdults,
            totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities,
            totalAdults: step1Data.totalAdults,
            totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities,
            totalSeniors: step1Data.totalSeniors,
            totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities,
            reservationDate: step1Data.reservationDate,
            checkInDateId: step1Data.checkInDateId,
            visitObjectiveId: step1Data.visitObjectiveId,
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
        const response = await reservationCompanyService.getReservationCompanyStep2(reservationId)
        
        console.log('🔍 loadStep2 - Respuesta completa del servidor:', response)
        
        // Extraer los datos reales de la respuesta del servidor
        // El servidor devuelve una estructura ApiResponse, no directamente los datos
        const step2Data = (response as any).response || response
        
        console.log('🔍 loadStep2 - Datos extraídos:', step2Data)
        console.log('🔍 loadStep2 - mainEconomicConceptId:', step2Data.mainEconomicConceptId)
        console.log('🔍 loadStep2 - fullName:', step2Data.fullName)
        console.log('🔍 loadStep2 - email:', step2Data.email)
        
        // Actualizar solo los datos del paso 2 en el formulario
        const formDataUpdate = {
          mainEconomicConceptId: step2Data.mainEconomicConceptId,
          secondaryEconomicConceptId: step2Data.secondaryEconomicConceptId,
          isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
          fullName: step2Data.fullName,
          email: step2Data.email,
          phone: step2Data.phone,
          positionTypeIds: step2Data.positionTypeIds || [],
          ageRangeIds: step2Data.ageRangeIds || [],
          specialAssistanceIds: step2Data.specialAssistanceIds || []
        }
        
        console.log('🔍 loadStep2 - Datos que se van a actualizar en formData:', formDataUpdate)
        updateFormData(formDataUpdate)
        console.log('🔍 loadStep2 - formData después de actualizar:', formData.value)

        // Actualizar la reservación actual con los datos del paso 2
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            mainEconomicConceptId: step2Data.mainEconomicConceptId,
            secondaryEconomicConceptId: step2Data.secondaryEconomicConceptId,
            isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
            fullName: step2Data.fullName,
            email: step2Data.email,
            phone: step2Data.phone,
            positionTypeIds: step2Data.positionTypeIds,
            ageRangeIds: step2Data.ageRangeIds,
            specialAssistanceIds: step2Data.specialAssistanceIds,
            status: 'step2' as const,
            updatedAt: step2Data.updatedAt
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
        const hasDisability = await reservationCompanyService.checkReservationHasDisability(reservationId)
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
        const response = await reservationCompanyService.getReservationCompanyStep3(reservationId)

        console.log('🔍 loadStep3 - Respuesta completa del servidor:', response)

        // Extraer los datos reales de la respuesta del servidor
        // El servidor devuelve una estructura ApiResponse, no directamente los datos
        const step3Data = (response as any).response || response

        console.log('🔍 loadStep3 - Datos extraídos:', step3Data)
        console.log('🔍 loadStep3 - paymentMethodId:', step3Data.paymentMethodId)
        console.log('🔍 loadStep3 - discoveryChannelId:', step3Data.discoveryChannelId)
        console.log('🔍 loadStep3 - costBreakdown extraído:', step3Data.costBreakdown)

        // Guardar el desglose de costos en el store
        if (step3Data.costBreakdown) {
          costBreakdown.value = step3Data.costBreakdown
          console.log('✅ loadStep3 - costBreakdown guardado en el store:', costBreakdown.value)
        }

        // Actualizar solo los datos del paso 3 en el formulario
        const formDataUpdate = {
          discoveryChannelId: step3Data.discoveryChannelId,
          paymentMethodId: step3Data.paymentMethodId,
          requiresMediationService: step3Data.requiresMediationService,
          requiresDetailedLocationInformation: step3Data.requiresDetailedLocationInformation,
          requestsPostVisitInvoice: step3Data.requestsPostVisitInvoice,
          needsCheckoutProcessInformation: step3Data.needsCheckoutProcessInformation,
          confirmsInformationAccuracy: step3Data.confirmsInformationAccuracy,
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
            discoveryChannelId: step3Data.discoveryChannelId,
            paymentMethodId: step3Data.paymentMethodId,
            requiresMediationService: step3Data.requiresMediationService,
            requiresDetailedLocationInformation: step3Data.requiresDetailedLocationInformation,
            requestsPostVisitInvoice: step3Data.requestsPostVisitInvoice,
            needsCheckoutProcessInformation: step3Data.needsCheckoutProcessInformation,
            confirmsInformationAccuracy: step3Data.confirmsInformationAccuracy,
            totalPeople: step3Data.totalPeople,
            totalCost: step3Data.totalCost,
            parkingInfo: step3Data.parkingInfo,
            invoice: step3Data.invoice,
            providerInfo: step3Data.providerInfo,
            documents: step3Data.documents,
            status: 'step3' as const,
            updatedAt: step3Data.updatedAt
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
      costBreakdown,

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
      createReservationStep1,
      updateReservationStep1,
      updateReservationStep2,
      updateReservationStep3,
      loadStep1,
      loadStep2,
      loadStep3,
      checkReservationHasDisability
    }
  }) 