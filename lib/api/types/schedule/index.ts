import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE HORARIOS Y REGLAS PERSONALIZADAS
// ============================================================================

export interface Schedule {
  id: number
  time: string
  slot: number
  enable: boolean
  overSlot: number
  // Campos adicionales para compatibilidad con el código existente
  dayId?: number
  dayName?: string
  timeSlot?: string
  isEnabled?: boolean
  capacity?: number
  currentBookings?: number
}

export interface GetAllSchedulesByDayResponse {
  id: number
  dayName: string
  overSlot: number
  allSchedules: boolean
  schedules: Schedule[]
}

export interface GetAllSchedulesByDayApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: GetAllSchedulesByDayResponse
  token: string
}

export interface Day {
  id: number
  name: string
  isEnabled: boolean
}

export interface TimeSlot {
  id: number
  time: string
  isEnabled: boolean
  capacity: number
  currentBookings: number
}

export interface CustomRule {
  id: number
  isDateRange: boolean
  startDate: string
  endDate: string | null
  applyToAllTimeSlots: boolean
  selectedTimeSlotIds: number[] | null
  cupo: number
  overSlot: number
  userMessage: string | null
  adminMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCustomRuleRequest {
  isDateRange: boolean
  startDate: string
  endDate: string | null
  applyToAllTimeSlots: boolean
  selectedTimeSlotIds: number[] | null
  cupo: number
  overSlot: number
  userMessage: string | null
  adminMessage: string | null
}

export interface ValidationRule {
  id: number
  ruleType: string
  parameters: Record<string, any>
  isEnabled: boolean
  priority: number
}

export interface GetCustomRuleByDateRequest {
  searchDate: string
}

export interface GetCustomRuleSchedulesByDateRequest {
  searchDate: string
}

export interface CustomRuleSchedule {
  id: number
  time: string
  slot: number
  enable: boolean
  overSlot: number
  customRuleId: number
  timeSlotId: number
}

export interface GetCustomRuleSchedulesByDateResponse {
  code: number
  isValid: boolean
  comments: string
  response: CustomRuleSchedule[]
  token: string
}

export interface GetValidationRulesRequest {
  isDateRange: boolean
  startDate: string
  endDate: string
}

export interface UpdateScheduleEnableStatusRequest {
  id: number
  isEnabled: boolean
}

export interface UpdateCustomRuleTimeSlotStatusRequest {
  id: number
  isEnabled: boolean
}

// Tipos de respuesta
export interface ScheduleResponse extends ApiResponse<Schedule> {}
export interface ScheduleListResponse extends ApiResponse<Schedule[]> {}
export interface CustomRuleResponse extends ApiResponse<CustomRule> {}
export interface CustomRuleListResponse extends ApiResponse<CustomRule[]> {}
