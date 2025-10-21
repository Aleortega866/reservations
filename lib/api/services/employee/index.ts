// ============================================================================
// EMPLOYEE SERVICE INDEX - Exportaciones del Servicio de Empleados
// ============================================================================

import { EmployeeService } from './employee.service'

export { EmployeeService }

// Instancia singleton del servicio
export const employeeService = new EmployeeService()
