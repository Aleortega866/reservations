# Servicio de Visitor - Documentación Completa

## 📋 **Descripción General**

El servicio de visitor proporciona una interfaz completa para gestionar visitantes y sus compañías en el sistema MIDEReservaciones. Incluye operaciones CRUD completas para visitantes y gestión específica de compañías de visitantes.

## 🚀 **Características Principales**

- ✅ **Operaciones CRUD completas** para visitantes
- ✅ **Gestión de compañías de visitantes** con endpoints específicos
- ✅ **Estados reactivos** automáticos
- ✅ **Integración con autenticación** automática
- ✅ **Manejo de errores** mejorado
- ✅ **Tipos TypeScript** completos
- ✅ **Composables reactivos** para Vue 3

## 📁 **Estructura del Servicio**

```
lib/api/services/visitor/
├── visitor.service.ts    # Servicio principal con clase y composables
└── index.ts             # Exportaciones del módulo

lib/api/composables/
└── visitor.ts           # Composable con integración de autenticación

lib/api/types/visitor/
└── index.ts            # Tipos TypeScript para visitor
```

## 🔧 **Configuración de Endpoints**

Los endpoints están configurados en `lib/api/core/config.ts`:

```typescript
export const API_ENDPOINTS = {
  visitor: {
    create: '/api/Visitor/CreateVisitorAsync',
    getAll: '/api/Visitor/GetAllVisitorsAsync',
    update: '/api/Visitor/UpdateVisitorAsync',
    delete: '/api/Visitor/DeleteVisitorAsync',
    createCompany: '/api/Visitor/CreateVisitorCompanyAsync',
    deleteCompany: '/api/Visitor/DeleteVisitorCompanyAsync'
  }
}
```

## 📖 **Tipos TypeScript**

### **Entidades Principales**

```typescript
// Visitante
export interface Visitor {
  id: number
  name: string
  email: string
  phone?: string
  userTypeId: number
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

// Compañía de Visitante
export interface VisitorCompany {
  id: number
  visitorId: number
  companyName: string | null
  industryTypeId: number
  postalCodeId: number
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}
```

### **Requests**

```typescript
// Crear visitante
export interface CreateVisitorRequest {
  name: string
  email: string
  phone?: string
  userTypeId: number
  userModifiedId: number
}

// Actualizar visitante
export interface UpdateVisitorRequest {
  id: number
  name: string
  email: string
  phone?: string
  userTypeId: number
  userModifiedId: number
}

// Crear compañía de visitante
export interface CreateVisitorCompanyRequest {
  visitorId: number
  companyName: string | null
  industryTypeId: number
  postalCodeId: number
  userModifiedId: number
}

// Eliminar compañía de visitante
export interface DeleteVisitorCompanyRequest {
  id: number
  userModifiedId: number
}
```

## 🎯 **Uso Básico**

### **Importar el Servicio**

```typescript
// Importar composable con autenticación automática
import { useApiVisitor } from '@/lib/api'

// Importar servicio directo
import { visitorService } from '@/lib/api'

// Importar tipos
import type { Visitor, CreateVisitorRequest, VisitorCompany } from '@/lib/api'
```

### **Uso con Composable (Recomendado)**

