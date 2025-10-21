# Reglas Específicas de Cupo

Este documento describe el componente `CreateSpecificQuotaRule` que permite crear reglas específicas de cupos para fechas y horarios determinados.

## Características

El componente incluye las siguientes funcionalidades:

### 1. Configuración de Fechas
- **Checkbox para rango de fechas**: Permite elegir entre una fecha específica o un rango de fechas
- **Fecha única**: Input de fecha cuando no se selecciona el rango
- **Rango de fechas**: Inputs de fecha de inicio y fin cuando se selecciona el rango
- **Validación**: Las fechas no pueden ser anteriores a la fecha actual

### 2. Configuración de Horarios
- **Checkbox para todos los horarios**: Permite aplicar la regla a todos los horarios disponibles
- **Selector de horarios específicos**: Lista de checkboxes para seleccionar horarios específicos
- **Horarios disponibles**: 10:00 AM a 5:00 PM (8 horarios en total)

### 3. Configuración de Cupos
- **Cupo máximo**: Campo numérico para definir el cupo máximo (mínimo 1)
- **Sobrecupo**: Campo numérico opcional para definir el sobrecupo (mínimo 0)

### 4. Mensajes
- **Mensaje para usuarios**: Textarea para mensaje que verán los usuarios
- **Mensaje para administradores**: Textarea para mensaje interno del personal administrativo

## Uso Básico

```vue
<template>
    <CreateSpecificQuotaRule 
        :isOpen="showDialog"
        @update:isOpen="showDialog = $event"
        @rule-created="handleRuleCreated" />
</template>

<script setup>
import CreateSpecificQuotaRule from '@/components/admin/cupos/CreateSpecificQuotaRule.vue';

const showDialog = ref(false);

const handleRuleCreated = (rule) => {
    console.log('Nueva regla creada:', rule);
    // Aquí puedes manejar la regla creada
};
</script>
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `isOpen` | `boolean` | Sí | Controla si el diálogo está abierto |

## Events

| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:isOpen` | `boolean` | Emitido cuando cambia el estado del diálogo |
| `rule-created` | `object` | Emitido cuando se crea una nueva regla |

## Estructura de la Regla Creada

```typescript
interface QuotaRule {
    id: number;
    dateRange: boolean;
    dates: {
        single?: string;    // Fecha única (YYYY-MM-DD)
        start?: string;     // Fecha de inicio (YYYY-MM-DD)
        end?: string;       // Fecha de fin (YYYY-MM-DD)
    };
    applyAllHours: boolean;
    selectedHours: number[];  // Array de horas (10-17)
    quota: number;           // Cupo máximo
    overQuota: number;       // Sobrecupo
    userMessage: string;     // Mensaje para usuarios
    adminMessage: string;    // Mensaje para administradores
    createdAt: string;       // Fecha de creación (ISO)
    enabled: boolean;        // Estado de la regla
}
```

## Validaciones

El componente incluye las siguientes validaciones:

1. **Fechas**:
   - Fecha única o rango de fechas es requerido
   - Las fechas no pueden ser anteriores a hoy
   - En rango, la fecha de inicio no puede ser mayor a la fecha de fin

2. **Horarios**:
   - Debe seleccionar al menos un horario si no se aplica a todos

3. **Cupos**:
   - El cupo máximo debe ser mayor a 0
   - El sobrecupo no puede ser negativo

## Integración con QuotaRulesDialog

El componente se integra con `QuotaRulesDialog.vue` para mostrar una lista de reglas específicas:

```vue
<template>
    <section class="border-t pt-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Reglas Específicas de Cupo</h3>
            <Button @click="showCreateRuleDialog = true" variant="outline" size="sm">
                <Plus class="w-4 h-4 mr-2" />
                Crear Nueva Regla
            </Button>
        </div>
        
        <!-- Lista de reglas existentes -->
        <div v-if="specificRules.length > 0" class="space-y-3">
            <!-- ... contenido de las reglas ... -->
        </div>
    </section>
</template>
```

## Ejemplo Completo

Puedes ver un ejemplo completo en `/pages/examples/specific-quota-rules.vue` que muestra:

- Cómo usar el componente
- Cómo manejar las reglas creadas
- Cómo mostrar una lista de reglas
- Cómo eliminar reglas

## Estilos

El componente utiliza las clases de Tailwind CSS y sigue el diseño del sistema de componentes UI existente. Incluye:

- Animaciones suaves con `v-auto-animate`
- Estados de carga y error
- Validación visual con mensajes de error
- Diseño responsivo

## Consideraciones de API

Para integrar completamente con el backend, necesitarás:

1. **Crear regla**: POST `/api/quota-rules`
2. **Actualizar regla**: PUT `/api/quota-rules/:id`
3. **Eliminar regla**: DELETE `/api/quota-rules/:id`
4. **Listar reglas**: GET `/api/quota-rules`

El componente actualmente simula las llamadas a la API con `setTimeout`. Reemplaza estas simulaciones con las llamadas reales a tu API. 