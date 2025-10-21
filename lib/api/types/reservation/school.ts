import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE RESERVACIONES ESCOLARES
// ============================================================================

export interface ReservationSchoolObjectiveVisitResponse {
    id: number,
    tableName: string
    value: string
    description: string
    enable: boolean
    userModified: string
}

export interface ReservationSchoolAcademicLevelResponse {
    id: number,
    level: string
    grade: string
    description: string
    statusId: number
    status: string
}

// ============================================================================
// INTERFACES COMPLETAS DE RESERVACIÓN ESCOLAR
// ============================================================================
export type ReservationSchoolStatus = 'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled' | undefined

export type ReservationSchoolSchoolLevelsProperties =  { preescolar: number[], primaria: number[], secundaria: number[], medioSuperior: number[], superior: number[], posgrado: number[] }

export type ReservationSchoolStep2Primaria = { academicLevelId: number, learningAreaId: number, coreAxesId: number }
export type ReservationSchoolStep2Secundaria = { academicLevelId: number, schoolSubjectId: number, coreAxesId: number }
export type ReservationSchoolStep2MediaSuperior = { academicLevelId: number, economicConceptId: number, economicConcepSecondaryId: number, schoolSubjectId: number }
export type ReservationSchoolStep2Superior = { academicLevelId: number, economicConceptId: number, economicConcepSecondaryId: number, schoolSubjectId: number }
export type ReservationSchoolStep2Posgrado = { academicLevelId: number, economicConceptId: number, economicConcepSecondaryId: number, schoolSubjectId: number }

export interface ReservationSchool {
    // Paso 1
    reservationId?: number | null
    institutionId: number
    visitObjectiveId: number
    schoolGroups: Record<string, number> | null
    schoolLevels: ReservationSchoolSchoolLevelsProperties
    visitorId: number
    reservationDate: string
    checkInDateId: number
  
    // Paso 2
    primaria: Array<ReservationSchoolStep2Primaria> | null
    secundaria: Array<ReservationSchoolStep2Secundaria> | null
    mediaSuperior: Array<ReservationSchoolStep2MediaSuperior> | null
    superior: Array<ReservationSchoolStep2Superior> | null
    posgrado: Array<ReservationSchoolStep2Posgrado> | null
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName: string | null
    email: string | null
    phone: string | null
    specialAssistances: number[] | null
    
    // Paso 3
    workShops: number[] | null
    paymentMethodId: number | null
    discoveryChannelId: number | null
    needCivilProtectionDocument: boolean
    needHelpCrossingStreet: boolean
    isTermsAccepted: boolean

    // Campos adicionales del formulario
    parkingInfo: boolean | null
    invoice: boolean | null
    providerInfo: boolean | null
    documents: Array<{
      name: string
      file: File
      url: string
      size: number
    }> | null

    // Metadatos
    status?: ReservationSchoolStatus
    createdAt: string
    updatedAt: string
}

export interface ReservationSchoolAcademicLevelsFilters {
    Id?: number
    AcademicLevel?: string
}

export interface ReservationSchoolStep1Response {
    reservationId: number
    institutionId: number
    visitObjectiveId: number
    schoolGroups: Record<string, number>
    schoolLevels: ReservationSchoolSchoolLevelsProperties
    visitorId: number
    reservationDate: string
    checkInDateId: number
}

export interface ReservationSchoolStep2Response {
    visitorId: number
    reservationId: number
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    primaria: Array<ReservationSchoolStep2Primaria> | null
    secundaria: Array<ReservationSchoolStep2Secundaria> | null
    mediaSuperior: Array<ReservationSchoolStep2MediaSuperior> | null
    superior: Array<ReservationSchoolStep2Superior> | null
    posgrado: Array<ReservationSchoolStep2Posgrado> | null
    fullName: string | null
    email: string | null
    phone: string | null
    specialAssistances: number[]
}

export interface ReservationSchoolStep3Response {
    workShops: number[]
    reservationId: number
    paymentMethodId: number
    discoveryChannelId: number
    needCivilProtectionDocument: boolean
    needHelpCrossingStreet: boolean
    isTermsAccepted: boolean
    visitorId: number
    // Campos adicionales del formulario
    parkingInfo: boolean | null
    invoice: boolean | null
    providerInfo: boolean | null
    documents: Array<{
      name: string
      file: File
      url: string
      size: number
    }> | null
}

