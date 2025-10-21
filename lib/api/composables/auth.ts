import { computed, readonly, ref } from 'vue'
import { useApiFetch, useApiPost, API_ENDPOINTS } from '../core/useFetch'
import type { SignInRequest, SignInResponse, ConfirmTokenAccessResponse } from '../types/auth'
import type { ResetPasswordSignInRequest, ResetPasswordSignInResponse } from '../services/auth'
import { catalogService } from '../services/catalog/catalog.service'
import { useCookie } from 'nuxt/app'

// Función para parsear el token JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error parsing JWT token:', error)
    return {}
  }
}

// Función para extraer el rol del token JWT
function extractRoleFromToken(token: string): string {
  try {
    const tokenData = parseJwt(token)
    // Priorizar RoleType sobre UserType
    return tokenData.RoleType || tokenData.UserType 
  } catch (error) {
    console.error('Error extracting role from JWT token:', error)
    return ''
  }
}

// Estado global de autenticación
const user = ref<any>(null)
const isAuthenticated = ref(false)
const token = ref<string | null>(null)
const permissions = ref<string[]>([])
const userRole = ref<string>('')

export function useAuth() {
  // Cookies (deben estar dentro de la función)
  const tokenCookie = useCookie('auth_token', { sameSite: 'lax' })
  const userCookie = useCookie('auth_user', { sameSite: 'lax' })

  // Restaurar usuario desde cookies o localStorage si existe
  if (typeof window !== 'undefined' && !isAuthenticated.value) {
    let authToken = tokenCookie.value || localStorage.getItem('auth_token')
    let userData = userCookie.value || localStorage.getItem('auth_user')
    let userPermissions = localStorage.getItem('auth_permissions')
    let role = localStorage.getItem('auth_role')
    
    if (authToken && userData) {
      try {
        user.value = typeof userData === 'string' ? JSON.parse(userData) : userData
        token.value = authToken
        permissions.value = userPermissions ? JSON.parse(userPermissions) : []
        
        // Si no hay rol almacenado, intentar extraerlo del token JWT
        if (!role && authToken) {
          role = extractRoleFromToken(authToken)
          // Actualizar el localStorage con el rol extraído
          if (role) {
            localStorage.setItem('auth_role', role)
          }
        }
        
        userRole.value = role || ''
        isAuthenticated.value = true
      } catch (error) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_permissions')
        localStorage.removeItem('auth_role')
        localStorage.removeItem('user')
        tokenCookie.value = null
        userCookie.value = null
      }
    }
  }

  const login = (userData: any, authToken: string, userPermissions: string[] = [], role: string = '') => {
    user.value = userData
    token.value = authToken
    permissions.value = userPermissions
    userRole.value = role
    isAuthenticated.value = true
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      localStorage.setItem('auth_permissions', JSON.stringify(userPermissions))
      localStorage.setItem('auth_role', role)
      tokenCookie.value = authToken
      userCookie.value = JSON.stringify(userData)
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    token.value = null
    permissions.value = []
    userRole.value = ''
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_permissions')
      localStorage.removeItem('auth_role')
      tokenCookie.value = null
      userCookie.value = null
      
      // Limpiar stores de reservaciones al cerrar sesión
      import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
        const mainStore = useReservationFormStore()
        mainStore.resetForm()
        mainStore.clearAllSpecificStores()
        console.log('🧹 Stores de reservaciones limpiados al cerrar sesión')
      }).catch(() => {
        // Store no cargado, no hay nada que limpiar
      })
    }
  }

  const updateUserInStore = (updatedUserData: any) => {
    user.value = updatedUserData
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(updatedUserData))
      userCookie.value = JSON.stringify(updatedUserData)
    }
  }

  // Función para forzar la actualización del rol desde el token JWT actual
  const refreshRoleFromToken = () => {
    if (token.value) {
      const extractedRole = extractRoleFromToken(token.value)
      if (extractedRole && extractedRole !== userRole.value) {
        userRole.value = extractedRole
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_role', extractedRole)
        }
        console.log('✅ Rol actualizado desde token JWT:', extractedRole)
        return true
      }
    }
    return false
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    token: readonly(token),
    permissions: readonly(permissions),
    userRole: readonly(userRole),
    login,
    logout,
    updateUserInStore,
    refreshRoleFromToken
  }
}