```vue
<script setup lang="ts">
import { useApiVisitor } from '@/lib/api'
import type { CreateVisitorRequest, CreateVisitorCompanyRequest } from '@/lib/api'

const {
  visitors,
  visitorCompanies,
  loading,
  error,
  getAllVisitors,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  createVisitorCompany,
  deleteVisitorCompany,
  getVisitorStats
} = useApiVisitor()

// Cargar datos al montar el componente
onMounted(async () => {
  await Promise.all([
    getAllVisitors(),
    getVisitorStats()
  ])
})

// Crear un nuevo visitante
const handleCreateVisitor = async () => {
  try {
    const newVisitor: Omit<CreateVisitorRequest, 'userModifiedId'> = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '555-1234',
      userTypeId: 1
    }
    
    await createVisitor(newVisitor)
    console.log('Visitante creado exitosamente')
  } catch (err) {
    console.error('Error creando visitante:', err)
  }
}

// Crear una compañía de visitante
const handleCreateVisitorCompany = async () => {
  try {
    const newCompany: Omit<CreateVisitorCompanyRequest, 'userModifiedId'> = {
      visitorId: 1,
      companyName: 'Empresa ABC',
      industryTypeId: 1,
      postalCodeId: 1
    }
    
    await createVisitorCompany(newCompany)
    console.log('Compañía creada exitosamente')
  } catch (err) {
    console.error('Error creando compañía:', err)
  }
}
</script>

<template>
  <div>
    <!-- Estados de carga y error -->
    <div v-if="loading">Cargando...</div>
    <div v-if="error" class="error">{{ error.message }}</div>

    <!-- Lista de visitantes -->
    <div v-if="visitors.length > 0">
      <h3>Visitantes Registrados</h3>
      <div v-for="visitor in visitors" :key="visitor.id">
        <p>{{ visitor.name }} - {{ visitor.email }}</p>
      </div>
    </div>

    <!-- Lista de compañías -->
    <div v-if="visitorCompanies.length > 0">
      <h3>Compañías de Visitantes</h3>
      <div v-for="company in visitorCompanies" :key="company.id">
        <p>{{ company.companyName }} - Visitante ID: {{ company.visitorId }}</p>
      </div>
    </div>
  </div>
</template>
```

### **Uso Directo del Servicio**

```typescript
import { visitorService } from '@/lib/api'

// Operaciones de visitantes
const visitors = await visitorService.getAllVisitors()
const visitor = await visitorService.getVisitorById(1)
const newVisitor = await visitorService.createVisitor({
  name: 'María García',
  email: 'maria@example.com',
  phone: '555-5678',
  userTypeId: 2,
  userModifiedId: 1
})

// Operaciones de compañías
const newCompany = await visitorService.createVisitorCompany({
  visitorId: 1,
  companyName: 'Tech Solutions',
  industryTypeId: 2,
  postalCodeId: 3,
  userModifiedId: 1
})

const deletedCompany = await visitorService.deleteVisitorCompany({
  id: 1,
  userModifiedId: 1
})
```

## 🔄 **Operaciones Disponibles**

### **Visitantes**

| Operación | Método | Endpoint | Descripción |
|-----------|--------|----------|-------------|
| `getAllVisitors(filters?)` | GET | `/api/Visitor/GetAllVisitorsAsync` | Obtener todos los visitantes |
| `getVisitorById(id)` | GET | `/api/Visitor/GetAllVisitorsAsync` | Obtener visitante por ID |
| `createVisitor(data)` | POST | `/api/Visitor/CreateVisitorAsync` | Crear nuevo visitante |
| `updateVisitor(data)` | PUT | `/api/Visitor/UpdateVisitorAsync` | Actualizar visitante |
| `deleteVisitor(id)` | DELETE | `/api/Visitor/DeleteVisitorAsync` | Eliminar visitante |
| `searchVisitors(query, filters?)` | GET | `/api/Visitor/GetAllVisitorsAsync` | Buscar visitantes |
| `getVisitorsByUserType(userTypeId)` | GET | `/api/Visitor/GetAllVisitorsAsync` | Filtrar por tipo de usuario |
| `getActiveVisitors()` | GET | `/api/Visitor/GetAllVisitorsAsync` | Obtener visitantes activos |

### **Compañías de Visitantes**

| Operación | Método | Endpoint | Descripción |
|-----------|--------|----------|-------------|
| `createVisitorCompany(data)` | POST | `/api/Visitor/CreateVisitorCompanyAsync` | Crear compañía de visitante |
| `deleteVisitorCompany(data)` | DELETE | `/api/Visitor/DeleteVisitorCompanyAsync` | Eliminar compañía de visitante |

### **Operaciones Auxiliares**

| Operación | Descripción |
|-----------|-------------|
| `isEmailRegistered(email)` | Verificar si un email ya está registrado |
| `getVisitorStats()` | Obtener estadísticas de visitantes |

## 🎨 **Estados Reactivos del Composable**

