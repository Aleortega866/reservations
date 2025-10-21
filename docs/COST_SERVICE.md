# Servicio de Costos - Documentación Completa

## 📋 **Descripción General**

El servicio de costos proporciona una interfaz completa para gestionar costos y precios de tickets en el sistema MIDEReservaciones. Incluye operaciones CRUD completas y gestión específica de precios de tickets.

## 🚀 **Características Principales**

- ✅ **Operaciones CRUD completas** para costos
- ✅ **Gestión de precios de tickets** por tipo de visitante
- ✅ **Estados reactivos** automáticos
- ✅ **Integración con autenticación** automática
- ✅ **Manejo de errores** mejorado
- ✅ **Tipos TypeScript** completos
- ✅ **Composables reactivos** para Vue 3

## 📁 **Estructura del Servicio**

```
lib/api/services/cost/
├── cost.service.ts    # Servicio principal con clase y composables
└── index.ts          # Exportaciones del módulo

lib/api/composables/
└── costs.ts          # Composable con integración de autenticación

lib/api/types.ts      # Tipos TypeScript para costos
```

## 🔧 **Configuración de Endpoints**

Los endpoints están configurados en `lib/api/core/config.ts`:

```typescript
export const API_ENDPOINTS = {
  cost: {
    create: '/api/Cost/CreateCostAsync',
    getAll: '/api/Cost/GetAllCostsAsync',
    getById: '/api/Cost/GetCostAsync',
    update: '/api/Cost/UpdateCostAsync',
    archive: '/api/Cost/ArchiveCostsAsync',
    delete: '/api/Cost/DeleteCostAsync',
    updateTicketPrice: '/api/Cost/UpdateTicketPriceAsync',
    getAllTicketPrices: '/api/Cost/GetAllTicketPricesAsync'
  }
}
```

## 📖 **Tipos TypeScript**

### **Entidades Principales**

```typescript
// Costo
export interface Cost {
  id: number
  cost: string | null
  amount: number
  effectiveDate: string // RFC 3339 format
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isArchived?: boolean
}

// Precio de Ticket
export interface TicketPrice {
  id: number
  visitorType: number
  price: number
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}
```

### **Requests**

```typescript
// Crear costo
export interface CreateCostRequest {
  cost: string | null
  amount: number
  effectiveDate: string
  userModifiedId: number
}

// Actualizar costo
export interface UpdateCostRequest {
  id: number
  cost: string | null
  amount: number
  effectiveDate: string
  userModifiedId: number
}

// Actualizar precio de ticket
export interface UpdateTicketPriceRequest {
  id: number
  visitorType: number
  price: number
  userModifiedId: number
}
```

## 🎯 **Uso Básico**

### **Importar el Servicio**

```typescript
// Importar composable con autenticación automática
import { useApiCosts } from '@/lib/api'

// Importar servicio directo
import { costService } from '@/lib/api'

// Importar tipos
import type { Cost, CreateCostRequest, TicketPrice } from '@/lib/api'
```

### **Uso con Composable (Recomendado)**

```vue
<script setup lang="ts">
import { useApiCosts } from '@/lib/api'
import type { Cost, CreateCostRequest } from '@/lib/api'

const {
  costs,
  ticketPrices,
  loading,
  error,
  getAllCosts,
  createCost,
  updateCost,
  archiveCost,
  deleteCost,
  getAllTicketPrices,
  updateTicketPrice
} = useApiCosts()

// Cargar datos al montar el componente
onMounted(async () => {
  await Promise.all([
    getAllCosts(),
    getAllTicketPrices()
  ])
})

// Crear un nuevo costo
const handleCreateCost = async () => {
  try {
    const newCost: Omit<CreateCostRequest, 'userModifiedId'> = {
      cost: 'Entrada general',
      amount: 25.50,
      effectiveDate: new Date().toISOString()
    }
    
    await createCost(newCost)
    console.log('Costo creado exitosamente')
  } catch (err) {
    console.error('Error creando costo:', err)
  }
}

// Actualizar precio de ticket
const handleUpdateTicketPrice = async () => {
  try {
    await updateTicketPrice({
      id: 1,
      visitorType: 2, // Estudiante
      price: 15.00
    })
    console.log('Precio actualizado exitosamente')
  } catch (err) {
    console.error('Error actualizando precio:', err)
  }
}
</script>

<template>
  <div>
    <!-- Estados de carga y error -->
    <div v-if="loading">Cargando...</div>
    <div v-if="error" class="error">{{ error.message }}</div>

    <!-- Lista de costos -->
    <div v-if="costs.length > 0">
      <h3>Costos Registrados</h3>
      <div v-for="cost in costs" :key="cost.id">
        <p>{{ cost.cost }}: ${{ cost.amount }}</p>
      </div>
    </div>

    <!-- Lista de precios de tickets -->
    <div v-if="ticketPrices.length > 0">
      <h3>Precios de Tickets</h3>
      <div v-for="ticket in ticketPrices" :key="`${ticket.id}-${ticket.visitorType}`">
        <p>Tipo {{ ticket.visitorType }}: ${{ ticket.price }}</p>
      </div>
    </div>
  </div>
</template>
```

