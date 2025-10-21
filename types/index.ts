// Tipos locales del proyecto
export * from './user'
export * from './reservations'
export * from './availability'

// Tipos de la API (usando alias para evitar conflictos)
export type {
  SignInRequest,
  SignInResponse,
  ResetPasswordRequest,
  ConfirmTokenAccessRequest,
  ConfirmTokenAccessResponse
} from '@/lib/api/services/auth'

export type {
  User as ApiUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserPermission,
  AddUserPermissionRequest,
  AlternativeEmail,
  AddAlternativeEmailRequest
} from '@/lib/api/services/users'

export type {
  Reservation as ApiReservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  School,
  ReservationFilters
} from '@/lib/api/services/reservations'

export type {
  AttendanceReservation,
  AddAttendanceReservationRequest,
  UpdateAttendanceReservationRequest,
  UpdateVisitStatusRequest,
  AttendanceFilters
} from '@/lib/api/services/attendance'

export type {
  ReservationDocument,
  UploadReservationDocumentRequest,
  UpdateReservationDocumentRequest,
  DocumentFilters
} from '@/lib/api/services/media'

export type {
  Video,
  UpdateVideoRequest,
  UploadVideoRequest,
  VideoFilters
} from '@/lib/api/services/media'

// Tipos de composables
export type {
  UseApiState,
  UseApiOptions,
  AuthState
} from '@/composables/core' 