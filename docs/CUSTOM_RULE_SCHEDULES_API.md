# API: Horarios de Reglas Personalizadas por Fecha

Este documento describe el endpoint para obtener los horarios de reglas personalizadas por fecha.

## Endpoint

```
GET /api/Form/GetCustomRuleSchedulesByDateAsync
```

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `SearchDate` | `string` | Sí | Fecha en formato YYYY-MM-DD |

## Ejemplo de Request

```
GET /api/Form/GetCustomRuleSchedulesByDateAsync?SearchDate=2025-12-31
```

## Respuesta

### Estructura de Respuesta

```typescript
interface GetCustomRuleSchedulesByDateResponse {
  code: number
  isValid: boolean
  comments: string
  response: CustomRuleSchedule[]
  token: string
}
```

### Estructura de CustomRuleSchedule

```typescript
interface CustomRuleSchedule {
  id: number
  time: string
  slot: number
  enable: boolean
  overSlot: number
  customRuleId: number
  timeSlotId: number
}
```

### Ejemplo de Respuesta Exitosa

```json
{
  "code": 200,
  "isValid": true,
  "comments": "Horarios de reglas personalizadas obtenidos exitosamente",
  "response": [
    {
      "id": 1,
      "time": "10:00",
      "slot": 50,
      "enable": true,
      "overSlot": 10,
      "customRuleId": 1,
      "timeSlotId": 1
    },
    {
      "id": 2,
      "time": "11:00",
      "slot": 40,
      "enable": true,
      "overSlot": 5,
      "customRuleId": 1,
      "timeSlotId": 2
    }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Ejemplo de Respuesta sin Datos

```json
{
  "code": 200,
  "isValid": true,
  "comments": "No se encontraron horarios de reglas personalizadas para la fecha especificada",
  "response": [],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Fecha inválida o parámetro SearchDate faltante |
| 401 | No autorizado |
| 500 | Error interno del servidor |

## Uso en el Frontend

### Composable useCustomRules

```typescript
import { useCustomRules } from '@/composables/useCustomRules'

const {
  customRuleSchedules,
  customRuleScheduleOptions,
  loading,
  error,
  loadCustomRuleSchedulesByDate,
  getCustomRuleSchedulesByDate
} = useCustomRules()

// Cargar horarios para una fecha específica
await loadCustomRuleSchedulesByDate('2025-12-31')

// Obtener horarios sin cargar al estado
const schedules = await getCustomRuleSchedulesByDate('2025-12-31')
```

### Servicio FormService

```typescript
import { formService } from '@/lib/api/services/form/form.service'

// Obtener horarios de reglas personalizadas
const schedules = await formService.getCustomRuleSchedulesByDate('2025-12-31')
```

## Integración con Componentes

### QuotaRulesDay.vue

El componente `QuotaRulesDay.vue` integra automáticamente este endpoint:

1. Cuando el usuario selecciona una fecha en el calendario
2. Se llama automáticamente a `loadCustomRulesByDate()`
3. Los horarios se cargan y se muestran en el componente
4. Si no hay horarios, se muestra un mensaje indicando que no hay datos

### Ejemplo de Uso

```vue
<template>
  <QuotaRulesDay 
    label="Consultar cupo específico por día"
    :cupo-options="customRuleScheduleOptions"
    @consult-quota="handleConsultQuota"
  />
</template>

<script setup>
import { useCustomRules } from '@/composables/useCustomRules'

const { customRuleScheduleOptions } = useCustomRules()
</script>
```

## Diferencias con otros Endpoints

### vs GetCustomRuleByDateAsync

- **GetCustomRuleByDateAsync**: Obtiene las reglas personalizadas (configuración)
- **GetCustomRuleSchedulesByDateAsync**: Obtiene los horarios específicos de esas reglas

### vs GetAllSchedulesByDayAsync

- **GetAllSchedulesByDayAsync**: Obtiene horarios generales por día de la semana
- **GetCustomRuleSchedulesByDateAsync**: Obtiene horarios específicos de reglas personalizadas por fecha

## Casos de Uso

1. **Consultar cupos específicos**: Cuando un administrador quiere ver los horarios y cupos configurados para una fecha específica
2. **Validación de disponibilidad**: Para verificar si hay reglas especiales que afecten la disponibilidad
3. **Gestión de reglas**: Para mostrar y editar los horarios de reglas personalizadas existentes

## Notas de Implementación

- El endpoint devuelve un array vacío cuando no hay horarios para la fecha especificada
- Los horarios están vinculados a reglas personalizadas específicas
- Cada horario incluye información sobre cupo, sobrecupo y estado de habilitación
- El endpoint es compatible con el sistema de autenticación existente 