### **Uso Directo del Servicio**

```typescript
import { costService } from '@/lib/api'

// Operaciones de costos
const costs = await costService.getAllCosts()
const cost = await costService.getCostById(1)
const newCost = await costService.createCost({
  cost: 'Entrada VIP',
  amount: 50.00,
  effectiveDate: new Date().toISOString(),
  userModifiedId: 1
})

// Operaciones de precios de tickets
const ticketPrices = await costService.getAllTicketPrices()
const updatedPrice = await costService.updateTicketPrice({
  id: 1,
  visitorType: 1,
  price: 30.00,
  userModifiedId: 1
})
```

## 🔄 **Operaciones Disponibles**

### **Costos**

| Operación | Método | Endpoint | Descripción |
|-----------|--------|----------|-------------|
| `getAllCosts()` | GET | `/api/Cost/GetAllCostsAsync` | Obtener todos los costos |
| `getCostById(id)` | GET | `/api/Cost/GetCostAsync?id={id}` | Obtener costo por ID |
| `createCost(request)` | POST | `/api/Cost/CreateCostAsync` | Crear nuevo costo |
| `updateCost(request)` | PUT | `/api/Cost/UpdateCostAsync` | Actualizar costo |
| `archiveCost(request)` | PUT | `/api/Cost/ArchiveCostsAsync` | Archivar costo (soft delete) |
| `deleteCost(request)` | DELETE | `/api/Cost/DeleteCostAsync` | Eliminar costo permanentemente |

### **Precios de Tickets**

| Operación | Método | Endpoint | Descripción |
|-----------|--------|----------|-------------|
| `getAllTicketPrices()` | GET | `/api/Cost/GetAllTicketPricesAsync` | Obtener todos los precios |
| `getTicketPriceById(id, visitorType)` | GET | `/api/Cost/GetAllTicketPricesAsync?id={id}&visitorType={type}` | Obtener precio específico |
| `updateTicketPrice(request)` | PUT | `/api/Cost/UpdateTicketPriceAsync` | Actualizar precio de ticket |

## 🛡️ **Características de Seguridad**

### **Autenticación Automática**

- ✅ **Token Bearer automático** en todas las peticiones
- ✅ **userModifiedId automático** desde el usuario autenticado
- ✅ **Validación de autenticación** antes de operaciones de escritura

### **Manejo de Errores**

```typescript
try {
  await createCost(costData)
} catch (error) {
  // El error incluye el mensaje específico de la API
  console.error('Error:', error.message)
  
  // Manejo específico por tipo de error
  if (error.message.includes('401')) {
    // Token expirado
  } else if (error.message.includes('400')) {
    // Datos inválidos
  }
}
```

## 📊 **Estados Reactivos**

El composable `useApiCosts()` proporciona estados reactivos automáticos:

```typescript
const {
  costs,        // Cost[] - Lista de costos
  ticketPrices, // TicketPrice[] - Lista de precios de tickets
  loading,      // boolean - Estado de carga
  error         // Error | null - Error si ocurre
} = useApiCosts()
```

## 🎨 **Ejemplo Completo**

Ver el archivo `examples/CostServiceExample.vue` para un ejemplo completo de implementación con:

- ✅ Formularios de creación/edición
- ✅ Listas con acciones (editar, archivar, eliminar)
- ✅ Gestión de precios de tickets
- ✅ Estados de carga y error
- ✅ Validaciones y confirmaciones

## 🔗 **Integración con Otros Servicios**

El servicio de costos se integra perfectamente con otros servicios del sistema:

```typescript
// Usar con catálogos para tipos de visitantes
import { catalogService } from '@/lib/api'

// Obtener tipos de visitantes desde catálogos
const visitorTypes = await catalogService.getAllCatalogsPublic({
  tableName: 'VisitorTypes'
})

// Usar con el sistema de autenticación
import { useAuth } from '@/lib/api'

const { user } = useAuth()
if (user.value?.permissions.includes('costs:write')) {
  // Usuario tiene permisos para gestionar costos
}
```

## 🚀 **Mejores Prácticas**

1. **Usar composables** para componentes Vue con estados reactivos
2. **Usar servicios directos** para operaciones programáticas
3. **Manejar errores** apropiadamente en cada operación
4. **Validar datos** antes de enviar a la API
5. **Usar tipos TypeScript** para mejor desarrollo
6. **Implementar confirmaciones** para operaciones destructivas

## 📝 **Notas Importantes**

- ✅ **RFC 3339**: Las fechas deben estar en formato RFC 3339
- ✅ **userModifiedId**: Se obtiene automáticamente del usuario autenticado
- ✅ **Soft Delete**: Usar `archiveCost()` en lugar de `deleteCost()` cuando sea posible
- ✅ **Reactividad**: Los estados se actualizan automáticamente después de operaciones
- ✅ **SSR Compatible**: Funciona en servidor y cliente

---

**¡El servicio de costos está listo para usar! 🎉** 