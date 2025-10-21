// ============================================================================
// RESERVATIONS MODULE - Exportaciones del Módulo de Reservaciones
// ============================================================================

// Servicios
export { reservationCompanyService } from './reservation.company.service'
export { reservationSummerCourseService } from './reservation.summer-course.service'
export { reservationDocumentsService } from './reservation.documents.service'
export { reservationCostService } from './reservation.cost.service'
// Servicio
export { reservationGeneralService } from './reservation.general.service'
// Servicio
export { reservationSchoolService } from './reservation.school.service'
// Servicio global para operaciones de reservaciones (confirmar, cancelar, etc.)
export { reservationGlobalService } from './reservation.global.service'

// Tipos relacionados
export type * from '../../types/reservation'
export type * from '../../types/reservation/company'
export type * from '../../types/reservation/summer-course'
export type * from '../../types/reservation/documents'