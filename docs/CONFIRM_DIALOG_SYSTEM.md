# Sistema de Diálogos de Confirmación

Este documento describe el sistema de diálogos de confirmación reutilizable que reemplaza el `confirm()` nativo del navegador.

## Componentes

### ConfirmDialog.vue

Componente de diálogo reutilizable ubicado en `components/common/ConfirmDialog.vue`.

**Props:**
- `isOpen: boolean` - Controla si el diálogo está abierto
- `title?: string` - Título del diálogo (por defecto: "Confirmar acción")
- `message: string` - Mensaje de confirmación
- `confirmText?: string` - Texto del botón de confirmación (por defecto: "Confirmar")
- `cancelText?: string` - Texto del botón de cancelación (por defecto: "Cancelar")
- `confirmVariant?: string` - Variante del botón de confirmación (por defecto: "default")
- `loading?: boolean` - Estado de carga (por defecto: false)

**Events:**
- `confirm` - Emitido cuando se confirma la acción
- `cancel` - Emitido cuando se cancela la acción
- `close` - Emitido cuando se cierra el diálogo

### useConfirmDialog.ts

Composable ubicado en `composables/useConfirmDialog.ts` que maneja la lógica del diálogo.

**Funciones:**
- `showConfirm(options): Promise<boolean>` - Muestra el diálogo y retorna una promesa
- `handleConfirm()` - Maneja la confirmación
- `handleCancel()` - Maneja la cancelación
- `handleClose()` - Maneja el cierre
- `setLoading(loading: boolean)` - Controla el estado de carga

**Estado:**
- `dialogState` - Estado reactivo del diálogo

## Uso Básico

### 1. Importar el composable y componente

```vue
<script setup lang="ts">
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const confirmDialog = useConfirmDialog()
</script>
```

### 2. Agregar el componente al template

```vue
<template>
  <div>
    <!-- Tu contenido aquí -->
    
    <!-- Diálogo de confirmación -->
    <ConfirmDialog
      :is-open="confirmDialog.dialogState.value.isOpen"
      :title="confirmDialog.dialogState.value.title"
      :message="confirmDialog.dialogState.value.message"
      :confirm-text="confirmDialog.dialogState.value.confirmText"
      :cancel-text="confirmDialog.dialogState.value.cancelText"
      :confirm-variant="confirmDialog.dialogState.value.confirmVariant"
      :loading="confirmDialog.dialogState.value.loading"
      @confirm="confirmDialog.handleConfirm"
      @cancel="confirmDialog.handleCancel"
      @close="confirmDialog.handleClose"
    />
  </div>
</template>
```

### 3. Usar en funciones

```typescript
const handleDelete = async () => {
  const confirmed = await confirmDialog.showConfirm({
    title: 'Eliminar elemento',
    message: '¿Estás seguro de que quieres eliminar este elemento?',
    confirmText: 'Sí, eliminar',
    cancelText: 'Cancelar',
    confirmVariant: 'destructive'
  })

  if (confirmed) {
    // Realizar la acción
    await deleteItem()
  }
}
```

## Ejemplos de Uso

### Confirmación Básica

```typescript
const confirmed = await confirmDialog.showConfirm({
  message: '¿Estás seguro de que quieres realizar esta acción?'
})
```

### Confirmación Destructiva

```typescript
const confirmed = await confirmDialog.showConfirm({
  title: 'Eliminar elemento',
  message: 'Esta acción no se puede deshacer. ¿Estás seguro?',
  confirmText: 'Sí, eliminar',
  confirmVariant: 'destructive'
})
```

### Confirmación con Loading

```typescript
const confirmed = await confirmDialog.showConfirm({
  title: 'Operación lenta',
  message: 'Esta operación puede tomar varios segundos. ¿Continuar?'
})

if (confirmed) {
  confirmDialog.setLoading(true)
  
  try {
    await performSlowOperation()
  } finally {
    confirmDialog.setLoading(false)
  }
}
```

### Confirmación Personalizada

```typescript
const confirmed = await confirmDialog.showConfirm({
  title: 'Acción especial',
  message: 'Esta es una acción especial que requiere confirmación.',
  confirmText: 'Ejecutar',
  cancelText: 'Abortar',
  confirmVariant: 'secondary'
})
```

## Migración desde confirm() nativo

### Antes (confirm nativo)

```typescript
const confirmed = confirm('¿Estás seguro?')
if (confirmed) {
  // Realizar acción
}
```

### Después (nuevo sistema)

```typescript
const confirmed = await confirmDialog.showConfirm({
  message: '¿Estás seguro?'
})
if (confirmed) {
  // Realizar acción
}
```

## Ventajas del Nuevo Sistema

1. **Mejor UX**: Diálogos más atractivos y consistentes con el diseño
2. **Personalizable**: Textos, colores y estilos personalizables
3. **Estado de carga**: Soporte para operaciones asíncronas
4. **Accesibilidad**: Mejor soporte para lectores de pantalla
5. **Consistencia**: Mismo estilo en toda la aplicación
6. **TypeScript**: Soporte completo de tipos
7. **Reutilizable**: Un solo componente para toda la aplicación

## Variantes de Botones

- `default` - Botón primario (azul)
- `destructive` - Botón de peligro (rojo)
- `outline` - Botón con borde
- `secondary` - Botón secundario (gris)
- `ghost` - Botón transparente
- `link` - Botón como enlace

## Ejemplo Completo

Ver `examples/ConfirmDialogExample.vue` para un ejemplo completo de uso con diferentes casos de uso.
