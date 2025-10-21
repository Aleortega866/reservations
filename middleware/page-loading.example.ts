/**
 * Middleware de Ejemplo: Page Loading
 * 
 * Este middleware muestra cómo usar el componente AppLoading
 * antes de entrar a cualquier página.
 * 
 * NOTA: Este es un ejemplo. Para activarlo, renombra este archivo a 'page-loading.ts'
 * o copia el código en otro middleware.
 * 
 * @example
 * // Para usar este middleware en una página específica:
 * definePageMeta({
 *   middleware: ['page-loading']
 * })
 * 
 * // O para aplicarlo globalmente, renombra este archivo a 'page-loading.global.ts'
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo mostrar loading cuando navegamos entre páginas diferentes
  if (to.path === from.path) {
    return
  }

  const { showLoading, hideLoading } = useAppLoading()

  // Mostrar el loading al iniciar la navegación
  showLoading('Cargando página...')

  // Simular un pequeño delay para cargar recursos (opcional)
  // Esto puede ser útil para asegurar que los datos estén listos
  await new Promise(resolve => setTimeout(resolve, 300))

  // El loading se ocultará automáticamente después de que la página se monte
  // Puedes controlar esto desde la página misma usando onMounted
  
  // Si quieres ocultar el loading inmediatamente después de la navegación,
  // descomenta la siguiente línea:
  // hideLoading()
})

/**
 * EJEMPLO DE USO EN UNA PÁGINA
 * 
 * <script setup lang="ts">
 * const { hideLoading } = useAppLoading()
 * 
 * // Ocultar el loading cuando los datos estén listos
 * onMounted(() => {
 *   hideLoading()
 * })
 * 
 * // O con datos async
 * const { data } = await useFetch('/api/data')
 * hideLoading()
 * </script>
 */

/**
 * EJEMPLO CON PÁGINAS ESPECÍFICAS
 * 
 * // Solo mostrar loading para páginas admin
 * if (to.path.startsWith('/admin')) {
 *   showLoading('Cargando panel de administración...')
 * }
 * 
 * // Loading personalizado por ruta
 * const loadingMessages = {
 *   '/admin': 'Cargando panel de administración...',
 *   '/reservations': 'Cargando reservaciones...',
 *   '/profile': 'Cargando perfil...',
 * }
 * 
 * const message = loadingMessages[to.path] || 'Cargando...'
 * showLoading(message)
 */

