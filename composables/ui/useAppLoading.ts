/**
 * Composable para controlar el loading global de la aplicación
 * 
 * @example
 * ```ts
 * const { showLoading, hideLoading, isLoading } = useAppLoading()
 * 
 * // Mostrar loading
 * showLoading('Procesando datos...')
 * 
 * // Ocultar loading
 * hideLoading()
 * ```
 */
export const useAppLoading = () => {
  const isLoading = useState<boolean>('app-loading', () => false)
  const loadingText = useState<string>('app-loading-text', () => 'Cargando...')
  const showText = useState<boolean>('app-loading-show-text', () => true)
  const showSpinner = useState<boolean>('app-loading-show-spinner', () => true)

  /**
   * Muestra el loading global
   * @param text - Texto a mostrar (opcional)
   * @param options - Opciones adicionales
   */
  const showLoading = (
    text?: string,
    options?: {
      showText?: boolean
      showSpinner?: boolean
    }
  ) => {
    if (text) {
      loadingText.value = text
    }
    if (options?.showText !== undefined) {
      showText.value = options.showText
    }
    if (options?.showSpinner !== undefined) {
      showSpinner.value = options.showSpinner
    }
    isLoading.value = true
  }

  /**
   * Oculta el loading global
   */
  const hideLoading = () => {
    isLoading.value = false
    // Reset a valores por defecto después de un pequeño delay
    setTimeout(() => {
      loadingText.value = 'Cargando...'
      showText.value = true
      showSpinner.value = true
    }, 300)
  }

  /**
   * Ejecuta una función async mostrando el loading
   * @param fn - Función async a ejecutar
   * @param text - Texto de loading (opcional)
   */
  const withLoading = async <T>(
    fn: () => Promise<T>,
    text?: string
  ): Promise<T> => {
    showLoading(text)
    try {
      return await fn()
    } finally {
      hideLoading()
    }
  }

  return {
    isLoading: readonly(isLoading),
    loadingText: readonly(loadingText),
    showText: readonly(showText),
    showSpinner: readonly(showSpinner),
    showLoading,
    hideLoading,
    withLoading,
  }
}