export interface CreateUpdateReservationSchoolStep1Request {
    reservationId?: number | null
    institutionId: number
    visitObjectiveId: number
    schoolGroups: Record<string, number> | null
    schoolLevels: ReservationSchoolSchoolLevelsProperties
    visitorId: number
    reservationDate: string
    checkInDateId: number
}

export interface UpdateReservationSchoolStep2Request {
    reservationId: number
    visitorId: number
    primaria: Array<ReservationSchoolStep2Primaria> | null
    secundaria: Array<ReservationSchoolStep2Secundaria> | null
    mediaSuperior: Array<ReservationSchoolStep2MediaSuperior> | null
    superior: Array<ReservationSchoolStep2Superior> | null
    posgrado: Array<ReservationSchoolStep2Posgrado> | null
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName: string | null
    email: string | null
    phone: string | null
    specialAssistances: number[] | null
}

export interface UpdateReservationSchoolStep3Request {
    reservationId: number
    visitorId: number
    workShops: number[] | null
    paymentMethodId: number
    discoveryChannelId: number
    needCivilProtectionDocument: boolean
    needHelpCrossingStreet: boolean
    isTermsAccepted: boolean

    // Campos adicionales del formulario
    parkingInfo: boolean | null
    invoice: boolean | null
    providerInfo: boolean | null
    documents: Array<{
      name: string
      file: File
      url: string
      size: number
    }> | null
}

export interface CreateUpdateReservationSchoolStep123Response {
    response: number | null
}

// ============================================================================
// INTERFACES PARA FORMULARIOS DE UI
// ============================================================================
export interface ReservationSchoolFormData {
    // Paso 1
    reservationId?: number | null
    institutionId: number | null
    visitObjectiveId: number | null
    schoolGroups: Record<string, number> | null
    schoolLevels: ReservationSchoolSchoolLevelsProperties | null
    visitorId: number | null
    reservationDate: string
    checkInDateId: number | null
  
    // Paso 2
    primaria: Array<ReservationSchoolStep2Primaria> | null
    secundaria: Array<ReservationSchoolStep2Secundaria> | null
    mediaSuperior: Array<ReservationSchoolStep2MediaSuperior> | null
    superior: Array<ReservationSchoolStep2Superior> | null
    posgrado: Array<ReservationSchoolStep2Posgrado> | null
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName: string | null
    email: string | null
    phone: string | null
    specialAssistances: number[] | null
    
    // Paso 3
    workShops: number[] | null
    paymentMethodId: number | null
    discoveryChannelId: number | null
    needCivilProtectionDocument: boolean
    needHelpCrossingStreet: boolean
    isTermsAccepted: boolean
    // Campos adicionales del formulario
    parkingInfo: boolean | null
    invoice: boolean | null
    providerInfo: boolean | null
    documents: Array<{
      name: string
      file: File
      url: string
      size: number
    }> | null
}

export type TypeReservationStatus = 'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled'

// ============================================================================
// TIPOS DE RESPUESTA DE API
// ============================================================================
export interface ReservationSchoolApiResponse extends ApiResponse<ReservationSchool> {}
export interface ReservationSchoolListAcademicLevelApiResponse extends ApiResponse<ReservationSchoolAcademicLevelResponse[]> {}
export interface ReservationSchoolCUApiResponse extends ApiResponse<CreateUpdateReservationSchoolStep123Response> {}
export interface ReservationSchoolStep1ApiResponse extends ApiResponse<ReservationSchoolStep1Response> {}
export interface ReservationSchoolStep2ApiResponse extends ApiResponse<ReservationSchoolStep2Response> {}
export interface ReservationSchoolStep3ApiResponse extends ApiResponse<ReservationSchoolStep3Response> {}
export interface ReservationSchoolListApiResponse extends ApiResponse<ReservationSchool[]> {}
export interface ReservationSchoolObjectiveVisitListApiResponse extends ApiResponse<ReservationSchoolObjectiveVisitResponse[]> {}