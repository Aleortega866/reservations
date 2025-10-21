// ============================================================================
// INTERFACES DE EMPLOYEE
// ============================================================================

// Tipos para Create Employee
export interface CreateEmployeeRequest {
  userName: string | null
  email: string | null
  password: string | null
  name: string | null
  paternalLastName: string | null
  maternalLastName: string | null
  userModifiedId: number
}

export interface CreateEmployeeResponse {
  code: number
  isValid: boolean
  comments: string
  response: Employee
}

// Tipos para Get All Employees
export interface GetAllEmployeesRequest {
  id?: number
  email?: string
}

export interface GetAllEmployeesResponse {
  code: number
  isValid: boolean
  comments: string
  response: Employee[]
}

// Tipos para Get Employee
export interface GetEmployeeRequest {
  id?: number
  email?: string
}

export interface GetEmployeeResponse {
  code: number
  isValid: boolean
  comments: string
  response: Employee
}

// Tipos para Update Employee
export interface UpdateEmployeeRequest {
  id: number
  email: string | null
  phoneNumber: string | null
  userName: string | null
  name: string | null
  paternalLastName: string | null
  maternalLastName: string | null
  enableMarketing: boolean
  enableUsePersonalData: boolean
  userModifiedId: number
  dateModified: string
}

export interface UpdateEmployeeResponse {
  code: number
  isValid: boolean
  comments: string
  response: Employee
}

// Tipos para Delete Employee
export interface DeleteEmployeeRequest {
  email: string | null
  userModifiedId: number
}

export interface DeleteEmployeeResponse {
  code: number
  isValid: boolean
  comments: string
  response: boolean
}

// Tipo principal de Employee
export interface Employee {
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




