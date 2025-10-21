import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE RESERVACIONES GENERALES
// ============================================================================

export interface ReservationGeneralObjectiveVisitResponse {
    id: number,
    tableName: string
    value: string
    description: string
    enable: boolean
    userModified: string
}

export interface LinkingCode {
    id: number
    code: string
    name: string
    ticketPrice: number
    maxTickets: number | null
    startDate: string
    endDate: string
    description: string | null
    messageUser: string | null
    messageAdmin: string | null
    status: string
    enable: boolean
    dateModified: string
}

export interface ReservationCostResponse {
    totalKidsUnderThree: number
    totalKids: number
    totalTeenagers: number
    totalYoungAdults: number
    totalAdults: number
    totalSeniors: number
    totalDisabilities: number
    totalPeople: number
    totalCost: number
}

// ============================================================================
// INTERFACES COMPLETAS DE RESERVACIÓN GENERAL
// ============================================================================
export type ReservationGeneralStatus = 'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled' | undefined
export interface ReservationGeneral {
    // Paso 1
    reservationId?: number | null
    visitorId: number | null
    attendingWithChildrenUnder3: boolean
    totalKidsUnderThree?: number
    totalKids: number
    totalTeenagers: number
    totalYoungAdults: number
    totalAdults: number
    totalSeniors: number
    reservationDate: string 
    checkInDateId: number | null
    visitObjectiveId: number 
    totalKidsWithDisabilities?: number
    totalTeenagersWithDisabilities?: number
    totalYoungAdultsWithDisabilities?: number
    totalAdultsWithDisabilities?: number
    totalSeniorsWithDisabilities?: number
    linkingCode?: string | null
  
    // Paso 2
    interestTopicId: number | null
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName: string | null
    email: string | null
    phone: string | null
    whereAreYouVisitingFromId: number | null
    specialAssistances: number[] | null
    
    // Paso 3
    paymentMethodId: number | null
    discoveryChannelId: number | null
    workShops: number[] | null
    isTermsAccepted: boolean

    // Metadatos
    status?: ReservationGeneralStatus
    createdAt: string
    updatedAt: string
}

// export interface ReservationGeneralResponse {
//     id: number
//     reservationId: number
//     reservationGroupId: number
//     dateModified: string
//     visitorId: number
//     visitor: string
//     status: string
//     statusId: number
//     enable: boolean
//     reservationTypeId: number
//     reservationType: string
//     checkInDateId: number
//     folioId: number
//     reservationDate: string
//     reservationTypeDesc: string
//     folio: string
//     attendeeTypeId: number
//     discoveryChannelId: number
//     paymentMethodId: number
//     visitObjectiveId: number
//     attendeeType: string
//     discoveryChannell: number | null
//     paymentMethod: number | null
//     visitObjective: string
//     totalKidsUnderThree: number
//     totalKids: number
//     totalAdults: number
//     totalSeniors: number
// }

export interface ReservationGeneralResponse {
    reservationId?: number | null
    visitorId: number | null
    attendingWithChildrenUnder3: boolean
    totalKidsUnderThree?: number
    totalKids: number
    totalTeenagers: number
    totalYoungAdults: number
    totalAdults: number
    totalSeniors: number
    reservationDate: string 
    checkInDateId: number | null
    visitObjectiveId: number 
    totalKidsWithDisabilities?: number
    totalTeenagersWithDisabilities?: number
    totalYoungAdultsWithDisabilities?: number
    totalAdultsWithDisabilities?: number
    totalSeniorsWithDisabilities?: number
    linkingCode?: string | null
    interestTopicId: number | null
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName: string | null
    email: string | null
    phone: string | null
    whereAreYouVisitingFromId: number | null
    specialAssistances: number[] | null
    paymentMethodId: number | null
    discoveryChannelId: number | null
    workShops: number[] | null
    isTermsAccepted: boolean
}

export interface ReservationGeneralFilters {
    id?: number
    reservationId?: number
    visitorId?: number
    folio?: string
}

export interface ReservationGeneralStep1Response {
    reservationId: number
    attendeeTypeId: number
    attendingWithChildrenUnder3: boolean
    reservationDate: string
    reservationTypeDesc: string
    visitObjectiveId: number
    totalKids: number
    totalKidsWithDisabilities: number | null
    totalTeenagers: number
    totalTeenagersWithDisabilities: number | null
    totalYoungAdults: number
    totalYoungAdultsWithDisabilities: number | null
    totalAdults: number
    totalAdultsWithDisabilities: number | null
    totalSeniors: number
    totalSeniorsWithDisabilities: number | null
    visitorId: number
    totalKidsUnderThree: number | null
    linkingCode: string | null
    checkInDateId: number
}

