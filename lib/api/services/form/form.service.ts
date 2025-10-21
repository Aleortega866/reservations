// ============================================================================
// FORM SERVICE - Servicio de Gestión de Formularios
// ============================================================================

import { useApiFetch, useApiPut, useApiPatch, useApiPost, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { ApiResponse } from '../../types/common'
import type { 
  FormType, 
  UpdateFormTypeEnableStatusResponse,
  Schedule,
  Day,
  TimeSlot,
  CustomRule,
  CreateCustomRuleRequest,
  ValidationRule,
  GetCustomRuleByDateRequest,
  GetCustomRuleSchedulesByDateRequest,
  CustomRuleSchedule,
  GetCustomRuleSchedulesByDateResponse,
  GetValidationRulesRequest,
  UpdateScheduleEnableStatusRequest,
  UpdateCustomRuleTimeSlotStatusRequest,
  GetAllSchedulesByDayApiResponse,
  FormTypesResponse,
  SchedulesResponse,
  DaysResponse,
  TimeSlotsResponse,
  CustomRuleResponse,
  CustomRulesResponse,
  ValidationRulesResponse
} from '../../types/form'

/**
 * Servicio de gestión de formularios que maneja tipos, horarios y reglas personalizadas
 * @class FormService
 */
export class FormService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================
  /**
   * Obtiene todos los tipos de formularios
   * @returns Promise con la lista de tipos de formularios
   */
  async getAllFormTypes(): Promise<FormType[]> {
    const { execute } = useApiFetch<FormTypesResponse>(API_ENDPOINTS.form.getAllFormTypes, { immediate: false })
    
    const result = await execute()
    return result.response || []
  }

  /**
   * Actualiza el estado activo/inactivo de un formulario usando PUT
   * @param id ID del formulario
   * @returns Promise con el resultado de la actualización
   */
  async updateFormTypeEnableStatus(id: number): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.form.updateFormTypeEnableStatus}/${id}`
    const { execute } = useApiPut<UpdateFormTypeEnableStatusResponse>(endpoint)
    
    const result = await execute()
    // Si la respuesta es null pero el código es 200 y isValid es true, consideramos éxito
    return result.response === true || (result.code === 200 && result.isValid)
  }

  /**
   * Actualiza el estado activo/inactivo de un formulario usando PATCH
   * @param id ID del formulario
   * @returns Promise con el resultado de la actualización
   */
  async updateFormTypeEnableStatusPatch(id: number): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.form.updateFormTypeEnableStatus}/${id}`
    const { execute } = useApiPatch<UpdateFormTypeEnableStatusResponse>(endpoint)
    
    const result = await execute()
    // Si la respuesta es null pero el código es 200 y isValid es true, consideramos éxito
    return result.response === true || (result.code === 200 && result.isValid)
  }

  /**
   * Obtiene todos los tipos de formularios (nuevo endpoint)
   * @returns Promise con la lista de tipos de formularios
   */
  async getAllFormTypesAsyn(): Promise<FormType[]> {
    const { execute } = useApiFetch<FormTypesResponse>(API_ENDPOINTS.form.getAllFormTypesAsyn, { immediate: false })
    
    const result = await execute()
    return result.response || []
  }

  /**
   * Obtiene todos los horarios para un día específico
   * @param id ID del día (debe estar entre 1 y 7)
   * @returns Promise con la respuesta completa incluyendo horarios, overSlot y disableAllSchedules
   */
  async getAllSchedulesByDay(id: number): Promise<{
    schedules: Schedule[]
    overSlot: number
    disableAllSchedules: boolean
  }> {
    const endpoint = `${API_ENDPOINTS.form.getAllSchedulesByDay}/${id}`
    const { execute } = useApiFetch<GetAllSchedulesByDayApiResponse>(endpoint, { immediate: false })
    
    const result = await execute()
    console.log('Resultado completo de la API:', result)
    console.log('Result.response:', result.response)
    
    // La API devuelve la estructura completa en response
    if (result.response) {
      console.log('Procesando respuesta de la API')
      const response = {
        schedules: result.response.schedules || [],
        overSlot: result.response.overSlot || 30,
        disableAllSchedules: ('allSchedules' in result.response) 
          ? result.response.allSchedules 
          : result.response.disableAllSchedules || false
      }
      console.log('Respuesta procesada:', response)
      return response
    }
    
    // Fallback por defecto
    console.log('Sin respuesta, usando valores por defecto')
    return {
      schedules: [],
      overSlot: 30,
      disableAllSchedules: false
    }
  }

  /**
   * Obtiene todos los días
   * @returns Promise con la lista de días
   */
  async getAllDays(): Promise<Day[]> {
    const { execute } = useApiFetch<DaysResponse>(API_ENDPOINTS.form.getAllDays, { immediate: false })
    
    const result = await execute()
    return result.response || []
  }

  /**
   * Actualiza el estado de habilitación de un horario
   * @param id ID del horario (debe estar entre 1 y 48)
   * @returns Promise con el resultado de la actualización
   */
  async updateScheduleEnableStatus(id: number): Promise<boolean> {
    // Validar que el ID esté entre 1 y 48
    if (id < 1 || id > 48) {
      throw new Error('ID de horario inválido. Debe estar entre 1 y 48.')
    }

    const endpoint = `${API_ENDPOINTS.form.updateScheduleEnableStatus}/${id}`
    const { execute } = useApiPatch<ApiResponse>(endpoint)
    
    const result = await execute()
    return result.response === true || (result.code === 200 && result.isValid)
  }

  /**
   * Actualiza el estado de habilitación de todos los horarios de un día específico
   * @param dayId ID del día (debe estar entre 1 y 7)
   * @param allSchedules Boolean: false activa todos, true desactiva todos
   * @returns Promise con el resultado de la actualización
   */
  async updateAllSchedulesEnableStatus(dayId: number, allSchedules: boolean): Promise<boolean> {
    // Validar que el día esté entre 1 y 7
    if (dayId < 1 || dayId > 7) {
      throw new Error('ID de día inválido. Debe estar entre 1 y 7.')
    }

    const { execute } = useApiPatch<ApiResponse>(
      API_ENDPOINTS.form.updateAllSchedulesEnableStatus,
      {
        query: {
          Id: dayId,
          AllSchedules: allSchedules
        }
      }
    )
    
    const result = await execute()
    return result.response === true || (result.code === 200 && result.isValid)
  }

  /**
   * Crea una regla personalizada
   * @param rule Datos de la regla personalizada
   * @returns Promise con la regla creada
   */
  async createCustomRule(rule: CreateCustomRuleRequest): Promise<CustomRule> {
    const { execute } = useApiPost<CustomRuleResponse>(API_ENDPOINTS.form.createCustomRule, { body: rule })
    
    const result = await execute()
    return result.response
  }

  /**
   * Elimina una regla personalizada
   * @param id ID de la regla personalizada
   * @returns Promise con el resultado de la eliminación
   */
  async deleteCustomRule(id: number): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.form.deleteCustomRule}/${id}`
    const { execute } = useApiDelete<ApiResponse>(endpoint)
    
    const result = await execute()
    return result.response === true || (result.code === 200 && result.isValid)
  }

  /**
   * Obtiene todos los horarios disponibles
   * @returns Promise con la lista de horarios
   */
  async getAllTimeSlots(): Promise<TimeSlot[]> {
    const { execute } = useApiFetch<TimeSlotsResponse>(API_ENDPOINTS.form.getAllTimeSlots, { immediate: false })
    
    const result = await execute()
    return result.response || []
  }

  /**
   * Obtiene reglas personalizadas por fecha
   * @param searchDate Fecha de búsqueda
   * @returns Promise con las reglas encontradas
   */
  async getCustomRuleByDate(searchDate: string): Promise<CustomRule[]> {
    const { execute } = useApiFetch<CustomRulesResponse>(
      API_ENDPOINTS.form.getCustomRuleByDate,
      { 
        immediate: false,
        query: { SearchDate: searchDate }
      }
    )
    
    const result = await execute()
    return result.response || []
  }

  /**
   * Obtiene los horarios de una regla personalizada por fecha
   * @param searchDate Fecha de búsqueda
   * @returns Promise con los horarios de la regla encontrada
   */
  async getCustomRuleSchedulesByDate(searchDate: string): Promise<CustomRuleSchedule[]> {
    const { execute } = useApiFetch<GetCustomRuleSchedulesByDateResponse>(
      API_ENDPOINTS.form.getCustomRuleByDate,
      { 
        immediate: false,
        query: { SearchDate: searchDate }
      }
    )
    
    const result = await execute()
    return result.response || []
  }

  /**
   * Obtiene reglas de validación
   * @param params Parámetros de búsqueda
   * @returns Promise con la respuesta completa de validación
   */
  async getValidationRules(params: GetValidationRulesRequest): Promise<any> {
    const { execute } = useApiFetch<any>(
      API_ENDPOINTS.form.getValidationRules,
      { 
        immediate: false,
        query: {
          IsDateRange: params.isDateRange,
          StartDate: params.startDate,
          EndDate: params.endDate
        }
      }
    )
    
    const result = await execute()
    return result || null
  }

  /**
   * Obtiene reglas personalizadas por rango de fechas
   * @param searchDate Fecha de búsqueda
   * @returns Promise con las reglas encontradas
   */
  async getCustomRuleByDateRange(searchDate: string): Promise<CustomRule[]> {
    const { execute } = useApiFetch<CustomRulesResponse>(
      API_ENDPOINTS.form.getCustomRuleByDateRange,
      { 
        immediate: false,
        query: { SearchDate: searchDate }
      }
    )
    
    const result = await execute()
    return result.response || []
  }

  /**
   * Reinicia el overSlot de una regla personalizada
   * @param id ID de la regla personalizada
   * @returns Promise con el resultado de la operación
   */
  async resetCustomRuleOverSlot(id: number): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.form.resetCustomRuleOverSlot}/${id}`
    const { execute } = useApiPatch<ApiResponse>(endpoint)
    
    const result = await execute()
    return result.response === true || (result.code === 200 && result.isValid)
  }

  /**
   * Actualiza el estado de un horario en una regla personalizada
   * @param id ID de la regla personalizada
   * @returns Promise con el resultado de la actualización
   */
  async updateCustomRuleTimeSlotStatus(id: number): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.form.updateCustomRuleTimeSlotStatus}/${id}`
    const { execute } = useApiPatch<ApiResponse>(endpoint)
    
    const result = await execute()
    return result.response === true || (result.code === 200 && result.isValid)
  }

  /**
   * Actualiza el overSlot de un día específico
   * @param id ID del día (debe estar entre 1 y 7)
   * @param overSlot Nuevo valor de overSlot
   * @returns Promise con el resultado de la actualización
   */
  async updateOverSlot(id: number, overSlot: number): Promise<boolean> {
    // Validar que el ID esté entre 1 y 7
    if (id < 1 || id > 7) {
      throw new Error('ID de día inválido. Debe estar entre 1 y 7.')
    }

    // Validar que overSlot sea un número positivo
    if (overSlot < 0) {
      throw new Error('El valor de overSlot debe ser mayor o igual a 0.')
    }

    const { execute } = useApiPatch<ApiResponse>(
      API_ENDPOINTS.form.updateOverSlot,
      {
        query: {
          Id: id,
          OverSlot: overSlot
        }
      }
    )
    
    const result = await execute()
    return result.response === true || (result.code === 200 && result.isValid)
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de formularios
 * @type {FormService}
 */
export const formService = new FormService() 