export function useApiAuth() {
  const { login, logout } = useAuth()
  
  // Composable para signIn usando GET con query parameters
  const signInComposable = useApiFetch<SignInResponse>(API_ENDPOINTS.auth.signIn, {
    immediate: false
  })
  
  // Composable para registro usando POST
  const registerComposable = useApiPost(API_ENDPOINTS.visitor.create, {
    immediate: false
  })
  
  const forgotPasswordComposable = useApiFetch(API_ENDPOINTS.user.sendEmailTokenResetPassword, {
    method: 'GET',
    immediate: false
  })
  
  const resetPasswordComposable = useApiPost(API_ENDPOINTS.auth.resetPassword, {
    immediate: false
  })
  
  const confirmTokenComposable = useApiPost<ConfirmTokenAccessResponse>(API_ENDPOINTS.auth.confirmTokenAccess, {
    immediate: false
  })
  
  const confirmTokenEmailAlternativeComposable = useApiPost<ConfirmTokenAccessResponse>(API_ENDPOINTS.auth.confirmTokenAccessEmailAlternative, {
    immediate: false
  })
  
  const resetPasswordSignInComposable = useApiPost<ResetPasswordSignInResponse>(API_ENDPOINTS.auth.resetPasswordSignIn, {
    immediate: false
  })

  const signIn = async (credentials: SignInRequest) => {
    try {
      // Ejecutar la petición GET con credenciales como query parameters
      await signInComposable.execute({ 
        query: {
          email: credentials.email,
          password: credentials.password
        }
      })
      
      if (signInComposable.data.value) {
        // Extraer información del token JWT para obtener permisos y rol
        const tokenData = parseJwt(signInComposable.data.value.token)
        
        // Usar la nueva estructura de respuesta
        const userData = signInComposable.data.value.response
        
        // Extraer el rol del token JWT usando la función utilitaria
        const userRole = extractRoleFromToken(signInComposable.data.value.token)
        
        // Actualizar el estado de autenticación
        login(
          userData, 
          signInComposable.data.value.token,
          tokenData.Permission || [],
          userRole
        )
        
        // Esperar a que el estado reactivo se actualice
        await nextTick()
      }
      
      return signInComposable.data.value
    } catch (err) {
      throw err
    }
  }

  const register = async (userData: any) => {
    try {
      
      // Obtener el ID del género desde el catálogo
      const genderId = await getGenderId(userData.gender)
      
      // Mapear los datos del formulario a la estructura esperada por la API
      const registerData = {
        userName: userData.username,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phone,
        name: userData.firstName,
        paternalLastName: userData.lastName,
        maternalLastName: userData.maternalLastName || '', // Campo opcional en el formulario
        genderId: genderId, // ID del género obtenido del catálogo
        enableMarketing: userData.receiveNewsletters || false,
        enableUsePersonalData: userData.acceptDataUsage || false,
        userTypeId: 77,
        userModifiedId: 1, // ID del usuario que modifica (sistema)
        visitorTypeId: 739, // Tipo de usuario obtenido del catálogo
        dateBirth: userData.dateBirth || ''
      }
      
      await registerComposable.execute({ body: registerData })
      
      // Si el registro es exitoso, retornar la respuesta
      return registerComposable.data.value
    } catch (err) {
      throw err
    }
  }

  // Función auxiliar para obtener el ID del género desde el catálogo
  const getGenderId = async (genderValue: string): Promise<number> => {
    try {
      const genders = await catalogService.getAllCatalogsPublic({ tableName: 'Gender' })
      const gender = genders.find(g => g.value === genderValue)
      return gender?.id || 1 // Por defecto 1 si no se encuentra
    } catch (error) {
      console.error('Error obteniendo ID del género:', error)
      return 1 // Por defecto 1 en caso de error
    }
  }

  // Función auxiliar para obtener el ID del tipo de usuario "visitante"
  const getVisitorUserTypeId = async (): Promise<number> => {
    try {
      const userTypes = await catalogService.getAllCatalogsPublic({ tableName: 'UserType' })
      const visitorType = userTypes.find(type => 
        type.value.toLowerCase() === 'visitante' || 
        type.value.toLowerCase() === 'visitor'
      )
      return visitorType?.id || 1 // Por defecto 1 si no se encuentra
    } catch (error) {
      console.error('Error obteniendo tipo de usuario visitante:', error)
      return 1 // Por defecto 1 en caso de error
    }
  }

  const signOut = () => {
    logout()
  }

  const forgotPassword = async (email: string) => {
    try {
      await forgotPasswordComposable.execute({ 
        query: { email } 
      })
      return forgotPasswordComposable.data.value
    } catch (err) {
      throw err
    }
  }

  const resetPassword = async (data: { email: string, newPassword: string, code: string }) => {
    try {
      const requestBody = { 
        email: data.email, 
        newPassword: data.newPassword, 
        code: data.code 
      }
      
      console.log('Composable resetPassword - Datos recibidos:', data)
      console.log('Composable resetPassword - Body a enviar:', requestBody)
      
      await resetPasswordComposable.execute({ body: requestBody })
      return resetPasswordComposable.data.value
    } catch (err) {
      throw err
    }
  }

  const confirmTokenAccess = async (data: { email: string, code: number | string }) => {
    try {
      await confirmTokenComposable.execute({ body: data })
      return confirmTokenComposable.data.value
    } catch (err) {
      throw err
    }
  }

  const confirmTokenAccessEmailAlternative = async (data: { email: string, code: number | string }) => {
    try {
      await confirmTokenEmailAlternativeComposable.execute({ body: data })
      return confirmTokenEmailAlternativeComposable.data.value
    } catch (err) {
      throw err
    }
  }

  const resetPasswordSignIn = async (data: ResetPasswordSignInRequest) => {
    try {
      await resetPasswordSignInComposable.execute({ body: data })
      return resetPasswordSignInComposable.data.value
    } catch (err) {
      throw err
    }
  }

  return {
    // State
    loading: computed(() => 
      signInComposable.pending.value || 
      registerComposable.pending.value ||
      forgotPasswordComposable.pending.value ||
      resetPasswordComposable.pending.value || 
      confirmTokenComposable.pending.value ||
      confirmTokenEmailAlternativeComposable.pending.value ||
      resetPasswordSignInComposable.pending.value
    ),
    error: computed(() => 
      signInComposable.error.value || 
      registerComposable.error.value ||
      forgotPasswordComposable.error.value ||
      resetPasswordComposable.error.value || 
      confirmTokenComposable.error.value ||
      confirmTokenEmailAlternativeComposable.error.value ||
      resetPasswordSignInComposable.error.value
    ),
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    token: readonly(token),
    permissions: readonly(permissions),
    userRole: readonly(userRole),

    // Methods
    signIn,
    register,
    signOut,
    forgotPassword,
    resetPassword,
    confirmTokenAccess,
    confirmTokenAccessEmailAlternative,
    resetPasswordSignIn
  }
} 