// Tipos para la disponibilidad mensual

export interface DayAvailability {
  day: number
  date: string
  availabilityType: string
  color: string
  availableSlots: number
  totalSlots: number
  availabilityPercentage: number
  isEnabled: boolean
}

export interface MonthlyAvailabilityResponse {
  month: number
  year: number
  days: DayAvailability[]
}

export interface MonthlyAvailabilityApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: MonthlyAvailabilityResponse
  token: string
}

export interface AvailabilityFilters {
  month: number
  year: number
}
