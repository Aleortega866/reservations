import { ref, computed } from 'vue'
import { formService } from '@/lib/api/services/form/form.service'
import type { Schedule as ApiSchedule, Day as ApiDay } from '@/lib/api/types/form'
import type { Schedule, Day } from '@/lib/api/types'
import { useToast } from '../ui/useToast'

// Extender los tipos de la API para compatibilidad
type ExtendedSchedule = ApiSchedule & {
  time?: string
  slot?: number
  overSlot?: number
  dayId?: number
  dayName?: string
  timeSlot?: string
  isEnabled?: boolean
  capacity?: number
  currentBookings?: number
}

type ExtendedDay = ApiDay & {
  isEnabled?: boolean
}

// Variable global para evitar múltiples inicializaciones
let isInitialized = false
let initializationPromise: Promise<void> | null = null

export function useSchedules() {
  const schedules = ref<ExtendedSchedule[]>([])
  const days = ref<ExtendedDay[]>([])
  
  // Obtener el día actual según el endpoint GetAllDaysAsync
  const getCurrentDayId = (): number => {
    const today = new Date().getDay()
    // Convertir de formato JS (0 = Domingo) a formato del endpoint GetAllDaysAsync
    // JS: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    // API: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
    
    let result: number
    if (today === 0) {
      result = 7 // Domingo
    } else if (today === 1) {
      result = 1 // Lunes - se manejará en loadSchedulesByDay
    } else {
      result = today // Resto de días (Martes=2, Miércoles=3, etc.)
    }
    
    return result
  }
  
  const selectedDayId = ref<number>(getCurrentDayId()) // Por defecto el día actual
  const overSlot = ref<number>(30)
  const disableAllSchedules = ref<boolean>(false)
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { showError, showSuccess, showWarning } = useToast()

  // Computed para convertir los horarios al formato esperado por el componente
  const scheduleOptions = computed(() => {
    console.log('Computing scheduleOptions, schedules.value:', schedules.value)
    if (!schedules.value || !Array.isArray(schedules.value)) {
      console.log('Schedules.value es null, undefined o no es un array')
      return []
    }
    const options = schedules.value.map(schedule => ({
      id: schedule.id,
      enable: schedule.enable || schedule.isEnabled || false,
      description: schedule.time || schedule.timeSlot || '',
      horario: schedule.time || schedule.timeSlot || '',
            currentcupo: schedule.slot ? schedule.slot.toString() : '0',
      maxcupo: schedule.overSlot ? schedule.overSlot.toString() : '0',

    }))
    console.log('ScheduleOptions computed:', options)
    return options
  })

  // Cargar todos los días disponibles
  const loadDays = async () => {
    try {
      loading.value = true
      error.value = null
      
      const daysData = await formService.getAllDays()
      // Mapear los datos para incluir isEnabled y name
      days.value = daysData.map(day => ({
        ...day,
        name: day.dayName,
        isEnabled: day.enable !== false // Por defecto habilitado, excepto lunes
      }))
      
      // Solo cambiar el día seleccionado si no hay uno válido (no debería ocurrir normalmente)
      if (selectedDayId.value === 0 && daysData.length > 0) {
        const firstValidDay = daysData.find(day => day.id !== 1) // Excluir lunes (ID=1)
        selectedDayId.value = firstValidDay ? firstValidDay.id : daysData[0].id
      }
      
    } catch (err) {
      error.value = 'Error al cargar los días'
      showError('Error', 'No se pudieron cargar los días disponibles')
      console.error('Error al cargar días:', err)
    } finally {
      loading.value = false
    }
  }

  // Cargar horarios para un día específico
  const loadSchedulesByDay = async (dayId: number) => {
    try {
      // Validar que el día esté entre 1 y 7
      if (dayId < 1 || dayId > 7) {
        throw new Error('ID de día inválido. Debe estar entre 1 y 7.')
      }

      // Si es lunes (día 1), mostrar alerta y no cargar horarios
      // Comentado temporalmente para permitir pruebas
      
      if (dayId === 1) {
        showWarning('Horarios no disponibles', 'Los horarios no están disponibles porque hoy no es un día laboral.')
        schedules.value = []
        overSlot.value = 0
        disableAllSchedules.value = false

        return
      }
      

      loading.value = true
      error.value = null
      
      const response = await formService.getAllSchedulesByDay(dayId)
      console.log('Respuesta de getAllSchedulesByDay:', response)
      
      // Mapear los datos para incluir las propiedades extendidas
      schedules.value = response.schedules.map(schedule => ({
        ...schedule,
        time: schedule.time || `Horario ${schedule.id}`, // Usar el tiempo real de la API
        slot: schedule.slot || 30, // Usar el slot real de la API
        overSlot: schedule.overSlot !== undefined ? schedule.overSlot : 0, // Usar el overSlot individual del horario
        dayId: dayId,
        dayName: '',
        timeSlot: schedule.time || `Horario ${schedule.id}`, // Usar el tiempo real de la API
        isEnabled: schedule.enable,
        capacity: schedule.slot || 30, // Usar el slot como capacidad
        currentBookings: 0 // Valor por defecto
      }))
      console.log('Schedules mapeados:', schedules.value)
      
      overSlot.value = response.overSlot
      disableAllSchedules.value = response.disableAllSchedules
      
      // Actualizar el día seleccionado
      selectedDayId.value = dayId
      
    } catch (err) {
      error.value = 'Error al cargar los horarios'
      showError('Error', 'No se pudieron cargar los horarios para este día')
      console.error('Error al cargar horarios:', err)
    } finally {
      loading.value = false
    }
  }

  // Cambiar el estado de habilitación de un horario
  const toggleScheduleEnableStatus = async (scheduleId: number) => {
    try {
      // Validar que no sea lunes
      if (selectedDayId.value === 1) {
        showError('Operación no permitida', 'No se pueden modificar horarios para el lunes porque no es un día laboral.')
        return
      }

      // Validar que el ID esté entre 1 y 48
      if (scheduleId < 1 || scheduleId > 48) {
        throw new Error('ID de horario inválido. Debe estar entre 1 y 48.')
      }

      const result = await formService.updateScheduleEnableStatus(scheduleId)
      
      if (result) {
        // Actualizar el estado local
        const schedule = schedules.value.find(s => s.id === scheduleId)
        if (schedule) {
          schedule.enable = !schedule.enable
          // Mantener compatibilidad con la propiedad isEnabled
          schedule.isEnabled = schedule.enable
        }
        
        showSuccess('Estado actualizado', 'El estado del horario se ha actualizado correctamente')
      } else {
        showError('Error', 'No se pudo actualizar el estado del horario')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error al actualizar el estado del horario'
      showError('Error', errorMessage)
      console.error('Error al actualizar estado del horario:', err)
    }
  }

  // Cambiar el estado de todos los horarios
  const toggleAllSchedulesStatus = async () => {
    try {
      // Validar que haya un día seleccionado
      if (selectedDayId.value < 1 || selectedDayId.value > 7) {
        throw new Error('Debe seleccionar un día válido (ID entre 1 y 7)')
      }

      // Validar que no sea lunes
      if (selectedDayId.value === 1) {
        showError('Operación no permitida', 'No se pueden modificar horarios para el lunes porque no es un día laboral.')
        return
      }

      // allSchedules: false activa todos, true desactiva todos
      const allSchedules = disableAllSchedules.value
      const result = await formService.updateAllSchedulesEnableStatus(selectedDayId.value, allSchedules)
      
      if (result) {
        // Actualizar el estado local de todos los horarios
        schedules.value.forEach(schedule => {
          schedule.enable = !allSchedules // Si allSchedules es true, desactivar todos
          // Mantener compatibilidad con la propiedad isEnabled
          schedule.isEnabled = schedule.enable
        })
        
        disableAllSchedules.value = !disableAllSchedules.value
        
        const action = allSchedules ? 'desactivados' : 'activados'
        showSuccess('Estado actualizado', `Todos los horarios han sido ${action} correctamente`)
      } else {
        showError('Error', 'No se pudo actualizar el estado de todos los horarios')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error al actualizar el estado de todos los horarios'
      showError('Error', errorMessage)
      console.error('Error al actualizar estado de todos los horarios:', err)
    }
  }

  // Cargar datos iniciales
  const initialize = async () => {
    // Evitar múltiples inicializaciones simultáneas
    if (isInitialized) {
      console.log('useSchedules ya está inicializado, saltando inicialización')
      return
    }
    
    if (initializationPromise) {
      console.log('useSchedules ya se está inicializando, esperando...')
      await initializationPromise
      return
    }
    
    //console.log('Inicializando useSchedules - Día seleccionado:', selectedDayId.value)
    
    initializationPromise = (async () => {
      try {
        await loadDays()
        if (selectedDayId.value > 0) {
          await loadSchedulesByDay(selectedDayId.value)
        }
        isInitialized = true
        console.log('useSchedules inicializado exitosamente')
      } catch (error) {
        console.error('Error durante la inicialización de useSchedules:', error)
        throw error
      } finally {
        initializationPromise = null
      }
    })()
    
    await initializationPromise
  }

  // Método para resetear la inicialización (útil para testing o recarga)
  const resetInitialization = () => {
    isInitialized = false
    initializationPromise = null
    console.log('Inicialización de useSchedules reseteada')
  }

  // Actualizar el overSlot de un día específico
  const updateOverSlot = async (dayId: number, newOverSlot: number) => {
    try {
      loading.value = true
      error.value = null
      
      const success = await formService.updateOverSlot(dayId, newOverSlot)
      
      if (success) {
        showSuccess('Éxito', 'OverSlot actualizado correctamente')
        // Actualizar el valor local
        overSlot.value = newOverSlot
        // Recargar los horarios del día actual
        await loadSchedulesByDay(selectedDayId.value)
      } else {
        showError('Error', 'No se pudo actualizar el overSlot')
      }
      
    } catch (err: any) {
      error.value = err?.message || 'Error al actualizar overSlot'
      showError('Error', error.value)
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    schedules,
    days,
    selectedDayId,
    overSlot,
    disableAllSchedules,
    loading,
    error,
    scheduleOptions,
    
    // Métodos
    loadDays,
    loadSchedulesByDay,
    toggleScheduleEnableStatus,
    toggleAllSchedulesStatus,
    initialize,
    resetInitialization,
    updateOverSlot
  }
} 