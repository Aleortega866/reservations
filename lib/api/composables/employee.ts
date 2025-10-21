// ============================================================================
// EMPLOYEE COMPOSABLE - Gestión Reactiva de Empleados
// ============================================================================

import { ref, computed, readonly } from 'vue'
import { employeeService } from '../services/employee'
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  DeleteEmployeeRequest,
  GetAllEmployeesRequest,
  GetEmployeeRequest
} from '../types/employee'

/**
 * Composable reactivo para gestión de empleados
 * Proporciona estados reactivos y métodos para operaciones CRUD
 */
export function useApiEmployee() {
  // ========================================================================
  // ESTADOS REACTIVOS
  // ========================================================================

  const employees = ref<Employee[]>([])
  const currentEmployee = ref<Employee | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // ========================================================================
  // COMPUTED PROPERTIES
  // ========================================================================

  const hasEmployees = computed(() => employees.value.length > 0)
  const employeesCount = computed(() => employees.value.length)

  // ========================================================================
  // MÉTODOS DE UTILIDAD
  // ========================================================================

  const clearError = () => {
    error.value = null
  }

  const setError = (err: any) => {
    error.value = err instanceof Error ? err : new Error(String(err))
  }

  // ========================================================================
  // MÉTODOS CRUD - CREATE
  // ========================================================================

  /**
   * Crea un nuevo empleado
   * @param {CreateEmployeeRequest} data - Datos del empleado
   * @returns {Promise<Employee>} Empleado creado
   */
  const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee> => {
    try {
      clearError()
      loading.value = true
      
      const newEmployee = await employeeService.createEmployee(data)
      
      // Agregar a la lista local
      employees.value.push(newEmployee)
      
      return newEmployee
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========================================================================
  // MÉTODOS CRUD - READ
  // ========================================================================

  /**
   * Obtiene todos los empleados
   * @param {GetAllEmployeesRequest} filters - Filtros opcionales
   * @returns {Promise<Employee[]>} Lista de empleados
   */
  const getAllEmployees = async (filters?: GetAllEmployeesRequest): Promise<Employee[]> => {
    try {
      clearError()
      loading.value = true
      
      const result = await employeeService.getAllEmployees(filters)
      employees.value = result
      
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un empleado específico
   * @param {GetEmployeeRequest} params - Parámetros de búsqueda
   * @returns {Promise<Employee>} Empleado encontrado
   */
  const getEmployee = async (params: GetEmployeeRequest): Promise<Employee> => {
    try {
      clearError()
      loading.value = true
      
      const result = await employeeService.getEmployee(params)
      currentEmployee.value = result
      
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un empleado por ID
   * @param {number} id - ID del empleado
   * @returns {Promise<Employee>} Empleado encontrado
   */
  const getEmployeeById = async (id: number): Promise<Employee> => {
    return getEmployee({ id })
  }

  /**
   * Obtiene un empleado por email
   * @param {string} email - Email del empleado
   * @returns {Promise<Employee>} Empleado encontrado
   */
  const getEmployeeByEmail = async (email: string): Promise<Employee> => {
    return getEmployee({ email })
  }

  // ========================================================================
  // MÉTODOS CRUD - UPDATE
  // ========================================================================

  /**
   * Actualiza un empleado existente
   * @param {UpdateEmployeeRequest} data - Datos actualizados
   * @returns {Promise<Employee>} Empleado actualizado
   */
  const updateEmployee = async (data: UpdateEmployeeRequest): Promise<Employee> => {
    try {
      clearError()
      loading.value = true
      
      const updatedEmployee = await employeeService.updateEmployee(data)
      
      // Actualizar en la lista local
      const index = employees.value.findIndex(emp => emp.id === data.id)
      if (index !== -1) {
        employees.value[index] = updatedEmployee
      }
      
      // Actualizar empleado actual si es el mismo
      if (currentEmployee.value?.id === data.id) {
        currentEmployee.value = updatedEmployee
      }
      
      return updatedEmployee
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE
  // ========================================================================

  /**
   * Elimina un empleado
   * @param {DeleteEmployeeRequest} data - Datos para eliminación
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  const deleteEmployee = async (data: DeleteEmployeeRequest): Promise<boolean> => {
    try {
      clearError()
      loading.value = true
      
      const success = await employeeService.deleteEmployee(data)
      
      if (success) {
        // Remover de la lista local
        employees.value = employees.value.filter(emp => emp.email !== data.email)
        
        // Limpiar empleado actual si es el mismo
        if (currentEmployee.value?.email === data.email) {
          currentEmployee.value = null
        }
      }
      
      return success
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un empleado por email
   * @param {string} email - Email del empleado
   * @param {number} userModifiedId - ID del usuario que elimina
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  const deleteEmployeeByEmail = async (email: string, userModifiedId: number): Promise<boolean> => {
    return deleteEmployee({ email, userModifiedId })
  }

  // ========================================================================
  // MÉTODOS DE UTILIDAD
  // ========================================================================

  /**
   * Limpia todos los estados
   */
  const clear = () => {
    employees.value = []
    currentEmployee.value = null
    error.value = null
  }

  /**
   * Recarga los datos de empleados
   * @param {GetAllEmployeesRequest} filters - Filtros opcionales
   */
  const refresh = async (filters?: GetAllEmployeesRequest) => {
    await getAllEmployees(filters)
  }

  // ========================================================================
  // RETORNO DEL COMPOSABLE
  // ========================================================================

  return {
    // Estados reactivos (readonly para evitar mutaciones externas)
    employees: readonly(employees),
    currentEmployee: readonly(currentEmployee),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed properties
    hasEmployees,
    employeesCount,
    
    // Métodos CRUD
    createEmployee,
    getAllEmployees,
    getEmployee,
    getEmployeeById,
    getEmployeeByEmail,
    updateEmployee,
    deleteEmployee,
    deleteEmployeeByEmail,
    
    // Métodos de utilidad
    clear,
    refresh,
    clearError
  }
}
