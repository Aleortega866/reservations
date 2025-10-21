# Sistema de Códigos de Promoción

Este documento describe la implementación del sistema de códigos de promoción en la aplicación MIDEReservacionesFront.

## Descripción General

El sistema de códigos de promoción permite crear, editar y eliminar códigos de descuento para boletos. Cada código tiene un precio específico, límite de uso y período de validez.

## Componentes Principales

### 1. Servicio de Promociones (`lib/api/services/promotion/promotion.service.ts`)

El servicio maneja todas las operaciones CRUD para promociones:

```typescript
// Crear nuevo código de promoción
const promotion = await promotionService.createLinkingCode({
  name: "DESCUENTO50",
  ticketPrice: 50.00,
  maxTickets: 100,
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-12-31T23:59:59Z",
  description: "Descuento del 50%",
  messageUser: "¡Aprovecha este descuento!",
  messageAdmin: "Código promocional válido",
  userModifiedId: 1
})
```

### 2. Composable (`composables/usePromotions.ts`)

Proporciona una interfaz reactiva para manejar promociones:

```typescript
const {
  promotions,
  isLoading,
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
} = usePromotions()
```

### 3. Modales de Creación y Edición

- **CreatePromotionCodeDialog.vue**: Modal para crear nuevos códigos
- **EditPromotionCodeDialog.vue**: Modal para editar códigos existentes

## Estructura de Datos

### CreateLinkingCodeRequest
```typescript
interface CreateLinkingCodeRequest {
  name: string | null
  ticketPrice: number
  maxTickets: number | null
  startDate: string
  endDate: string
  description: string | null
  messageUser: string | null
  messageAdmin: string | null
  userModifiedId: number
}
```

### Promotion
```typescript
interface Promotion {
  id: string
  name: string
  ticketPrice: number
  maxTickets: number
  currentTickets: number
  startDate: string
  endDate: string
  description: string
  messageUser: string
  messageAdmin: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

## Endpoints de API

### Crear Código de Vinculación
```
POST /api/Promotion/CreateLinkingCodeAsync
```

**Body:**
```json
{
  "name": "DESCUENTO50",
  "ticketPrice": 50.00,
  "maxTickets": 100,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "description": "Descuento del 50%",
  "messageUser": "¡Aprovecha este descuento!",
  "messageAdmin": "Código promocional válido",
  "userModifiedId": 1
}
```

### Obtener Todas las Promociones
```
GET /api/Promotion/GetAllPromotionsAsync
```

### Actualizar Promoción
```
PUT /api/Promotion/UpdatePromotionAsync
```

### Eliminar Promoción
```
DELETE /api/Promotion/DeletePromotionAsync
```

## Uso en Componentes

### Integración con PairingCodeList

El componente `PairingCodeList.vue` ha sido actualizado para soportar códigos de promoción:

```vue
<PairingCodeList
  v-model="selectedCodes"
  label="Códigos de Promoción"
  :options="promotionOptions"
  :auto-open="true"
  @promotion-created="handlePromotionCreated"
  @update-ticket="handleUpdateTicket"
  @add-ticket="handleAddTicket"
/>
```

### Página de Ejemplo

Ver `pages/examples/promotion-codes.vue` para un ejemplo completo de implementación.

## Funcionalidades

### ✅ Implementado
- [x] Crear códigos de promoción
- [x] Editar códigos existentes
- [x] Eliminar códigos
- [x] Validación de formularios
- [x] Integración con API
- [x] Manejo de errores
- [x] Notificaciones toast
- [x] Estados de carga

### 🔄 Pendiente
- [ ] Archivar promociones (en lugar de eliminar)
- [ ] Filtros por estado (activo/inactivo)
- [ ] Búsqueda de promociones
- [ ] Paginación para listas grandes
- [ ] Exportar códigos a CSV/PDF
- [ ] Estadísticas de uso

## Validaciones

### Formulario de Creación/Edición
- **Nombre**: Requerido, máximo 40 caracteres
- **Precio**: Requerido, número positivo
- **Máximo de boletos**: Opcional, número positivo
- **Fechas**: Requeridas, fecha de fin debe ser posterior a fecha de inicio
- **Descripción**: Opcional, máximo 200 caracteres
- **Mensajes**: Opcionales, máximo 200 caracteres cada uno

## Manejo de Errores

El sistema incluye manejo de errores robusto:

1. **Validación del lado del cliente**: Usando Zod schemas
2. **Validación del lado del servidor**: Captura de errores de API
3. **Notificaciones de usuario**: Toast messages para éxito/error
4. **Estados de carga**: Indicadores visuales durante operaciones

## Ejemplo de Uso Completo

```vue
<template>
  <div>
    <!-- Lista de códigos de promoción -->
    <PairingCodeList
      v-model="selectedCodes"
      label="Códigos de Promoción"
      :options="promotionOptions"
      @promotion-created="handlePromotionCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePromotions } from '@/composables/usePromotions'

const { promotions, fetchPromotions } = usePromotions()
const selectedCodes = ref<string[]>([])

onMounted(() => {
  fetchPromotions()
})

const promotionOptions = computed(() => {
  return promotions.value.map(promotion => ({
    value: promotion.id,
    label: promotion.name,
    price: promotion.ticketPrice.toString(),
    maxcupo: promotion.maxTickets?.toString() || 'Sin límite',
    currentcupo: promotion.currentTickets.toString()
  }))
})

const handlePromotionCreated = (promotion: any) => {
  console.log('Nueva promoción creada:', promotion)
  fetchPromotions() // Recargar lista
}
</script>
```

## Notas de Implementación

1. **Autenticación**: El `userModifiedId` debe obtenerse del usuario autenticado actual
2. **Fechas**: Las fechas se manejan en formato ISO 8601
3. **Precios**: Los precios se manejan como números decimales
4. **Límites**: Los límites de boletos son opcionales (null = sin límite)
5. **Estados**: Las promociones tienen un estado activo/inactivo

## Troubleshooting

### Error común: "No se pudo crear el código de promoción"
- Verificar que todos los campos requeridos estén completos
- Verificar que las fechas sean válidas
- Verificar la conexión con la API

### Error común: "Error de validación"
- Revisar que el nombre no exceda 40 caracteres
- Revisar que el precio sea un número válido
- Revisar que las fechas estén en el formato correcto 