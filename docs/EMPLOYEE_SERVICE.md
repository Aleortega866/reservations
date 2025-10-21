# Employee Service - Gestión de Empleados

Sistema completo de gestión de empleados para la API de MIDER, siguiendo el patrón establecido en el proyecto.

## 🚀 **Características Principales**

- ✅ **CRUD completo** - Crear, leer, actualizar y eliminar empleados
- ✅ **Tipos TypeScript completos** - Interfaces para todos los requests/responses
- ✅ **Composables reactivos** - Estados loading, error y data automáticos
- ✅ **Manejo de errores mejorado** - Errores específicos con mensajes claros
- ✅ **Autenticación automática** - Token Bearer automático en todas las peticiones
- ✅ **Validación de datos** - Validación de campos requeridos y formatos

## 📁 **Estructura del Servicio**

```
lib/api/
├── types/employee/
│   └── index.ts              # Tipos TypeScript para Employee
├── services/employee/
│   ├── employee.service.ts   # Clase de servicio principal
│   └── index.ts              # Exportaciones del servicio
├── composables/
│   └── employee.ts           # Composable reactivo
└── composables/
    └── useEmployees.ts       # Composable de alto nivel
```

## 🔧 **Endpoints Disponibles**

### **POST** `/api/Employee/CreateEmployeeAsync`
Crea un nuevo empleado en el sistema.

**Body:**
```typescript
{
  userName: string | null
  email: string | null
  password: string | null
  name: string | null
  paternalLastName: string | null
  maternalLastName: string | null
  userModifiedId: number
}
```

### **GET** `/api/Employee/GetAllEmployeesAsync`
Obtiene todos los empleados con filtros opcionales.

**Query Parameters:**
- `id?: number` - Filtrar por ID
- `email?: string` - Filtrar por email

### **GET** `/api/Employee/GetEmployeeAsync`
Obtiene un empleado específico por ID o email.

**Query Parameters:**
- `id?: number` - ID del empleado
- `email?: string` - Email del empleado

### **PUT** `/api/Employee/UpdateEmployeeAsync`
Actualiza los datos de un empleado existente.

**Body:**
```typescript
{
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
```

### **DELETE** `/api/Employee/DeleteEmployeeAsync`
Elimina un empleado del sistema.

**Body:**
```typescript
{
  email: string | null
  userModifiedId: number
}
```

## 📖 **Uso Básico**

### **Importar el Servicio**

```typescript
// Importar composable de alto nivel (recomendado)
import { useEmployees } from '@/composables/useEmployees'

// Importar composable directo de la API
import { useApiEmployee } from '@/lib/api'

// Importar servicio directo
import { employeeService } from '@/lib/api'

// Importar tipos
import type { 
  Employee, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest 
} from '@/lib/api'
```

### **Uso con Composable de Alto Nivel (Recomendado)**

```vue
<script setup lang="ts">
import { useEmployees } from '@/composables/useEmployees'
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/lib/api/types/employee'

const {
  employees,
  loading,
  error,
  isCreating,
  isUpdating,
  isDeleting,
  hasEmployees,
  employeesCount,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByEmail,
  updateEmployee,
  deleteEmployee,
  clear,
  refresh
} = useEmployees()

// Cargar empleados al montar el componente
onMounted(async () => {
  await getAllEmployees()
})

// Crear un nuevo empleado
const handleCreateEmployee = async () => {
  const newEmployee: CreateEmployeeRequest = {
    userName: 'juan.perez',
    email: 'juan.perez@empresa.com',
    password: 'password123',
    name: 'Juan',
    paternalLastName: 'Pérez',
    maternalLastName: 'García',
    userModifiedId: 1
  }
  
  await createEmployee(newEmployee)
  // La lista se actualiza automáticamente
}

// Actualizar un empleado
const handleUpdateEmployee = async (employeeId: number) => {
  const updateData: UpdateEmployeeRequest = {
    id: employeeId,
    email: 'juan.perez.nuevo@empresa.com',
    phoneNumber: '+52 55 1234 5678',
    userName: 'juan.perez.nuevo',
    name: 'Juan Carlos',
    paternalLastName: 'Pérez',
    maternalLastName: 'García',
    enableMarketing: true,
    enableUsePersonalData: false,
    userModifiedId: 1,
    dateModified: new Date().toISOString()
  }
  
  await updateEmployee(updateData)
}

// Eliminar un empleado
const handleDeleteEmployee = async (email: string) => {
  await deleteEmployee(email, 1) // userModifiedId = 1
}
</script>

<template>
  <div>
    <!-- Estado de carga -->
    <div v-if="loading">Cargando empleados...</div>
    
    <!-- Error -->
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
    
    <!-- Lista de empleados -->
    <div v-if="hasEmployees">
      <h3>Empleados ({{ employeesCount }})</h3>
      <div v-for="employee in employees" :key="employee.id">
        <h4>{{ employee.name }} {{ employee.paternalLastName }}</h4>
        <p>{{ employee.email }}</p>
        <button @click="handleUpdateEmployee(employee.id)">Editar</button>
        <button @click="handleDeleteEmployee(employee.email)">Eliminar</button>
      </div>
    </div>
    
    <!-- Botón para crear -->
    <button @click="handleCreateEmployee" :disabled="isCreating">
      {{ isCreating ? 'Creando...' : 'Crear Empleado' }}
    </button>
  </div>
</template>
```

