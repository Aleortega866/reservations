import { useAuth } from '@/lib/api/composables/auth'

// Middleware de autenticación global para Nuxt
// Este middleware se ejecuta automáticamente en TODAS las rutas

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  // Rutas de autenticación
  '/auth/login',
  '/auth/register', 
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/confirm-user',
  
  // Información legal y pública
  '/legal-information',
  
  // Confirmación de reservaciones (acceso desde enlaces de email)
  '/reservations/confirm-reservation',

]

// @ts-ignore - Auto-importado por Nuxt
export default defineNuxtRouteMiddleware((to) => {
  // Solo se ejecuta en el cliente
  if (process.client) {
    const { isAuthenticated, token } = useAuth()
    
    // Verificar si existe el auth_token
    const hasValidToken = token.value && token.value.trim() !== ''
    
    // Verificar si la ruta actual es pública
    const isPublicRoute = publicRoutes.includes(to.path)
    
    // Si es una ruta pública, permitir acceso
    if (isPublicRoute) {
      // Si está en login y ya está autenticado, redirigir a reservaciones
      if (to.path === '/auth/login' && isAuthenticated.value && hasValidToken) {
        console.log('🔄 Usuario ya autenticado, redirigiendo a reservaciones')
        // @ts-ignore
        return navigateTo('/reservations')
      }
      return // Permitir acceso a rutas públicas
    }
    
    // Verificar si la ruta existe (no es 404)
    // Si la ruta no existe, permitir que la página 404 personalizada la maneje
    if (!to.matched || to.matched.length === 0) {
      console.log('🚫 Ruta no encontrada (404):', to.path, '- Permitiendo página 404 personalizada')
      console.log('🔍 Debug - to.matched:', to.matched)
      console.log('🔍 Debug - to.name:', to.name)
      return // Permitir que la página 404 personalizada maneje esto
    }
    
    // Para rutas protegidas: verificar autenticación
    if (!isAuthenticated.value || !hasValidToken) {
      console.log('🔒 Acceso denegado: No hay token de autenticación válido para', to.path)
      // @ts-ignore
      return navigateTo('/auth/login?redirected=true&from=protected')
    }
    
    console.log('✅ Acceso autorizado a', to.path)
  }
}) 