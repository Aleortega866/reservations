import { ref, computed, readonly } from 'vue'
import { formService } from '@/lib/api/services/form/form.service'
import type { CustomRule, CustomRuleSchedule } from '@/lib/api/types'
import { useToast } from '../ui/useToast'

export function useCustomRules() {
  const customRules = ref<CustomRule[]>([])
  const customRuleSchedules = ref<CustomRuleSchedule[]>([])
  const selectedDate = ref<string>('')
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { showError, showSuccess } = useToast()

  // Computed para convertir los horarios de reglas al formato esperado por el componente
  const customRuleScheduleOptions = computed(() => {
    if (!customRuleSchedules.value || !Array.isArray(customRuleSchedules.value)) {
      return []
    }
    return customRuleSchedules.value.map(schedule => ({
      id: schedule.id,
      enable: schedule.enable,
      description: schedule.time || '',
      horario: schedule.time || '',
      maxcupo: schedule.slot ? schedule.slot.toString() : '0',
      currentcupo: schedule.slot ? schedule.slot.toString() : '0',
      customRuleId: schedule.customRuleId,
      timeSlotId: schedule.timeSlotId,
      overSlot: schedule.overSlot
    }))
  })

  /**
   * Carga las reglas personalizadas para una fecha específica
   * @param date Fecha en formato YYYY-MM-DD
   */
  const loadCustomRulesByDate = async (date: string) => {
    loading.value = true
    error.value = null
    selectedDate.value = date
    
    try {
      const rules = await formService.getCustomRuleByDate(date)
      customRules.value = rules
      
      if (rules.length > 0) {
        // Si hay reglas, cargar también los horarios
        await loadCustomRuleSchedulesByDate(date)
      } else {
        // Si no hay reglas, limpiar los horarios
        customRuleSchedules.value = []
      }
      
      showSuccess('Reglas cargadas', `Se cargaron ${rules.length} reglas para la fecha ${date}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar las reglas personalizadas'
      showError('Error al cargar reglas', error.value)
      console.error('Error loading custom rules:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Carga los horarios de reglas personalizadas para una fecha específica
   * @param date Fecha en formato YYYY-MM-DD
   */
  const loadCustomRuleSchedulesByDate = async (date: string) => {
    try {
      const schedules = await formService.getCustomRuleSchedulesByDate(date)
      customRuleSchedules.value = schedules
      console.log(`Horarios de reglas cargados para ${date}:`, schedules)
    } catch (err) {
      console.error('Error loading custom rule schedules:', err)
      // No mostrar error aquí ya que puede ser normal que no haya horarios
      customRuleSchedules.value = []
    }
  }

  /**
   * Obtiene las reglas personalizadas para una fecha específica
   * @param date Fecha en formato YYYY-MM-DD
   * @returns Promise con las reglas encontradas
   */
  const getCustomRulesByDate = async (date: string): Promise<CustomRule[]> => {
    try {
      const rules = await formService.getCustomRuleByDate(date)
      return rules
    } catch (err) {
      console.error('Error getting custom rules by date:', err)
      return []
    }
  }

  /**
   * Obtiene los horarios de reglas personalizadas para una fecha específica
   * @param date Fecha en formato YYYY-MM-DD
   * @returns Promise con los horarios encontrados
   */
  const getCustomRuleSchedulesByDate = async (date: string): Promise<CustomRuleSchedule[]> => {
    try {
      const schedules = await formService.getCustomRuleSchedulesByDate(date)
      return schedules
    } catch (err) {
      console.error('Error getting custom rule schedules by date:', err)
      return []
    }
  }

  /**
   * Verifica si hay reglas personalizadas para una fecha
   * @param date Fecha en formato YYYY-MM-DD
   * @returns Promise con true si hay reglas, false en caso contrario
   */
  const hasCustomRulesForDate = async (date: string): Promise<boolean> => {
    try {
      const rules = await getCustomRulesByDate(date)
      return rules.length > 0
    } catch (err) {
      console.error('Error checking custom rules for date:', err)
      return false
    }
  }

  /**
   * Verifica si hay horarios de reglas personalizadas para una fecha
   * @param date Fecha en formato YYYY-MM-DD
   * @returns Promise con true si hay horarios, false en caso contrario
   */
  const hasCustomRuleSchedulesForDate = async (date: string): Promise<boolean> => {
    try {
      const schedules = await getCustomRuleSchedulesByDate(date)
      return schedules.length > 0
    } catch (err) {
      console.error('Error checking custom rule schedules for date:', err)
      return false
    }
  }

  /**
   * Limpia los datos cargados
   */
  const clearData = () => {
    customRules.value = []
    customRuleSchedules.value = []
    selectedDate.value = ''
    error.value = null
  }

  return {
    // Estado reactivo
    customRules: readonly(customRules),
    customRuleSchedules: readonly(customRuleSchedules),
    customRuleScheduleOptions,
    selectedDate: readonly(selectedDate),
    loading: readonly(loading),
    error: readonly(error),

    // Métodos
    loadCustomRulesByDate,
    loadCustomRuleSchedulesByDate,
    getCustomRulesByDate,
    getCustomRuleSchedulesByDate,
    hasCustomRulesForDate,
    hasCustomRuleSchedulesForDate,
    clearData
  }
} 