### **Uso con Composable Directo de la API**

```vue
<script setup lang="ts">
import { useApiEmployee } from '@/lib/api'
import type { CreateEmployeeRequest } from '@/lib/api/types/employee'

const {
  employees,
  currentEmployee,
  loading,
  error,
  hasEmployees,
  employeesCount,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByEmail,
  updateEmployee,
  deleteEmployee,
  clear,
  refresh
} = useApiEmployee()

// Cargar empleados
onMounted(async () => {
  await getAllEmployees()
})

// Obtener empleado específico
const loadEmployee = async (id: number) => {
  await getEmployeeById(id)
  // currentEmployee.value contendrá los datos
}
</script>
```

### **Uso Directo del Servicio**

```typescript
import { employeeService } from '@/lib/api'
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/lib/api/types/employee'

// Crear empleado
const createEmployee = async () => {
  const data: CreateEmployeeRequest = {
    userName: 'maria.garcia',
    email: 'maria.garcia@empresa.com',
    password: 'password123',
    name: 'María',
    paternalLastName: 'García',
    maternalLastName: 'López',
    userModifiedId: 1
  }
  
  const newEmployee = await employeeService.createEmployee(data)
  console.log('Empleado creado:', newEmployee)
}

// Obtener todos los empleados
const getAllEmployees = async () => {
  const employees = await employeeService.getAllEmployees()
  console.log('Empleados:', employees)
}

// Obtener empleado por email
const getEmployeeByEmail = async (email: string) => {
  const employee = await employeeService.getEmployeeByEmail(email)
  console.log('Empleado:', employee)
}

// Actualizar empleado
const updateEmployee = async (id: number) => {
  const data: UpdateEmployeeRequest = {
    id,
    email: 'maria.garcia.nuevo@empresa.com',
    phoneNumber: '+52 55 9876 5432',
    userName: 'maria.garcia.nuevo',
    name: 'María Elena',
    paternalLastName: 'García',
    maternalLastName: 'López',
    enableMarketing: false,
    enableUsePersonalData: true,
    userModifiedId: 1,
    dateModified: new Date().toISOString()
  }
  
  const updatedEmployee = await employeeService.updateEmployee(data)
  console.log('Empleado actualizado:', updatedEmployee)
}

// Eliminar empleado
const deleteEmployee = async (email: string) => {
  const success = await employeeService.deleteEmployeeByEmail(email, 1)
  console.log('Empleado eliminado:', success)
}
```

## 🎯 **Tipos TypeScript**

### **Employee (Tipo Principal)**

```typescript
export interface Employee {
  id: number
  userName: string | null
  email: string | null
  phoneNumber: string | null
  name: string | null
  paternalLastName: string | null
  maternalLastName: string | null
  enableMarketing: boolean
  enableUsePersonalData: boolean
  userModifiedId: number
  dateCreated?: string
  dateModified?: string
  isActive?: boolean
}
```

### **Requests**

```typescript
// Crear empleado
export interface CreateEmployeeRequest {
  userName: string | null
  email: string | null
  password: string | null
  name: string | null
  paternalLastName: string | null
  maternalLastName: string | null
  userModifiedId: number
}

// Actualizar empleado
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

// Eliminar empleado
export interface DeleteEmployeeRequest {
  email: string | null
  userModifiedId: number
}
```

