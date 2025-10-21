import { ref } from 'vue'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { API_CONFIG, API_ENDPOINTS } from './config'

export interface UseApiFetchOptions {
  immediate?: boolean
  method?: string
  query?: Record<string, any>
  body?: any
  headers?: Record<string, string>
  timeout?: number
}

// Función para obtener el token de autenticación
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Instancia de axios configurada
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => {
    // Respuesta exitosa
    return response
  },
  (error: AxiosError) => {
    // Manejar errores específicos
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        // Opcional: redirigir al login
        // window.location.href = '/auth/login'
      }
    }
    
    // Re-lanzar el error para que los composables lo manejen
    return Promise.reject(error)
  }
)

// Composable base para peticiones usando axios
export function useApiFetch<T = any>(
  endpoint: string, 
  options: UseApiFetchOptions = {}
) {
  const data = ref<T | null>(null)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (executeOptions?: { body?: any; query?: Record<string, any> }) => {
    pending.value = true
    error.value = null
    
    try {
      const config: AxiosRequestConfig = {
        method: options.method || 'GET',
        url: endpoint,
        params: executeOptions?.query || options.query,
        data: executeOptions?.body || options.body,
        timeout: options.timeout || API_CONFIG.timeout
      }

      // Agregar headers solo si existen
      if (options.headers) {
        config.headers = options.headers
      }

      const response: AxiosResponse<T> = await apiClient(config)
      
      data.value = response.data
      return response.data
    } catch (err) {
      const axiosError = err as AxiosError
      const errorData = axiosError.response?.data as any
      
      // Priorizar el campo 'comments' si existe (estructura específica de la API)
      const errorMessage = errorData?.comments || 
                          errorData?.message || 
                          axiosError.message || 
                          'Error en la petición'
      
      error.value = new Error(errorMessage)
      throw error.value
    } finally {
      pending.value = false
    }
  }

  // Función para recargar datos
  const refresh = () => {
    return execute()
  }

  // Ejecutar automáticamente si immediate es true
  if (options.immediate !== false) {
    execute()
  }

  return {
    data,
    pending,
    error,
    execute,
    refresh
  }
}

// Composable para peticiones POST
export function useApiPost<T = any>(endpoint: string, options: UseApiFetchOptions = {}) {
  return useApiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    immediate: false
  })
}

// Composable para peticiones PUT
export function useApiPut<T = any>(endpoint: string, options: UseApiFetchOptions = {}) {
  return useApiFetch<T>(endpoint, {
    ...options,
    method: 'PUT',
    immediate: false
  })
}

// Composable para peticiones PATCH
export function useApiPatch<T = any>(endpoint: string, options: UseApiFetchOptions = {}) {
  return useApiFetch<T>(endpoint, {
    ...options,
    method: 'PATCH',
    immediate: false
  })
}

// Composable para peticiones DELETE
export function useApiDelete<T = any>(endpoint: string, options: UseApiFetchOptions = {}) {
  return useApiFetch<T>(endpoint, {
    ...options,
    method: 'DELETE',
    immediate: false
  })
}

// Re-exportar API_ENDPOINTS y apiClient para uso directo
export { API_ENDPOINTS, apiClient } 