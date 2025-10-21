import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Composable para verificación de autenticación en componentes
 * Evita que se muestre contenido antes del redirect del middleware
 */
export function useAuthGuard() {
  const authStore = useAuthStore()
  
  // Verificación de autenticación
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const hasValidToken = computed(() => {
    const token = authStore.token
    return token && token.trim() !== ''
  })
  
  // Estado combinado para mostrar loading
  const shouldShowLoading = computed(() => !isAuthenticated.value || !hasValidToken.value)
  
  // Estado para mostrar contenido
  const shouldShowContent = computed(() => isAuthenticated.value && hasValidToken.value)
  
  return {
    isAuthenticated,
    hasValidToken,
    shouldShowLoading,
    shouldShowContent
  }
}