### **Responses**

```typescript
// Respuesta estándar de la API
export interface ApiResponse<T> {
  code: number
  isValid: boolean
  comments: string
  response: T
}

// Respuestas específicas
export type CreateEmployeeResponse = ApiResponse<Employee>
export type GetAllEmployeesResponse = ApiResponse<Employee[]>
export type GetEmployeeResponse = ApiResponse<Employee>
export type UpdateEmployeeResponse = ApiResponse<Employee>
export type DeleteEmployeeResponse = ApiResponse<boolean>
```

## 🔄 **Estados Reactivos**

### **Composable de Alto Nivel**

```typescript
const {
  // Estados reactivos
  employees,           // Ref<Employee[]> - Lista de empleados
  loading,            // Ref<boolean> - Estado de carga general
  error,              // Ref<Error | null> - Error actual
  isCreating,         // Ref<boolean> - Creando empleado
  isUpdating,         // Ref<boolean> - Actualizando empleado
  isDeleting,         // Ref<boolean> - Eliminando empleado
  
  // Computed properties
  hasEmployees,       // Computed<boolean> - Si hay empleados
  employeesCount,     // Computed<number> - Cantidad de empleados
  
  // Métodos
  createEmployee,     // Función para crear
  getAllEmployees,    // Función para obtener todos
  getEmployeeById,    // Función para obtener por ID
  getEmployeeByEmail, // Función para obtener por email
  updateEmployee,     // Función para actualizar
  deleteEmployee,     // Función para eliminar
  clear,              // Función para limpiar estados
  refresh             // Función para recargar
} = useEmployees()
```

### **Composable Directo de la API**

```typescript
const {
  // Estados reactivos
  employees,           // Ref<Employee[]> - Lista de empleados
  currentEmployee,     // Ref<Employee | null> - Empleado actual
  loading,            // Ref<boolean> - Estado de carga
  error,              // Ref<Error | null> - Error actual
  
  // Computed properties
  hasEmployees,       // Computed<boolean> - Si hay empleados
  employeesCount,     // Computed<number> - Cantidad de empleados
  
  // Métodos (mismos que el composable de alto nivel)
} = useApiEmployee()
```

## 🛠️ **Manejo de Errores**

El servicio incluye manejo robusto de errores:

```typescript
try {
  await createEmployee(employeeData)
  // Éxito - Toast de confirmación automático
} catch (err) {
  // Error - Toast de error automático con mensaje específico
  console.error('Error al crear empleado:', err)
}
```

### **Tipos de Errores Comunes**

- **400 Bad Request**: Datos inválidos en el request
- **401 Unauthorized**: Token de autenticación inválido o expirado
- **404 Not Found**: Empleado no encontrado
- **409 Conflict**: Email ya existe en el sistema
- **500 Internal Server Error**: Error interno del servidor

## 📝 **Notas Importantes**

1. **Autenticación**: Todas las peticiones incluyen automáticamente el token Bearer
2. **Validación**: Los campos requeridos deben ser validados antes de enviar
3. **userModifiedId**: Debe ser el ID del usuario autenticado que realiza la operación
4. **dateModified**: Debe ser la fecha actual en formato ISO string para actualizaciones
5. **Eliminación**: La eliminación se realiza por email, no por ID
6. **Filtros**: Los filtros en getAllEmployees son opcionales

## 🔗 **Integración con Otros Servicios**

El servicio de Employee se integra perfectamente con otros servicios del sistema:

```typescript
// Ejemplo: Crear empleado y asignar rol
import { useEmployees } from '@/composables/useEmployees'
import { useRoles } from '@/composables/useRoles'

const { createEmployee } = useEmployees()
const { addUserToRole } = useRoles()

const createEmployeeWithRole = async (employeeData: CreateEmployeeRequest, roleId: number) => {
  const newEmployee = await createEmployee(employeeData)
  await addUserToRole(newEmployee.id, roleId)
  return newEmployee
}
```

## 🎨 **Ejemplo Completo**

Ver el archivo `components/examples/EmployeeExample.vue` para un ejemplo completo de implementación con formularios, listado, edición y eliminación de empleados.
