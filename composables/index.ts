// ============================================================================
// COMPOSABLES INDEX - Exportaciones Centralizadas de Todos los Composables
// ============================================================================

// Auth composables
export { useAuth } from '@/lib/api/composables/auth'

// User management composables
// export { useUsers } from './auth/useUsers' // Comentado: se importa directamente desde el archivo específico

// Reservation composables
// export { useReservation } from './reservations/useReservation' // Comentado: se importa directamente desde el archivo específico
// export { useReservationCompany } from './reservations/useReservationCompany' // Comentado: se importa directamente desde el archivo específico
// export { useReservationForm } from './reservations/useReservationForm' // Comentado: se importa directamente desde el archivo específico
// export { useReservationStepNavigation } from './reservations/useReservationStepNavigation' // Comentado: se importa directamente desde el archivo específico
// export { useReservationCost } from './reservations/useReservationCost' // Comentado: se importa directamente desde el archivo específico

// Reservation operations composables (globales)
export { useReservationOperations } from './reservations/useReservationOperations'

// Cost management composables
// export { useCost, useCostService } from './business/useCost' // Comentado: se importa directamente desde el archivo específico

// Module management composables
// export { useModules, useModuleService } from './business/useModules' // Comentado: se importa directamente desde el archivo específico

// Role management composables
// export { useRoles } from './auth/useRoles' // Comentado: se importa directamente desde el archivo específico

// Employee management composables
// export { useEmployees } from './business/useEmployees' // Comentado: se importa directamente desde el archivo específico

// Institution management composables
// export { useInstitutions } from './catalog/useInstitutions' // Comentado: se importa directamente desde el archivo específico

// Municipality management composables
// export { useMunicipality } from './catalog/useMunicipality' // Comentado: se importa directamente desde el archivo específico

// Postal code composables
// export { usePostalCodes } from './catalog/usePostalCodes' // Comentado: se importa directamente desde el archivo específico

// Promotion composables
// export { usePromotions } from './business/usePromotions' // Comentado: se importa directamente desde el archivo específico

// Video composables
// export { useVideo } from './media/useVideo' // Comentado: se importa directamente desde el archivo específico
// export { useVideoPlayer } from './media/useVideoPlayer' // Comentado: no se usa activamente en el proyecto

// Workshop composables
// export { useWorkshops } from './catalog/useWorkshops' // Comentado: no se usa en el proyecto

// Form and validation composables
// export { useFormTypes } from './catalog/useFormTypes' // Comentado: se importa directamente desde el archivo específico
// export { useCustomRules } from './business/useCustomRules' // Comentado: se importa directamente desde el archivo específico
// export { useSchedules } from './business/useSchedules' // Comentado: se importa directamente desde el archivo específico
// export { useTimeSlots } from './business/useTimeSlots' // Comentado: se importa directamente desde el archivo específico

// Catalog composables
// export { useCatalog } from './catalog/useCatalog' // Comentado: se importa directamente desde el archivo específico

// Backup email composables
// export { useBackupEmails } from './utils/useBackupEmails' // Comentado: se importa directamente desde el archivo específico

// Notification composables
export * from './notifications'

// UI and utility composables
export { useAppLoading } from './ui/useAppLoading'
// export { useToast } from './ui/useToast' // Comentado: se importa directamente desde el archivo específico
// export { useErrorHandler } from './ui/useErrorHandler' // Comentado: se importa directamente desde el archivo específico
// export { useConfirmDialog } from './ui/useConfirmDialog' // Comentado: se importa directamente desde el archivo específico
// export { usePasswordStrength } from './auth/usePasswordStrength' // Comentado: se importa directamente desde el archivo específico
// export { useNavigation } from './ui/useNavigation' // Comentado: se importa directamente desde el archivo específico
// export { useUnsavedChangesAlert } from './ui/useUnsavedChangesAlert' // Comentado: se importa directamente desde el archivo específico
// export { useVueCompositionAPIHelpers } from './utils/useVueCompositionAPIHelpers' // Comentado: se importa directamente desde el archivo específico

// ============================================================================
// NOTA IMPORTANTE
// ============================================================================
// 
// Este archivo centraliza todas las exportaciones de composables para facilitar
// las importaciones en los componentes. Usa este archivo para importar múltiples
// composables de una vez:
//
// import { useUsers, useModules, useToast } from '@/composables'
//
// O importa composables individuales:
// import { useModules } from '@/composables/business/useModules'
// ============================================================================
