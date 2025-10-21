// Composables específicos por módulo
export { useApiAuth, useAuth } from './auth'
// useApiUsers eliminado - usar composables/auth/useUsers.ts (versión mejorada)
// useApiReservations eliminado - usar composables/reservations/useReservation.ts (versión unificada)
// useApiCosts eliminado - usar composables/business/useCost.ts (versión mejorada con auth integrada)
export { useApiVisitor } from './visitor'
export { useApiDocumentRequest } from './document-request'
export { useApiEmployee } from './employee'

// Re-exportar composables base y configuración
export {
  useApiFetch,
  useApiPost,
  useApiPut,
  useApiDelete,
  API_ENDPOINTS
} from '../core/useFetch'
export type { UseApiFetchOptions } from '../core/useFetch' 