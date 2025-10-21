import { ref, onMounted, onUnmounted } from 'vue'

interface ExitFormAlertOptions {
  message?: string
  continueText?: string
  saveText?: string
  discardText?: string
}

export function useExitFormAlert(options: ExitFormAlertOptions = {}) {
  const {
    message = 'Estás a punto de salir sin guardar el progreso de tu reservación. ¿Qué deseas hacer?',
    continueText = 'Continuar creando mi reservación',
    saveText = 'Guardar y salir',
    discardText = 'Perder mi progreso'
  } = options

  const hasUnsavedChanges = ref(false)
  const isFormStarted = ref(false)
  const showAlert = ref(false)
  const alertLoading = ref(false)
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
    const shouldShow = isFormStarted.value && hasUnsavedChanges.value
    console.log('🔍 shouldShowAlert:', {
      isFormStarted: isFormStarted.value,
      hasUnsavedChanges: hasUnsavedChanges.value,
      shouldShow
    })
    return shouldShow
  }

  // Función para mostrar la alerta de salida
  const showExitAlert = async (): Promise<'continue' | 'save' | 'discard'> => {
    console.log('🚨 showExitAlert llamado')
    if (!shouldShowAlert()) {
      console.log('❌ No se muestra alerta: condiciones no cumplidas')
      return 'discard'
    }

    console.log('✅ Mostrando alerta personalizada')
    showAlert.value = true
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  // Handlers para la alerta personalizada
  const handleContinue = () => {
    showAlert.value = false
    if (resolvePromise) {
      resolvePromise('continue')
      resolvePromise = null
    }
  }

  const handleSave = async () => {
    alertLoading.value = true
    try {
      // Aquí implementarías la lógica para guardar
      // await saveFormData()
      markAsSaved()
      showAlert.value = false
      if (resolvePromise) {
        resolvePromise('save')
        resolvePromise = null
      }
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      alertLoading.value = false
    }
  }

  const handleDiscard = () => {
    showAlert.value = false
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
    showAlert.value = false
    if (resolvePromise) {
      resolvePromise('continue')
      resolvePromise = null
    }
  }

  // Función para manejar el evento beforeunload
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    console.log('🔄 handleBeforeUnload disparado')
    if (shouldShowAlert()) {
      console.log('⚠️ Previendo cierre de ventana')
      // Prevenir el cierre sin mostrar alert nativo
      event.preventDefault()
      event.returnValue = ''
      return ''
    }
    console.log('✅ Permitiendo cierre de ventana')
    return undefined
  }

  // Función para manejar el evento popstate (navegación del navegador)
  const handlePopState = async (event: PopStateEvent) => {
    console.log('🔄 handlePopState disparado')
    if (shouldShowAlert()) {
      console.log('⚠️ Previendo navegación, mostrando alerta personalizada')
      event.preventDefault()
      
      // Mostrar nuestra alerta personalizada
      const result = await showExitAlert()
      console.log('🎯 Resultado de alerta:', result)
      
      if (result === 'continue') {
        // Mantener en la página actual
        console.log('🔄 Manteniendo en página actual')
        window.history.pushState(null, '', window.location.href)
      } else if (result === 'save') {
        // Permitir la navegación después de guardar
        console.log('💾 Guardando y navegando')
        window.history.back()
      } else if (result === 'discard') {
        // Permitir la navegación sin guardar
        console.log('🗑️ Descartando y navegando')
        window.history.back()
      }
    } else {
      console.log('✅ Permitiendo navegación normal')
    }
  }

  // Configurar los event listeners
  onMounted(() => {
    console.log('🔧 Configurando event listeners para alerta de salida')
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    
    // Agregar un estado inicial al historial para poder detectar navegación
    window.history.pushState(null, '', window.location.href)
    console.log('📝 Estado inicial agregado al historial')
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
    showAlert,
    alertLoading,
    handleContinue,
    handleSave,
    handleDiscard,
    handleClose,
    // Props para el componente
    alertProps: {
      message,
      continueText,
      saveText,
      discardText
    }
  }
}
