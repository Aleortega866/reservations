// ============================================================================
// API MANAGEMENT SYSTEM - Axios Centralizado
// ============================================================================

// Core API exports - Configuración y endpoints
export * from './core/config'
export type { ApiEndpoint } from './core/config'

// Composables useFetch centralizados
export {
  useApiFetch,
  useApiPost,
  useApiPut,
  useApiPatch,
  useApiDelete,
  API_ENDPOINTS
} from './core/useFetch'
export type { UseApiFetchOptions } from './core/useFetch'

// Composables específicos por módulo
export {
  useApiAuth,
  useAuth,
  // useApiUsers, // ELIMINADO: usar useUsers de @/composables/auth/useUsers
  // useApiReservations, // ELIMINADO: usar useReservation de @/composables/reservations/useReservation
  // useApiCosts, // ELIMINADO: usar useCostService de @/composables/business/useCost
  useApiVisitor,
  useApiEmployee
} from './composables'

// ============================================================================
// SERVICIOS DE API - Clases de servicio para operaciones CRUD
// ============================================================================

// Exportar todos los servicios desde el archivo centralizado
export {
  authService,
  userService,
  attendanceService,
  documentService,
  videoService,
  catalogService,
  formService,
  costService,
  visitorService,
  postalCodeService,
  employeeService,
  municipalityService,
  moduleService
} from './services'

// ============================================================================
// TIPOS TYPESCRIPT - Interfaces para requests/responses
// ============================================================================

// Exportar todos los tipos desde la carpeta organizada
export * from './types'

// ============================================================================
// NOTA IMPORTANTE
// ============================================================================
// 
// Esta carpeta contiene TODO lo necesario para manejar la API:
// - ✅ Configuración centralizada (API_ENDPOINTS)
// - ✅ Composables con axios
// - ✅ Tipos TypeScript completos
// - ✅ Estados reactivos automáticos
// - ✅ Autenticación automática
// - ✅ Interceptors automáticos
// - ✅ Manejo de errores mejorado
//
// Uso en componentes:
// import { useApiAuth, API_ENDPOINTS } from '@/lib/api'
// NOTA: useApiUsers ha sido eliminado, usar useUsers de @/composables/auth/useUsers
// import type { SignInRequest, User, Reservation } from '@/lib/api'
// ============================================================================ 