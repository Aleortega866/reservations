# Selección de Horarios en CreateSpecificQuotaRule

## Descripción

Se ha implementado una nueva funcionalidad en el componente `CreateSpecificQuotaRule` que permite seleccionar horarios específicos para aplicar reglas de cupo. Esta funcionalidad utiliza el endpoint `/api/Form/GetAllTimeSlotsAsync` para obtener los horarios disponibles del sistema.

## Características

### 1. Carga Automática de Horarios
- Los horarios se cargan automáticamente desde el API cuando se abre la sección de horarios
- Utiliza el endpoint: `GET /api/Form/GetAllTimeSlotsAsync`
- Respuesta esperada:
```json
{
  "code": 200,
  "isValid": true,
  "comments": "Consulta exitosa",
  "response": [
    {
      "id": 1,
      "time": "10:00"
    },
    {
      "id": 2,
      "time": "11:00"
    }
    // ... más horarios
  ]
}
```

### 2. Interfaz de Usuario
- **Checkbox "Aplicar todos los horarios"**: Permite seleccionar/deseleccionar todos los horarios de una vez
- **Checkboxes individuales**: Cada horario tiene su propio checkbox para selección individual
- **Estados de carga**: Muestra indicadores de carga, error y estados vacíos
- **Animaciones**: Transiciones suaves al expandir/contraer la sección

### 3. Composable useTimeSlots
Se ha creado un composable reutilizable que maneja toda la lógica de horarios:

```typescript
import { useTimeSlots } from '@/composables/useTimeSlots'

const {
  timeSlots,           // Lista de horarios disponibles
  selectedTimeSlots,   // IDs de horarios seleccionados
  selectAllTimeSlots,  // Estado del checkbox "seleccionar todos"
  loading,            // Estado de carga
  error,              // Mensaje de error
  loadTimeSlots,      // Función para cargar horarios
  toggleSelectAll,    // Función para seleccionar todos
  toggleTimeSlot,     // Función para seleccionar un horario
  isTimeSlotSelected  // Función para verificar si está seleccionado
} = useTimeSlots()
```

## Implementación

### 1. Servicio API
El servicio ya está integrado en `lib/api/services/form/form.service.ts`:

```typescript
async getAllTimeSlots(): Promise<TimeSlot[]> {
  const { execute } = useApiFetch<TimeSlotsResponse>(
    API_ENDPOINTS.form.getAllTimeSlots, 
    { immediate: false }
  )
  
  const result = await execute()
  return result.response || []
}
```

### 2. Componente Modificado
El componente `CreateSpecificQuotaRule.vue` ha sido actualizado para incluir:

- Nueva sección de horarios con checkboxes
- Integración con el composable `useTimeSlots`
- Carga automática de horarios al abrir la sección
- Inclusión de horarios seleccionados en los datos de la regla

### 3. Datos de la Regla
Los datos emitidos por el evento `create-quota-rule` ahora incluyen:

```typescript
interface CreatedRule {
  date: Date
  endDate?: Date
  isDateRange: boolean
  additionalQuota: number
  overQuota: number
  adminMessage: string
  adminStaffMessage: string
  selectedTimeSlots: number[]  // Nuevo campo
}
```

## Uso

### 1. Uso Básico
```vue
<template>
  <CreateSpecificQuotaRule
    v-model="selectedFormularios"
    label="Crear Regla de Cupo"
    :cupo-options="cupoOptions"
    :on-toggle-enable="handleToggleEnable"
    @create-quota-rule="handleCreateQuotaRule"
  />
</template>

<script setup>
const handleCreateQuotaRule = (ruleData) => {
  console.log('Horarios seleccionados:', ruleData.selectedTimeSlots)
  // Procesar la regla con los horarios seleccionados
}
</script>
```

### 2. Ejemplo Completo
Ver el archivo `pages/examples/time-slots.vue` para un ejemplo completo de implementación.

## Flujo de Usuario

1. **Abrir la sección**: El usuario hace clic en "Horarios Disponibles"
2. **Carga automática**: Los horarios se cargan desde el API
3. **Selección**: El usuario puede:
   - Usar "Aplicar todos los horarios" para seleccionar todos
   - Seleccionar horarios individuales con checkboxes
4. **Crear regla**: Al crear la regla, los horarios seleccionados se incluyen en los datos

## Estados de la Interfaz

- **Cargando**: "Cargando horarios..."
- **Error**: Muestra el mensaje de error en rojo
- **Vacío**: "No hay horarios disponibles"
- **Con datos**: Lista de horarios con checkboxes

## Consideraciones Técnicas

- **Lazy Loading**: Los horarios solo se cargan cuando se abre la sección
- **Caching**: Los horarios se mantienen en memoria una vez cargados
- **Error Handling**: Manejo robusto de errores de red
- **Responsive**: Interfaz adaptada para diferentes tamaños de pantalla
- **Accesibilidad**: Checkboxes con labels apropiados

## Próximos Pasos

1. **Validación**: Agregar validación para asegurar que al menos un horario esté seleccionado
2. **Persistencia**: Guardar las selecciones en localStorage para persistencia
3. **Filtros**: Agregar filtros por rango de horarios
4. **Búsqueda**: Implementar búsqueda de horarios específicos
