import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStoreCleanup } from './useStoreCleanup'

/**
 * Composable para limpieza automática de stores al navegar a otras rutas
 * 
 * @description
 * Este composable configura la limpieza automática de todos los stores de reservaciones
 * cuando el usuario navega a rutas que no están relacionadas con el flujo de reservaciones.
 * 
 * @param options - Opciones de configuración
 * @param options.cleanupRoutes - Rutas que deben activar la limpieza automática
 * @param options.preserveOnRoutes - Rutas donde NO se debe limpiar (opcional)
 * 
 * @example
 * ```typescript
 * // En una página que no sea de reservaciones
 * useAutoStoreCleanup({
 *   cleanupRoutes: ['/profile', '/admin', '/notifications']
 * })
 * ```
 */
export function useAutoStoreCleanup(options: {
  cleanupRoutes?: string[]
  preserveOnRoutes?: string[]
} = {}) {
  // Solo ejecutar en el cliente
  if (process.server) {
    return {
      shouldCleanupOnRoute: () => false,
      cleanupIfNeeded: () => {},
      hasDataInStores: () => false
    }
  }

  const router = useRouter()
  const { clearAllStores, hasDataInStores } = useReservationStoreCleanup()
  
  // Rutas por defecto que activan la limpieza
  const defaultCleanupRoutes = [
    '/',
    '/reservations',
    '/profile',
    '/admin',
    '/notifications',
    '/auth/login',
    '/auth/register',
    '/material',
    '/workshops'
  ]
  
  const {
    cleanupRoutes = defaultCleanupRoutes,
    preserveOnRoutes = ['/reservations/formulario-reservacion']
  } = options

  /**
   * Verifica si la ruta actual debe activar la limpieza
   */
  const shouldCleanupOnRoute = (route: string): boolean => {
    // Si está en una ruta de preservación, no limpiar
    if (preserveOnRoutes.some(preserveRoute => route.startsWith(preserveRoute))) {
      return false
    }
    
    // Si está navegando a un formulario de reservación, no limpiar
    if (route.includes('/reservations/formulario-reservacion')) {
      return false
    }
    
    // Si está en una ruta de limpieza, limpiar
    return cleanupRoutes.some(cleanupRoute => route.startsWith(cleanupRoute))
  }

  /**
   * Limpia los stores si es necesario
   */
  const cleanupIfNeeded = (route: string) => {
    if (shouldCleanupOnRoute(route) && hasDataInStores()) {
      // Verificar si estamos navegando a una ruta de formulario de reservación
      // Si es así, no limpiar porque probablemente estamos cargando una reservación existente
      if (route.includes('/reservations/formulario-reservacion')) {
        console.log(`⏭️ Omitiendo limpieza para ruta de formulario: ${route}`)
        return
      }
      
      console.log(`🧹 Limpieza automática activada para ruta: ${route}`)
      clearAllStores()
    }
  }

  /**
   * Maneja la navegación del router
   */
  const handleRouteChange = (to: any) => {
    const route = to.path || to
    cleanupIfNeeded(route)
  }

  /**
   * Configura los listeners de navegación
   */
  const setupNavigationListeners = () => {
    // Verificar que el router esté disponible
    if (!router) {
      console.warn('⚠️ Router no disponible para configurar listeners')
      return () => {}
    }

    // Listener para cambios de ruta
    router.afterEach((to) => {
      handleRouteChange(to)
    })

    // Listener para el evento popstate (botón atrás/adelante del navegador)
    const handlePopState = () => {
      if (!router || !router.currentRoute) {
        return
      }
      const currentRoute = router.currentRoute.value.path
      cleanupIfNeeded(currentRoute)
    }

    if (process.client) {
      window.addEventListener('popstate', handlePopState)
    }

    // Cleanup function
    return () => {
      if (process.client) {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }

  /**
   * Limpia los stores inmediatamente si estamos en una ruta de limpieza
   */
  const cleanupOnMount = () => {
    // Verificar que el router esté disponible
    if (!router || !router.currentRoute) {
      console.warn('⚠️ Router no disponible en cleanupOnMount')
      return
    }
    const currentRoute = router.currentRoute.value.path
    cleanupIfNeeded(currentRoute)
  }

  // Configurar listeners al montar el componente
  onMounted(() => {
    cleanupOnMount()
    const cleanup = setupNavigationListeners()
    
    // Limpiar listeners al desmontar
    onUnmounted(() => {
      if (cleanup) cleanup()
    })
  })

  return {
    shouldCleanupOnRoute,
    cleanupIfNeeded,
    hasDataInStores
  }
}
