# Componente QuotaRulesDay

Este documento describe el componente `QuotaRulesDay.vue` que permite consultar cupos específicos por día mediante un calendario interactivo.

## Funcionalidades

### 1. Selección de Fecha
- Calendario interactivo con VCalendar
- Resaltado de días disponibles y pasados
- Selección de fecha con formato YYYY-MM-DD

### 2. Carga Automática de Horarios
- Cuando se selecciona una fecha, automáticamente se envía al servicio
- Carga los horarios disponibles para esa fecha específica
- Muestra estados de carga, error y sin datos

### 3. Visualización de Horarios
- Lista de horarios con información de cupo y sobrecupo
- Switches para habilitar/deshabilitar horarios
- Indicadores visuales del estado de cada horario

## Estructura de Datos

### TimeSlot Interface
```typescript
interface TimeSlot {
  customRuleTimeSlotId: number
  timeSlotId: number
  time: string
  enable: boolean
  slot: number
  overSlot: number
}
```

### Props del Componente
```typescript
interface Props {
  modelValue: number[] | number
  label: string
  placeholder?: string
  cupoOptions: readonly Formulario[]
  autoOpen?: boolean
  multiple?: boolean
  onToggleEnable?: (id: number) => Promise<void>
}
```

## Uso del Componente

### Uso Básico
```vue
<template>
  <QuotaRulesDay 
    label="Consultar cupo específico por día"
    :cupo-options="[]"
    @consult-quota="handleConsultQuota"
    @create-rule="handleCreateRule"
  />
</template>

<script setup>
const handleConsultQuota = () => {
  console.log('Consultando cupo...')
}

const handleCreateRule = () => {
  console.log('Creando regla...')
}
</script>
```

## Flujo de Funcionamiento

### 1. Inicialización
1. El componente se renderiza con el calendario
2. Se muestran los días disponibles (futuros) y deshabilitados (pasados)
3. El usuario puede expandir las opciones

### 2. Selección de Fecha
1. El usuario hace clic en "Fecha" para abrir el calendario
2. Selecciona una fecha del calendario
3. Se ejecuta `handleDateChange()` automáticamente

### 3. Carga de Datos
1. Se llama a `loadTimeSlotsForDate(dateString)`
2. Se hace la petición al API: `formService.getCustomRuleSchedulesByDate(dateString)`
3. Se procesa la respuesta y se convierte al formato `TimeSlot[]`
4. Se actualiza `availableTimeSlots.value`

### 4. Visualización
1. Se muestran los horarios cargados con:
   - Hora del horario
   - Cupo disponible
   - Sobrecupo
   - Switch de habilitación
2. Estados de carga y error se manejan apropiadamente

## API Integration

### Endpoint Utilizado
```
GET /api/Form/GetCustomRuleSchedulesByDateAsync?SearchDate=YYYY-MM-DD
```

### Respuesta Esperada
```json
{
  "code": 200,
  "isValid": true,
  "comments": "Consulta exitosa",
  "response": [
    {
      "id": 31,
      "timeSlotId": 1,
      "time": "10:00",
      "enable": true,
      "slot": 400,
      "overSlot": 50
    }
  ],
  "token": ""
}
```

## Estados del Componente

### Loading State
```vue
<div v-if="loading" class="p-3 bg-background border border-muted border-t-0">
  <div class="flex items-center justify-center space-x-2">
    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
    <span class="text-sm text-muted-foreground">Cargando horarios...</span>
  </div>
</div>
```

### Error State
```vue
<div v-else-if="error" class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
  <span class="text-sm text-destructive text-center block">
    Error: {{ error }}
  </span>
</div>
```

### Empty State
```vue
<div v-else-if="!loading && availableTimeSlots.length === 0" 
     class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
  <span class="text-sm text-muted-foreground text-center block">
    No hay horarios disponibles para esta fecha
  </span>
</div>
```

## Eventos Emitidos

### consult-quota
Se emite cuando el usuario hace clic en "Consultar cupo"

### create-rule
Se emite cuando el usuario hace clic en "Crear regla"

### update:modelValue
Se emite cuando cambia el valor del modelo

## Funciones Principales

### handleDateChange
```typescript
const handleDateChange = async (newDate: Date) => {
  currentDate.value = newDate
  
  if (newDate) {
    const dateString = newDate.toISOString().split('T')[0]
    await loadTimeSlotsForDate(dateString)
  }
}
```

### loadTimeSlotsForDate
```typescript
const loadTimeSlotsForDate = async (dateString: string) => {
  loading.value = true
  error.value = null
  availableTimeSlots.value = []
  
  try {
    const schedules = await formService.getCustomRuleSchedulesByDate(dateString)
    
    availableTimeSlots.value = schedules.map((schedule: CustomRuleSchedule) => ({
      customRuleTimeSlotId: schedule.id,
      timeSlotId: schedule.timeSlotId,
      time: schedule.time,
      enable: schedule.enable,
      slot: schedule.slot,
      overSlot: schedule.overSlot
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los horarios'
  } finally {
    loading.value = false
  }
}
```

## Dependencias

### Composable
- `useCustomRules`: Para manejo de reglas personalizadas

### Servicios
- `formService`: Para llamadas al API

### Componentes UI
- `Card`, `CardContent`: Para la estructura visual
- `Switch`: Para los toggles de habilitación
- `VCalendar`: Para el calendario interactivo

## Ejemplo de Uso Completo

```vue
<template>
  <div class="space-y-4">
    <h2>Consulta de Cupos por Día</h2>
    
    <QuotaRulesDay 
      label="Consultar cupo específico por día"
      :cupo-options="[]"
      @consult-quota="handleConsultQuota"
      @create-rule="handleCreateRule"
    />
    
    <!-- Información adicional -->
    <div v-if="selectedDate" class="mt-4">
      <p>Fecha seleccionada: {{ selectedDate }}</p>
      <p>Horarios cargados: {{ timeSlotsCount }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QuotaRulesDay from '@/components/admin/cupos/QuotaRulesDay.vue'

const selectedDate = ref('')
const timeSlotsCount = ref(0)

const handleConsultQuota = () => {
  console.log('Consultando cupo...')
}

const handleCreateRule = () => {
  console.log('Creando regla...')
}
</script>
```

## Notas de Implementación

1. **Manejo de Errores**: El componente maneja errores de red y los muestra al usuario
2. **Estados de Carga**: Se muestra un spinner durante la carga de datos
3. **Limpieza de Datos**: Los datos se limpian cuando se cierra el componente
4. **Responsive**: El componente es responsive y funciona en móviles
5. **Accesibilidad**: Incluye labels y estados apropiados para lectores de pantalla

## Testing

Para probar el componente:

1. Navega a `/examples/quota-rules-day`
2. Abre el componente QuotaRulesDay
3. Selecciona una fecha en el calendario
4. Verifica que se carguen los horarios
5. Prueba los switches de habilitación
6. Verifica los estados de error y carga

## Troubleshooting

### Problemas Comunes

1. **No se cargan los horarios**: Verifica que el API esté funcionando
2. **Error de red**: Revisa la consola para errores de CORS o autenticación
3. **Calendario no se abre**: Verifica que VCalendar esté instalado correctamente
4. **Switches no funcionan**: Implementa la función `onToggleEnable` en el componente padre 