// ============================================================================
// USE AVAILABILITY COMPOSABLE - Composable para manejar disponibilidad mensual
// ============================================================================

import { ref, computed, readonly } from 'vue'
import { AvailabilityService } from '@/lib/api/services/availability/availability.service'
import type { 
  MonthlyAvailabilityResponse, 
  DayAvailability, 
  AvailabilityFilters 
} from '@/lib/api/types/availability'
import { useToast } from '../ui/useToast'

/**
 * Composable para manejar la disponibilidad mensual
 * @returns Objeto con estado y métodos para manejar disponibilidad
 */
export function useAvailability() {
  const availabilityService = new AvailabilityService()
  const { showError } = useToast()

  // Estado reactivo
  const monthlyAvailability = ref<MonthlyAvailabilityResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())

  // Computed properties
  const availabilityByDay = computed(() => {
    if (!monthlyAvailability.value) return new Map<number, DayAvailability>()
    
    const map = new Map<number, DayAvailability>()
    monthlyAvailability.value.days.forEach(day => {
      map.set(day.day, day)
    })
    return map
  })

  const isDayAvailable = computed(() => {
    return (day: number) => {
      const dayData = availabilityByDay.value.get(day)
      return dayData?.isEnabled ?? false
    }
  })

  const getDayColor = computed(() => {
    return (day: number) => {
      const dayData = availabilityByDay.value.get(day)
      return dayData?.color ?? '#e5e7eb' // Color gris por defecto
    }
  })

  const getDayAvailabilityType = computed(() => {
    return (day: number) => {
      const dayData = availabilityByDay.value.get(day)
      return dayData?.availabilityType ?? 'No disponible'
    }
  })

  const getDayAvailabilityPercentage = computed(() => {
    return (day: number) => {
      const dayData = availabilityByDay.value.get(day)
      return dayData?.availabilityPercentage ?? 0
    }
  })

  // Métodos
  const loadMonthlyAvailability = async (month?: number, year?: number) => {
    try {
      loading.value = true
      error.value = null

      const targetMonth = month ?? currentMonth.value
      const targetYear = year ?? currentYear.value

      const response = await availabilityService.getMonthlyAvailability(targetMonth, targetYear)
      monthlyAvailability.value = response
      currentMonth.value = targetMonth
      currentYear.value = targetYear

    } catch (err) {
      error.value = 'Error al cargar la disponibilidad mensual'
      console.error('Error loading monthly availability:', err)
      showError('Error', 'No se pudo cargar la disponibilidad del mes')
    } finally {
      loading.value = false
    }
  }

  const loadMonthlyAvailabilityWithFilters = async (filters: AvailabilityFilters) => {
    return loadMonthlyAvailability(filters.month, filters.year)
  }

  const refreshAvailability = async () => {
    if (currentMonth.value && currentYear.value) {
      await loadMonthlyAvailability(currentMonth.value, currentYear.value)
    }
  }

  const clearAvailability = () => {
    monthlyAvailability.value = null
    error.value = null
  }

  return {
    // Estado
    monthlyAvailability: readonly(monthlyAvailability),
    loading: readonly(loading),
    error: readonly(error),
    currentMonth: readonly(currentMonth),
    currentYear: readonly(currentYear),

    // Computed
    availabilityByDay,
    isDayAvailable,
    getDayColor,
    getDayAvailabilityType,
    getDayAvailabilityPercentage,

    // Métodos
    loadMonthlyAvailability,
    loadMonthlyAvailabilityWithFilters,
    refreshAvailability,
    clearAvailability
  }
}
