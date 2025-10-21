import { ref, computed, readonly } from 'vue'
import { useApiFetch, useApiPost, useApiPut, useApiDelete, API_ENDPOINTS } from '@/lib/api/core/useFetch'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/lib/api/types/employee'
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface MuseoEmployee {
  id: number
  userId: string
  userName: string | null
  email: string | null
  phoneNumber: string | null
  name: string | null
  paternalLastName: string | null
  maternalLastName: string | null
  statusId: number
  status: string
  gender: string
  genderId: number
  userTypeId: number
  userType: string
  enable: boolean
  position: string
  dateModified: string
  enableMarketing?: boolean
  enableUsePersonalData?: boolean
  userModifiedId?: number
  dateCreated?: string
  isActive?: boolean
}

// ============================================================================
// COMPOSABLE MEJORADO DE EMPLEADOS
// ============================================================================

/**
 * Composable unificado para gestión de empleados
 * Combina lo mejor de:
 * - API composables (useApiFetch) para optimización
 * - Lógica de negocio completa
 * - Manejo robusto de errores y notificaciones
 */
export function useEmployees() {
  // ============================================================================
  // COMPOSABLES Y SERVICIOS BASE
  // ============================================================================
  
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()

  // Helper function to handle error casting
  const handleError = (err: unknown) => getErrorMessage(err as any)

  // ============================================================================
  // COMPOSABLES DE API CON OPTIMIZACIÓN
  // ============================================================================

  // Composable para obtener todos los empleados
  const getAllEmployeesComposable = useApiFetch<{ response: Employee[] }>(API_ENDPOINTS.employee.getAll, {
    immediate: false
  })

  // Composable para obtener empleado por ID
  const getEmployeeByIdComposable = useApiFetch<{ response: Employee }>(API_ENDPOINTS.employee.getById, {
    immediate: false
  })

  // Composable para crear empleado
  const createEmployeeComposable = useApiPost<{ response: Employee }>(API_ENDPOINTS.employee.create, {
    immediate: false
  })

  // Composable para actualizar empleado
  const updateEmployeeComposable = useApiPut<{ response: Employee }>(API_ENDPOINTS.employee.update, {
    immediate: false
  })

  // Composable para eliminar empleado
  const deleteEmployeeComposable = useApiDelete<{ code: number; response: number; comments: string }>(API_ENDPOINTS.employee.delete, {
    immediate: false
  })

  // ============================================================================
  // ESTADOS REACTIVOS LOCALES
  // ============================================================================

  const employees = ref<MuseoEmployee[]>([])
  const isCreating = ref(false)
  const isUpdating = ref(false)
  const isDeleting = ref(false)

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  // Estado de loading unificado y optimizado
  const isLoading = computed(() => 
    getAllEmployeesComposable.pending.value || 
    getEmployeeByIdComposable.pending.value ||
    createEmployeeComposable.pending.value || 
    updateEmployeeComposable.pending.value || 
    deleteEmployeeComposable.pending.value
  )

  // Error handling unificado
  const error = computed(() => 
    getAllEmployeesComposable.error.value || 
    getEmployeeByIdComposable.error.value ||
    createEmployeeComposable.error.value || 
    updateEmployeeComposable.error.value || 
    deleteEmployeeComposable.error.value
  )

  // ============================================================================
  // MÉTODOS CRUD - CREATE
  // ============================================================================

  /**
   * Crea un nuevo empleado
   * @param {CreateEmployeeRequest} data - Datos del empleado
   * @returns {Promise<Employee>} Empleado creado
   */
  const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee> => {
    try {
      isCreating.value = true
      
      const result = await createEmployeeComposable.execute({ body: data })
      const newEmployee = result.response
      
      // Agregar a la lista local
      employees.value.push(newEmployee as MuseoEmployee)
      
      showSuccess('Empleado creado exitosamente')
      return newEmployee
         } catch (err) {
       const errorMessage = getErrorMessage(err as any)
       showError(`Error al crear empleado: ${errorMessage}`)
      throw err
    } finally {
      isCreating.value = false
    }
  }

  // ============================================================================
  // MÉTODOS CRUD - READ
  // ============================================================================

  /**
   * Obtiene todos los empleados
   * @param {object} filters - Filtros opcionales (id, email)
   * @returns {Promise<Employee[]>} Lista de empleados
   */
  const getAllEmployees = async (filters?: { id?: number; email?: string }): Promise<Employee[]> => {
    try {
      const result = await getAllEmployeesComposable.execute({ query: filters || {} })
      const employeeList = result.response || []
      
      // Actualizar estado local
      employees.value = employeeList as MuseoEmployee[]
      
      return employeeList
         } catch (err) {
       const errorMessage = getErrorMessage(err as any)
       showError(`Error al cargar empleados: ${errorMessage}`)
      throw err
    }
  }

  /**
   * Obtiene un empleado por ID
   * @param {number} id - ID del empleado
   * @returns {Promise<Employee>} Empleado encontrado
   */
  const getEmployeeById = async (id: number): Promise<Employee> => {
    try {
      const result = await getEmployeeByIdComposable.execute({ query: { id } })
      return result.response
    } catch (err) {
      const errorMessage = getErrorMessage(err as any)
      showError(`Error al obtener empleado: ${errorMessage}`)
      throw err
    }
  }

  /**
   * Obtiene un empleado por email
   * @param {string} email - Email del empleado
   * @returns {Promise<Employee>} Empleado encontrado
   */
  const getEmployeeByEmail = async (email: string): Promise<Employee> => {
    try {
      const result = await getEmployeeByIdComposable.execute({ query: { email } })
      return result.response
         } catch (err) {
       const errorMessage = handleError(err)
       showError(`Error al obtener empleado: ${errorMessage}`)
      throw err
    }
  }

  // ============================================================================
  // MÉTODOS CRUD - UPDATE
  // ============================================================================

  /**
   * Actualiza un empleado existente
   * @param {UpdateEmployeeRequest} data - Datos actualizados
   * @returns {Promise<Employee>} Empleado actualizado
   */
  const updateEmployee = async (data: UpdateEmployeeRequest): Promise<Employee> => {
    try {
      isUpdating.value = true
      
      const result = await updateEmployeeComposable.execute({ body: data })
      const updatedEmployee = result.response
      
      // Actualizar en la lista local
      const index = employees.value.findIndex(emp => emp.id === data.id)
      if (index !== -1) {
        employees.value[index] = updatedEmployee as MuseoEmployee
      }
      
      showSuccess('Empleado actualizado exitosamente')
      return updatedEmployee
    } catch (err) {
      const errorMessage = handleError(err)
      showError(`Error al actualizar empleado: ${errorMessage}`)
      throw err
    } finally {
      isUpdating.value = false
    }
  }

  // ============================================================================
  // MÉTODOS CRUD - DELETE
  // ============================================================================

  /**
   * Elimina un empleado
   * @param {string} email - Email del empleado
   * @param {number} userModifiedId - ID del usuario que elimina
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  const deleteEmployee = async (email: string, userModifiedId: number): Promise<boolean> => {
    try {
      isDeleting.value = true
      const result = await deleteEmployeeComposable.execute({ 
        body: { email, userModifiedId } 
      })
      // Verificar si la operación fue exitosa (code 200 o response no es null/undefined)
      const isSuccess = result.code === 200 || result.response !== null && result.response !== undefined
      
      if (isSuccess) {
        // Remover de la lista local
        employees.value = employees.value.filter(emp => emp.email !== email)
        showSuccess('Registro Eliminado', 'Empleado eliminado exitosamente')
      }
      
      return isSuccess
    } catch (err) {
      const errorMessage = handleError(err)
      showError(`Error al eliminar empleado: ${errorMessage}`)
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  /**
   * Limpia todos los estados
   */
  const clear = () => {
    employees.value = []
  }

  /**
   * Recarga los datos de empleados
   * @param {object} filters - Filtros opcionales
   */
  const refresh = async (filters?: { id?: number; email?: string }) => {
    await getAllEmployees(filters)
  }

  // ============================================================================
  // RETORNO DEL COMPOSABLE
  // ============================================================================

  return {
    // Estados reactivos (readonly para evitar mutaciones externas)
    employees: readonly(employees),
    loading: readonly(isLoading),
    error: readonly(error),
    isCreating: readonly(isCreating),
    isUpdating: readonly(isUpdating),
    isDeleting: readonly(isDeleting),
    
    // Métodos CRUD
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    getEmployeeByEmail,
    updateEmployee,
    deleteEmployee,
    
    // Métodos de utilidad
    clear,
    refresh
  }
}
