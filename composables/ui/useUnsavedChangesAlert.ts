import { ref, onMounted, onUnmounted } from 'vue'

interface UnsavedChangesOptions {
  message?: string
  continueText?: string
  saveText?: string
  discardText?: string
}

export function useUnsavedChangesAlert(options: UnsavedChangesOptions = {}) {
  const {
    message = '¡Espera! Estás a punto de salir sin guardar el progreso de tu reservación',
    continueText = 'Continuar creando mi reservación',
    saveText = 'Guardar y salir',
    discardText = 'Perder mi progreso'
  } = options

  const hasUnsavedChanges = ref(false)
  const isFormStarted = ref(false)
  const showDialog = ref(false)
  const dialogLoading = ref(false)
  let resolvePromise: ((value: 'continue' | 'save' | 'discard') => void) | null = null

  // Función para marcar que hay cambios sin guardar
  const markAsUnsaved = () => {
    hasUnsavedChanges.value = true
    isFormStarted.value = true
  }

  // Función para marcar que no hay cambios sin guardar
  const markAsSaved = () => {
    hasUnsavedChanges.value = false
  }

  // Función para marcar que el formulario ha comenzado
  const markFormStarted = () => {
    isFormStarted.value = true
  }

  // Función para verificar si debe mostrar la alerta
  const shouldShowAlert = () => {
    return isFormStarted.value && hasUnsavedChanges.value
  }

  // Función para mostrar la alerta de salida
  const showExitAlert = async (): Promise<'continue' | 'save' | 'discard'> => {
    if (!shouldShowAlert()) {
      return 'discard'
    }

    showDialog.value = true
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  // Handlers para el diálogo
  const handleContinue = () => {
    showDialog.value = false
    if (resolvePromise) {
      resolvePromise('continue')
      resolvePromise = null
    }
  }

  const handleSave = async () => {
    dialogLoading.value = true
    try {
      // Aquí implementarías la lógica para guardar
      // await saveFormData()
      markAsSaved()
      showDialog.value = false
      if (resolvePromise) {
        resolvePromise('save')
        resolvePromise = null
      }
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      dialogLoading.value = false
    }
  }

  const handleDiscard = () => {
    showDialog.value = false
    markAsSaved() // Marcar como guardado para permitir la navegación
    
    // Limpiar todos los stores específicos cuando el usuario descarta los cambios
    if (process.client) {
      import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
        const mainStore = useReservationFormStore()
        mainStore.clearAllSpecificStores()
        console.log('🧹 Stores limpiados al descartar cambios')
      })
    }
    
    if (resolvePromise) {
      resolvePromise('discard')
      resolvePromise = null
    }
  }

  const handleClose = () => {
    showDialog.value = false
    if (resolvePromise) {
      resolvePromise('continue')
      resolvePromise = null
    }
  }

  // Función para manejar el evento beforeunload
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (shouldShowAlert()) {
      // No usar alert nativo, solo prevenir el cierre
      event.preventDefault()
      event.returnValue = ''
      return ''
    }
    return undefined
  }

  // Función para manejar el evento popstate (navegación del navegador)
  const handlePopState = async (event: PopStateEvent) => {
    if (shouldShowAlert()) {
      event.preventDefault()
      
      // Mostrar nuestro diálogo personalizado
      const result = await showExitAlert()
      
      if (result === 'continue') {
        // Mantener en la página actual
        window.history.pushState(null, '', window.location.href)
      } else if (result === 'save') {
        // Permitir la navegación después de guardar
        // La lógica de guardado ya se ejecutó en handleSave
        window.history.back() // Ejecutar la navegación que se intentó
      } else if (result === 'discard') {
        // Permitir la navegación sin guardar
        // Ya se marcó como guardado en handleDiscard
        window.history.back() // Ejecutar la navegación que se intentó
      }
    }
  }

  // Configurar los event listeners
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    
    // Agregar un estado inicial al historial para poder detectar navegación
    window.history.pushState(null, '', window.location.href)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('popstate', handlePopState)
  })

  return {
    hasUnsavedChanges,
    isFormStarted,
    shouldShowAlert,
    showExitAlert,
    markAsUnsaved,
    markAsSaved,
    markFormStarted,
    showDialog,
    dialogLoading,
    handleContinue,
    handleSave,
    handleDiscard,
    handleClose
  }
}
