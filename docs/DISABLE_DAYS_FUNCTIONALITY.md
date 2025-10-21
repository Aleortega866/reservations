# Funcionalidad de Días Deshabilitados en CalendarField

## Descripción

El componente `CalendarField.vue` ahora incluye una funcionalidad dinámica para deshabilitar días específicos de manera fácil y configurable.

## Props Disponibles

### `disabledWeekdays`
- **Tipo**: `number[]`
- **Descripción**: Array de días de la semana a deshabilitar
- **Valores**: 
  - `0` = Domingo
  - `1` = Lunes
  - `2` = Martes
  - `3` = Miércoles
  - `4` = Jueves
  - `5` = Viernes
  - `6` = Sábado

### `disabledDates`
- **Tipo**: `Date[]`
- **Descripción**: Array de fechas específicas a deshabilitar

### `isDateDisabled`
- **Tipo**: `(date: Date) => boolean`
- **Descripción**: Función personalizada para determinar si una fecha debe estar deshabilitada

## Ejemplos de Uso

### 1. Deshabilitar todos los lunes
```vue
<CalendarField
  v-model="selectedDate"
  label="Selecciona una fecha"
  :disabled-weekdays="[1]"
/>
```

### 2. Deshabilitar fines de semana
```vue
<CalendarField
  v-model="selectedDate"
  label="Selecciona una fecha"
  :disabled-weekdays="[0, 6]"
/>
```

### 3. Deshabilitar días laborales (solo fines de semana disponibles)
```vue
<CalendarField
  v-model="selectedDate"
  label="Selecciona una fecha"
  :disabled-weekdays="[1, 2, 3, 4, 5]"
/>
```

### 4. Deshabilitar fechas específicas
```vue
<CalendarField
  v-model="selectedDate"
  label="Selecciona una fecha"
  :disabled-dates="[
    new Date('2024-12-25'), // Navidad
    new Date('2024-01-01'), // Año Nuevo
    new Date('2024-05-01')  // Día del Trabajo
  ]"
/>
```

### 5. Combinar días de la semana y fechas específicas
```vue
<CalendarField
  v-model="selectedDate"
  label="Selecciona una fecha"
  :disabled-weekdays="[1]"  // Todos los lunes
  :disabled-dates="[
    new Date('2024-12-25'), // Navidad
    new Date('2024-01-01')  // Año Nuevo
  ]"
/>
```

### 6. Función personalizada
```vue
<template>
  <CalendarField
    v-model="selectedDate"
    label="Selecciona una fecha"
    :is-date-disabled="customDateValidator"
  />
</template>

<script setup>
const customDateValidator = (date) => {
  // Deshabilitar todos los días 15 de cada mes
  return date.getDate() === 15;
  
  // O deshabilitar fechas pasadas
  // return date < new Date();
  
  // O cualquier lógica personalizada
  // return date.getMonth() === 11; // Deshabilitar diciembre
};
</script>
```

### 7. Ejemplo avanzado con lógica compleja
```vue
<template>
  <CalendarField
    v-model="selectedDate"
    label="Selecciona una fecha"
    :is-date-disabled="advancedDateValidator"
  />
</template>

<script setup>
const advancedDateValidator = (date) => {
  const today = new Date();
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  
  // Deshabilitar fechas pasadas
  if (date < today) return true;
  
  // Deshabilitar lunes y viernes
  if ([1, 5].includes(dayOfWeek)) return true;
  
  // Deshabilitar el día 13 de cada mes
  if (dayOfMonth === 13) return true;
  
  // Deshabilitar diciembre completo
  if (date.getMonth() === 11) return true;
  
  return false;
};
</script>
```

## Características

- ✅ **Dinámico**: Se puede cambiar en tiempo de ejecución
- ✅ **Flexible**: Múltiples formas de configurar días deshabilitados
- ✅ **Combinable**: Se pueden usar múltiples métodos a la vez
- ✅ **Personalizable**: Función personalizada para lógica compleja
- ✅ **Fácil de usar**: Configuración simple con arrays

## Notas

- Los días deshabilitados aparecerán visualmente diferentes (opacidad reducida, cursor no permitido)
- No se pueden seleccionar días deshabilitados
- La función personalizada `isDateDisabled` tiene prioridad sobre las otras opciones
- Los arrays `disabledWeekdays` y `disabledDates` se pueden combinar