export interface ReservationGeneralStep2Response {
    visitorId: number
    reservationId: number
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName: string | null
    email: string | null
    phone: string | null
    whereAreYouVisitingFromId: number
    interestTopicId: number
    specialAssistances: number[]
}

export interface ReservationGeneralStep3Response {
    reservationId: number
    discoveryChannelId: number
    paymentMethodId: number
    isTermsAccepted: boolean
    workShops: number[]
    visitorId: number
}

export interface CreateUpdateReservationGeneralStep1Request {
    reservationId?: number
    visitorId: number 
    attendingWithChildrenUnder3: boolean
    totalKidsUnderThree?: number
    totalKids: number
    totalTeenagers: number
    totalYoungAdults: number
    totalAdults: number
    totalSeniors: number
    reservationDate: string 
    checkInDateId: number 
    visitObjectiveId: number 
    totalKidsWithDisabilities?: number
    totalTeenagersWithDisabilities?: number
    totalYoungAdultsWithDisabilities?: number
    totalAdultsWithDisabilities?: number
    totalSeniorsWithDisabilities?: number
    linkingCode: string | null
}

export interface UpdateReservationGeneralStep2Request {
    reservationId: number
    interestTopicId?: number | null
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName?: string | null
    email?: string | null
    phone?: string | null
    whereAreYouVisitingFromId: number
    specialAssistances?: number[] | null
    visitorId: number
}

export interface UpdateReservationGeneralStep3Request {
    reservationId: number
    paymentMethodId: number
    discoveryChannelId: number
    workShops: number[]
    isTermsAccepted: boolean
    visitorId: number
}

export interface CreateUpdateReservationGeneralStep123Response {
    response: number | null
}

// ============================================================================
// INTERFACES PARA FORMULARIOS DE UI
// ============================================================================
export interface ReservationGeneralFormData {
    // Paso 1
    reservationId: number | null
    visitorId: number | null
    attendingWithChildrenUnder3: boolean
    totalKidsUnderThree: number
    totalKids: number
    totalTeenagers: number
    totalYoungAdults: number
    totalAdults: number
    totalSeniors: number
    reservationDate: string 
    checkInDateId: number | null
    visitObjectiveId: number 
    totalKidsWithDisabilities: number
    totalTeenagersWithDisabilities: number
    totalYoungAdultsWithDisabilities: number
    totalAdultsWithDisabilities: number
    totalSeniorsWithDisabilities: number
    linkingCode: string | null
  
    // Paso 2
    interestTopicId: number | null
    isReservationPersonAlsoResponsible: boolean
    isResponsibleNotAssigned: boolean
    fullName: string | null
    email: string | null
    phone: string | null
    whereAreYouVisitingFromId: number | null
    specialAssistances: number[] | null
    
    // Paso 3
    paymentMethodId: number | null
    discoveryChannelId: number | null
    workShops: number[] | null
    isTermsAccepted: boolean
}

export type TypeReservationStatus = 'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled'

// ============================================================================
// TIPOS DE RESPUESTA DE API
// ============================================================================
export interface ReservationGeneralApiResponse extends ApiResponse<ReservationGeneral> {}
export interface ReservationGeneralCUApiResponse extends ApiResponse<CreateUpdateReservationGeneralStep123Response> {}
export interface LinkingCodeApiResponse extends ApiResponse<LinkingCode[]> {}
export interface ReservationCostApiResponse extends ApiResponse<ReservationCostResponse> {}
export interface ReservationGeneralStep1ApiResponse extends ApiResponse<ReservationGeneralStep1Response> {}
export interface ReservationGeneralStep2ApiResponse extends ApiResponse<ReservationGeneralStep2Response> {}
export interface ReservationGeneralStep3ApiResponse extends ApiResponse<ReservationGeneralStep3Response> {}
export interface ReservationGeneralListApiResponse extends ApiResponse<ReservationGeneral[]> {}
export interface ReservationGeneralObjectiveVisitListApiResponse extends ApiResponse<ReservationGeneralObjectiveVisitResponse[]> {}