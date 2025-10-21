// ============================================================================
// EMPLOYEE SERVICE - Servicio de Gestión de Empleados
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete, API_ENDPOINTS } from '../../core/useFetch'
import type {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  GetAllEmployeesRequest,
  GetAllEmployeesResponse,
  GetEmployeeRequest,
  GetEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  DeleteEmployeeRequest,
  DeleteEmployeeResponse,
  Employee
} from '../../types/employee/index'

/**
 * Servicio de gestión de empleados que maneja CRUD completo
 * @class EmployeeService
 */
export class EmployeeService {
  
  // ========================================================================
  // MÉTODOS CRUD - CREATE
  // ========================================================================

  /**
   * Crea un nuevo empleado en el sistema
   * @param {CreateEmployeeRequest} data - Datos del nuevo empleado
   * @returns {Promise<Employee>} Datos del empleado creado
   * @throws {Error} Error si los datos son inválidos o el email ya existe
   */
  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const { execute } = useApiPost<CreateEmployeeResponse>(
      API_ENDPOINTS.employee.create,
      { immediate: false }
    )
    const result = await execute({ body: data })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - READ
  // ========================================================================

  /**
   * Obtiene todos los empleados del sistema con filtros opcionales
   * @param {GetAllEmployeesRequest} filters - Filtros opcionales (id, email)
   * @returns {Promise<Employee[]>} Lista de empleados
   * @throws {Error} Error si no se pueden cargar los empleados
   */
  async getAllEmployees(filters?: GetAllEmployeesRequest): Promise<Employee[]> {
    const { execute } = useApiFetch<GetAllEmployeesResponse>(
      API_ENDPOINTS.employee.getAll,
      { immediate: false }
    )
    const result = await execute({ 
      query: filters || {} 
    })
    return result.response || []
  }

  /**
   * Obtiene un empleado específico por ID o email
   * @param {GetEmployeeRequest} params - Parámetros de búsqueda (id o email)
   * @returns {Promise<Employee>} Datos del empleado encontrado
   * @throws {Error} Error si el empleado no existe
   */
  async getEmployee(params: GetEmployeeRequest): Promise<Employee> {
    const { execute } = useApiFetch<GetEmployeeResponse>(
      API_ENDPOINTS.employee.getById,
      { immediate: false }
    )
    const result = await execute({ 
      query: params || {} 
    })
    return result.response
  }

  /**
   * Obtiene un empleado por su ID
   * @param {number} id - ID del empleado
   * @returns {Promise<Employee>} Datos del empleado
   */
  async getEmployeeById(id: number): Promise<Employee> {
    return this.getEmployee({ id })
  }

  /**
   * Obtiene un empleado por su email
   * @param {string} email - Email del empleado
   * @returns {Promise<Employee>} Datos del empleado
   */
  async getEmployeeByEmail(email: string): Promise<Employee> {
    return this.getEmployee({ email })
  }

  // ========================================================================
  // MÉTODOS CRUD - UPDATE
  // ========================================================================

  /**
   * Actualiza los datos de un empleado existente
   * @param {UpdateEmployeeRequest} data - Datos actualizados del empleado
   * @returns {Promise<Employee>} Datos del empleado actualizado
   * @throws {Error} Error si el empleado no existe o los datos son inválidos
   */
  async updateEmployee(data: UpdateEmployeeRequest): Promise<Employee> {
    const { execute } = useApiPut<UpdateEmployeeResponse>(
      API_ENDPOINTS.employee.update,
      { immediate: false }
    )
    const result = await execute({ body: data })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE
  // ========================================================================

  /**
   * Elimina un empleado del sistema
   * @param {DeleteEmployeeRequest} data - Datos para eliminación
   * @returns {Promise<boolean>} True si se eliminó correctamente
   * @throws {Error} Error si el empleado no existe o no se puede eliminar
   */
  async deleteEmployee(data: DeleteEmployeeRequest): Promise<boolean> {
    const { execute } = useApiDelete<DeleteEmployeeResponse>(
      API_ENDPOINTS.employee.delete,
      { immediate: false }
    )
    const result = await execute({ body: data })
    return result.response
  }

  /**
   * Elimina un empleado por su email
   * @param {string} email - Email del empleado a eliminar
   * @param {number} userModifiedId - ID del usuario que realiza la eliminación
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async deleteEmployeeByEmail(email: string, userModifiedId: number): Promise<boolean> {
    return this.deleteEmployee({ email, userModifiedId })
  }
}
