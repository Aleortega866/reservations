export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  gender: string
  phone: string
  primaryEmail: string
  backupEmail: string
  backupEmails?: string[]
}

export interface PersonalData {
  username: string
  firstName: string
  lastName: string
  gender: string
  receiveNewsletters?: boolean
  acceptDataUsage?: boolean
  NewEmail?: string
  email?: string | null
  newEmail?: string | null
  userName?: string | null
  phoneNumber?: string | null
  name?: string | null
  paternalLastName?: string | null
  maternalLastName?: string | null
  statusId?: number
  genderId?: number
  enableMarketing?: boolean
  enableUsePersonalData?: boolean
  enable?: boolean
  dateBirth?: string | null
}

export interface ContactData {
  phone: string
  primaryEmail: string
  backupEmail: string
  backupEmails?: string[]
}

// Tipo para la respuesta de la API GetUserAsync
export interface GetUserApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: {
    id: string
    userId: number
    userName: string
    email: string
    NewEmail: string
    phoneNumber: string
    name: string
    paternalLastName: string
    maternalLastName: string
    genderId: number
    gender: string
    statusId: number
    status: string
    enableMarketing: boolean
    enableUsePersonalData: boolean
    enable: boolean
    userTypeId: number
    userType: string
    dateBirth: string
  }
  token: string
}

export type Screen = 'profile' | 'personal-data' | 'contact-security' | 'reservations-data' | 'reservation-details' 