```typescript
const {
  // Estados reactivos
  visitors,           // Visitor[] - Lista de visitantes
  visitorCompanies,   // VisitorCompany[] - Lista de compañías
  currentVisitor,     // Visitor | null - Visitante actual
  loading,           // boolean - Estado de carga
  error,             // Error | null - Error si ocurre
  
  // Computed properties
  hasVisitors,       // boolean - Si hay visitantes
  activeVisitors,    // Visitor[] - Visitantes activos
  inactiveVisitors,  // Visitor[] - Visitantes inactivos
  
  // Operaciones CRUD
  getAllVisitors,    // (filters?) => Promise
  getVisitorById,    // (id) => Promise
  createVisitor,     // (data) => Promise
  updateVisitor,     // (data) => Promise
  deleteVisitor,     // (id) => Promise
  searchVisitors,    // (query, filters?) => Promise
  getVisitorsByUserType, // (userTypeId) => Promise
  getActiveVisitors, // () => Promise
  
  // Operaciones de compañías
  createVisitorCompany, // (data) => Promise
  deleteVisitorCompany, // (data) => Promise
  getVisitorCompanies,  // (visitorId) => Promise
  
  // Operaciones auxiliares
  isEmailRegistered, // (email) => Promise<boolean>
  getVisitorStats,   // () => Promise
  clearVisitors,     // () => void
  clearVisitorCompanies, // () => void
  clearError         // () => void
} = useApiVisitor()
```

## 🎨 **Ejemplo Completo**

Ver el archivo `examples/VisitorServiceExample.vue` para un ejemplo completo de implementación con:

- ✅ Formularios de creación/edición de visitantes
- ✅ Formularios de creación de compañías
- ✅ Listas con acciones (editar, eliminar)
- ✅ Búsqueda de visitantes
- ✅ Estadísticas en tiempo real
- ✅ Estados de carga y error
- ✅ Validaciones y confirmaciones

## 🔗 **Integración con Otros Servicios**

El servicio de visitor se integra perfectamente con otros servicios del sistema:

```typescript
// Usar con catálogos para tipos de usuario
import { catalogService } from '@/lib/api'

// Obtener tipos de usuario desde catálogos
const userTypes = await catalogService.getAllCatalogsPublic({
  tableName: 'UserType'
})

// Usar con el sistema de autenticación
import { useAuth } from '@/lib/api'

const { user } = useAuth()
if (user.value?.permissions.includes('visitors:write')) {
  // Usuario tiene permisos para gestionar visitantes
}
```

## 🚀 **Mejores Prácticas**

1. **Usar composables** para componentes Vue con estados reactivos
2. **Usar servicios directos** para operaciones programáticas
3. **Manejar errores** apropiadamente en cada operación
4. **Validar datos** antes de enviar a la API
5. **Usar tipos TypeScript** para mejor desarrollo
6. **Implementar confirmaciones** para operaciones destructivas
7. **Verificar emails duplicados** antes de crear visitantes

## 📝 **Notas Importantes**

- ✅ **userModifiedId**: Se obtiene automáticamente del usuario autenticado
- ✅ **Reactividad**: Los estados se actualizan automáticamente después de operaciones
- ✅ **SSR Compatible**: Funciona en servidor y cliente
- ✅ **Validación de Email**: Incluye función para verificar emails duplicados
- ✅ **Estadísticas**: Proporciona estadísticas básicas de visitantes
- ✅ **Filtros**: Soporte completo para filtrado y búsqueda

## 🔧 **Endpoints Específicos**

### **CreateVisitorCompanyAsync**
```bash
POST /api/Visitor/CreateVisitorCompanyAsync
Content-Type: application/json

{
  "visitorId": 1,
  "companyName": "Empresa ABC",
  "industryTypeId": 1,
  "postalCodeId": 1,
  "userModifiedId": 1
}
```

### **DeleteVisitorCompanyAsync**
```bash
DELETE /api/Visitor/DeleteVisitorCompanyAsync
Content-Type: application/json

{
  "id": 1,
  "userModifiedId": 1
}
```

---

**¡El servicio de visitor está listo para usar! 🎉**
