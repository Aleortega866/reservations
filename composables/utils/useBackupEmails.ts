import { ref, computed } from 'vue'
import { userService } from '@/lib/api/services/users/user.service'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/ui/useToast'

// Interfaz para la nueva estructura de respuesta
interface AlternativeEmailResponse {
  id: number
  userId: string
  email: string
  dateModified: string
  emailConfirmed: boolean
}

export function useBackupEmails() {
  const authStore = useAuthStore()
  const { showSuccess, showError } = useToast()
  
  // Estado reactivo
  const backupEmails = ref<string[]>([])
  const backupEmailsData = ref<AlternativeEmailResponse[]>([]) // Nueva variable para almacenar datos completos
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const hasReachedLimit = computed(() => backupEmails.value.length >= 3)
  const canAddMore = computed(() => backupEmails.value.length < 3)
  const emailCount = computed(() => backupEmails.value.length)

  /**
   * Carga los emails de respaldo del usuario desde la API
   */
  const loadBackupEmails = async (userId?: string | null) => {
    try {
      console.log('=== loadBackupEmails ejecutándose ===')
      console.log('userId recibido:', userId)
      
      loading.value = true
      error.value = null
      
      const targetUserId = userId || authStore.user?.id
      console.log('targetUserId para cargar emails:', targetUserId)
      
      if (!targetUserId) {
        throw new Error('No se encontró el ID del usuario')
      }

      const apiResponse = await userService.getAllAlternativeEmails(targetUserId!) as any
      console.log('Respuesta completa de la API:', apiResponse)
      
      // Extraer los emails de la respuesta de la API
      const alternativeEmails = apiResponse?.data?.response || apiResponse?.response || apiResponse
      console.log('Emails extraídos de la respuesta:', alternativeEmails)
      
      if (alternativeEmails && Array.isArray(alternativeEmails)) {
        console.log('Emails alternativos recibidos de la API:', alternativeEmails)
        
        // Guardar los datos completos de los emails
        backupEmailsData.value = alternativeEmails
        
        // Extraer solo los emails válidos (no vacíos) de los objetos AlternativeEmail
        const allEmails = alternativeEmails.map((altEmail: AlternativeEmailResponse) => altEmail.email)
        console.log('Todos los emails extraídos:', allEmails)
        
        backupEmails.value = allEmails.filter((email: any) => email && typeof email === 'string' && email.trim() !== '')
        console.log('Emails filtrados (válidos):', backupEmails.value)
      } else {
        console.log('No se recibieron emails alternativos o no es un array')
        backupEmails.value = []
        backupEmailsData.value = []
      }
      
      return backupEmails.value
    } catch (err: any) {
      error.value = err?.message || 'Error al cargar los correos de respaldo'
      showError('Error', error.value || 'Error desconocido')
      backupEmails.value = []
      backupEmailsData.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Verifica si un email específico está verificado
   */
  const isEmailVerified = (email: string): boolean => {
    const emailData = backupEmailsData.value.find(altEmail => altEmail.email === email)
    return emailData ? emailData.emailConfirmed : false
  }

  /**
   * Obtiene los datos completos de un email específico
   */
  const getEmailData = (email: string): AlternativeEmailResponse | null => {
    return backupEmailsData.value.find(altEmail => altEmail.email === email) || null
  }

  /**
   * Obtiene todos los emails no verificados
   */
  const getUnverifiedEmails = computed(() => {
    return backupEmailsData.value.filter(altEmail => !altEmail.emailConfirmed)
  })

  /**
   * Obtiene todos los emails verificados
   */
  const getVerifiedEmails = computed(() => {
    return backupEmailsData.value.filter(altEmail => altEmail.emailConfirmed)
  })

  /**
   * Agrega un nuevo email de respaldo
   */
  const addBackupEmail = async (email: string, userId?: string | null) => {
    try {
      loading.value = true
      error.value = null
      
      const targetUserId = userId || authStore.user?.id || undefined
      if (!targetUserId) {
        throw new Error('No se encontró el ID del usuario')
      }

      // Validaciones
      if (hasReachedLimit.value) {
        throw new Error('No puedes agregar más de 3 correos de respaldo')
      }

      if (backupEmails.value.includes(email)) {
        throw new Error('Este correo ya está registrado como respaldo')
      }

      // Llamar al servicio para agregar el email alternativo
      await userService.addAlternativeEmail({
        userId: targetUserId!,
        email: email,
        statusId: 1, // Estado activo por defecto
        enable: true, // Habilitado por defecto
        userModifiedId: 1 // ID fijo como en otros servicios (VideoService usa '1')
      })

      // Actualizar el estado local
      backupEmails.value.push(email)
      
      // Actualizar el store de autenticación
      authStore.addAlternativeEmail(email)

      showSuccess('Éxito', 'Correo de respaldo agregado correctamente')
      
      return true
    } catch (err: any) {
      error.value = err?.message || 'Error al agregar el correo de respaldo'
      showError('Error', error.value || 'Error desconocido')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un email de respaldo
   */
  const removeBackupEmail = async (email: string, userId?: string | null) => {
    try {
      loading.value = true
      error.value = null
      
      const targetUserId = userId || authStore.user?.id || undefined
      if (!targetUserId) {
        throw new Error('No se encontró el ID del usuario')
      }

          // Llamar al servicio para eliminar el correo alternativo
          await userService.deleteAlternativeEmail(email, 1)
          
          // Actualizar el estado local
          backupEmails.value = backupEmails.value.filter(e => e !== email)
          backupEmailsData.value = backupEmailsData.value.filter(e => e.email !== email)
          
          showSuccess('Correo eliminado', 'Correo de respaldo eliminado correctamente')
          return true


    } catch (err: any) {
      error.value = err?.message || 'Error al eliminar el correo de respaldo'
      showError('Error', error.value || 'Error desconocido')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Valida si un email puede ser agregado
   */
  const validateEmail = (email: string) => {
    const errors: string[] = []

    if (!email || email.trim() === '') {
      errors.push('El correo electrónico es requerido')
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Ingresa un correo electrónico válido')
    }

    if (backupEmails.value.includes(email)) {
      errors.push('Este correo ya está registrado como respaldo')
    }

    if (hasReachedLimit.value) {
      errors.push('No puedes agregar más de 3 correos de respaldo')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Inicializa el composable cargando los emails existentes
   */
  const initialize = async (userId?: string | null) => {
    console.log('=== Inicializando composable useBackupEmails ===')
    console.log('userId proporcionado:', userId)
    console.log('authStore.user?.id:', authStore.user?.id)
    
    const targetUserId = userId || authStore.user?.id
    console.log('targetUserId final:', targetUserId)
    
    if (targetUserId) {
      await loadBackupEmails(targetUserId)
    } else {
      console.log('No se pudo obtener el userId para inicializar')
    }
  }

  return {
    // Estado
    backupEmails: computed(() => backupEmails.value),
    backupEmailsData: computed(() => backupEmailsData.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Computed
    hasReachedLimit,
    canAddMore,
    emailCount,
    getUnverifiedEmails,
    getVerifiedEmails,
    
    // Métodos
    loadBackupEmails,
    addBackupEmail,
    removeBackupEmail,
    validateEmail,
    initialize,
    isEmailVerified,
    getEmailData
  }
}
