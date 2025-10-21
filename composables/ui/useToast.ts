import { toast } from 'vue-sonner'

// Configuración general para todos los tipos de toasts
const TOAST_CONFIG = {
  // Configuraciones por tipo de toast
  types: {
    success: {
      duration: 3000,
      className: 'toast-success',
      position: 'top-right'
    },
    error: {
      duration: 5000,
      className: 'toast-error',
      position: 'top-right'
    },
    info: {
      duration: 4000,
      className: 'toast-info',
      position: 'top-right'
    },
    warning: {
      duration: 4000,
      className: 'toast-warning',
      position: 'top-right'
    }
  },
  
  // Configuraciones globales
  global: {
    position: 'top-right',     // Cambia aquí la posición global
    richColors: true,
    closeButton: true,
    dismissible: true,
    maxToasts: 5,
    expand: true,
    swipeToClose: true
  },
  
  // Configuraciones de animación
  animation: {
    enter: 'toast-enter',
    exit: 'toast-exit',
    duration: 300
  },
  
  // Configuraciones de accesibilidad
  accessibility: {
    announce: true,
    role: 'alert',
    ariaLive: 'polite'
  },
  
  // Configuraciones de tema
  theme: {
    light: {
      background: '#ffffff',
      text: '#000000',
      border: '#e5e7eb'
    },
    dark: {
      background: '#1f2937',
      text: '#ffffff',
      border: '#374151'
    }
  },
  

}

export const useToast = () => {
  const showSuccess = (title: string, description?: string, options?: any) => {
    try {
      const toastOptions: any = { 
        ...TOAST_CONFIG.global,
        ...TOAST_CONFIG.types.success,
        ...options,
        duration: options?.duration ?? TOAST_CONFIG.types.success.duration
      }
      if (description) {
        toastOptions.description = description
      }
      toast.success(title, toastOptions)
    } catch (error) {
      console.error('Error showing success toast:', error)
    }
  }

  const showError = (title: string, description?: string, options?: any) => {
    try {
      const toastOptions: any = { 
        ...TOAST_CONFIG.global,
        ...TOAST_CONFIG.types.error,
        ...options,
        duration: options?.duration ?? TOAST_CONFIG.types.error.duration
      }
      if (description) {
        toastOptions.description = description
      }
      toast.error(title, toastOptions)
    } catch (error) {
      console.error('Error showing error toast:', error)
    }
  }

  const showInfo = (title: string, description?: string, options?: any) => {
    try {
      const toastOptions: any = { 
        ...TOAST_CONFIG.global,
        ...TOAST_CONFIG.types.info,
        ...options,
        duration: options?.duration ?? TOAST_CONFIG.types.info.duration
      }
      if (description) {
        toastOptions.description = description
      }
      toast(title, toastOptions)
    } catch (error) {
      console.error('Error showing info toast:', error)
    }
  }

  const showWarning = (title: string, description?: string, options?: any) => {
    try {
      const toastOptions: any = { 
        ...TOAST_CONFIG.global,
        ...TOAST_CONFIG.types.warning,
        ...options,
        duration: options?.duration ?? TOAST_CONFIG.types.warning.duration
      }
      if (description) {
        toastOptions.description = description
      }
      toast.warning(title, toastOptions)
    } catch (error) {
      console.error('Error showing warning toast:', error)
    }
  }

  const showPromise = <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    try {
      return toast.promise(promise, options)
    } catch (error) {
      console.error('Error showing promise toast:', error)
      return promise // Retorna la promesa original en caso de error
    }
  }

  // Función para obtener la configuración
  const getConfig = () => TOAST_CONFIG

  // Función para crear un toast personalizado
  const showCustom = (title: string, description?: string, options?: any) => {
    try {
      const toastOptions: any = { 
        ...TOAST_CONFIG.global,
        duration: options?.duration ?? 4000,
        ...options
      }
      if (description) {
        toastOptions.description = description
      }
      toast(title, toastOptions)
    } catch (error) {
      console.error('Error showing custom toast:', error)
    }
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPromise,
    showCustom,
    getConfig
  }
}