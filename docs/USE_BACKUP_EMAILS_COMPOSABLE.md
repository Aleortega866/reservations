# Composable useBackupEmails

## Descripción
El composable `useBackupEmails` centraliza toda la lógica de manejo de emails de respaldo de los usuarios. Proporciona una interfaz consistente y reutilizable para agregar, eliminar, cargar y validar emails de respaldo.

## Ubicación
```
composables/useBackupEmails.ts
```

## Características

### ✅ **Funcionalidades Principales**
- Cargar emails de respaldo desde la API
- Agregar nuevos emails de respaldo
- Eliminar emails de respaldo existentes
- Validación automática de emails
- Manejo de errores centralizado
- Estado de carga (loading)
- Límite de 3 emails máximo
- Prevención de duplicados

### ✅ **Integración con Store**
- Actualiza automáticamente el store de autenticación
- Sincroniza el estado local con el store global

### ✅ **Manejo de Errores**
- Errores de red
- Errores de validación
- Errores del servidor
- Toast notifications automáticas

## Uso Básico

### Importar el Composable
```typescript
import { useBackupEmails } from '@/composables/useBackupEmails'
```

### Inicializar
```typescript
const backupEmails = useBackupEmails()

// Inicializar cargando los emails existentes
await backupEmails.initialize()
```

### Estado Reactivo
```typescript
// Emails actuales
const emails = backupEmails.backupEmails.value

// Estado de carga
const isLoading = backupEmails.loading.value

// Errores
const error = backupEmails.error.value

// Computed properties
const canAddMore = backupEmails.canAddMore.value
const hasReachedLimit = backupEmails.hasReachedLimit.value
const emailCount = backupEmails.emailCount.value
```

## API del Composable

### Propiedades Reactivas

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `backupEmails` | `ComputedRef<string[]>` | Lista de emails de respaldo |
| `loading` | `ComputedRef<boolean>` | Estado de carga |
| `error` | `ComputedRef<string \| null>` | Error actual (si existe) |

### Computed Properties

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `hasReachedLimit` | `ComputedRef<boolean>` | `true` si ya tiene 3 emails |
| `canAddMore` | `ComputedRef<boolean>` | `true` si puede agregar más emails |
| `emailCount` | `ComputedRef<number>` | Cantidad actual de emails |

### Métodos

#### `initialize(userId?: string)`
Inicializa el composable cargando los emails existentes.

```typescript
await backupEmails.initialize()
// o con un userId específico
await backupEmails.initialize('user-id-123')
```

#### `loadBackupEmails(userId?: string)`
Carga los emails de respaldo desde la API.

```typescript
const emails = await backupEmails.loadBackupEmails()
```

#### `addBackupEmail(email: string, userId?: string)`
Agrega un nuevo email de respaldo.

```typescript
try {
  await backupEmails.addBackupEmail('nuevo@email.com')
  console.log('Email agregado exitosamente')
} catch (error) {
  console.error('Error al agregar email:', error)
}
```

#### `removeBackupEmail(email: string, userId?: string)`
Elimina un email de respaldo.

```typescript
try {
  await backupEmails.removeBackupEmail('email@a.eliminar.com')
  console.log('Email eliminado exitosamente')
} catch (error) {
  console.error('Error al eliminar email:', error)
}
```

#### `validateEmail(email: string)`
Valida un email antes de agregarlo.

```typescript
const validation = backupEmails.validateEmail('test@email.com')

if (validation.isValid) {
  // Email válido, proceder a agregar
  await backupEmails.addBackupEmail('test@email.com')
} else {
  // Mostrar errores
  validation.errors.forEach(error => console.error(error))
}
```

## Ejemplos de Uso

### Ejemplo 1: Componente Simple
```vue
<template>
  <div>
    <h3>Emails de respaldo ({{ backupEmails.emailCount }}/3)</h3>
    
    <!-- Lista de emails -->
    <div v-for="email in backupEmails.backupEmails" :key="email">
      {{ email }}
      <button @click="removeEmail(email)">Eliminar</button>
    </div>
    
    <!-- Formulario para agregar -->
    <input v-model="newEmail" type="email" />
    <button 
      @click="addEmail"
      :disabled="backupEmails.loading || !backupEmails.canAddMore"
    >
      Agregar
    </button>
    
    <!-- Estado de carga -->
    <div v-if="backupEmails.loading">Cargando...</div>
    
    <!-- Errores -->
    <div v-if="backupEmails.error" class="error">
      {{ backupEmails.error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBackupEmails } from '@/composables/useBackupEmails'

const backupEmails = useBackupEmails()
const newEmail = ref('')

onMounted(async () => {
  await backupEmails.initialize()
})

const addEmail = async () => {
  try {
    await backupEmails.addBackupEmail(newEmail.value)
    newEmail.value = ''
  } catch (error) {
    // Error ya manejado en el composable
  }
}

const removeEmail = async (email) => {
  try {
    await backupEmails.removeBackupEmail(email)
  } catch (error) {
    // Error ya manejado en el composable
  }
}
</script>
```

### Ejemplo 2: Con Validación
```vue
<template>
  <div>
    <input 
      v-model="newEmail" 
      type="email" 
      :class="{ 'error': !validation.isValid }"
    />
    
    <div v-if="validation.errors.length > 0" class="errors">
      <div v-for="error in validation.errors" :key="error">
        {{ error }}
      </div>
    </div>
    
    <button 
      @click="addEmail"
      :disabled="!validation.isValid || backupEmails.loading"
    >
      Agregar Email
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBackupEmails } from '@/composables/useBackupEmails'

const backupEmails = useBackupEmails()
const newEmail = ref('')

const validation = computed(() => {
  return backupEmails.validateEmail(newEmail.value)
})

const addEmail = async () => {
  if (validation.value.isValid) {
    try {
      await backupEmails.addBackupEmail(newEmail.value)
      newEmail.value = ''
    } catch (error) {
      // Error ya manejado
    }
  }
}
</script>
```

## Integración con Componentes Existentes

### Actualizar AddBackupEmailDialog.vue
```typescript
// Antes (lógica duplicada)
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()
const loading = ref(false)

// Después (usando composable)
const backupEmails = useBackupEmails()
```

### Actualizar ContactSecurityScreen.vue
```typescript
// Antes (lógica duplicada)
const loadAlternativeEmails = async (userId: string) => {
  // ... lógica duplicada
}

// Después (usando composable)
const backupEmails = useBackupEmails()
await backupEmails.initialize(userId)
```

## Ventajas del Composable

### ✅ **Reutilización**
- Un solo lugar para toda la lógica
- Fácil de usar en cualquier componente
- No más código duplicado

### ✅ **Mantenibilidad**
- Cambios centralizados
- Fácil de testear
- Fácil de debuggear

### ✅ **Consistencia**
- Mismo comportamiento en toda la app
- Validaciones uniformes
- Manejo de errores consistente

### ✅ **Performance**
- Estado compartido entre componentes
- Menos llamadas a la API
- Caché automático

## Migración de Código Existente

### Paso 1: Reemplazar lógica duplicada
```typescript
// ❌ Antes (en cada componente)
const addBackupEmail = async (email: string) => {
  // ... lógica duplicada
}

// ✅ Después (usando composable)
const backupEmails = useBackupEmails()
await backupEmails.addBackupEmail(email)
```

### Paso 2: Actualizar validaciones
```typescript
// ❌ Antes (validaciones dispersas)
if (emails.length >= 3) { /* ... */ }
if (emails.includes(email)) { /* ... */ }

// ✅ Después (validación centralizada)
const validation = backupEmails.validateEmail(email)
```

### Paso 3: Simplificar manejo de errores
```typescript
// ❌ Antes (manejo manual)
try {
  // ... lógica
} catch (error) {
  showError('Error', error.message)
}

// ✅ Después (manejo automático)
await backupEmails.addBackupEmail(email)
// Los errores se manejan automáticamente
```

## Consideraciones

### 🔄 **Estado Compartido**
- El composable mantiene estado entre componentes
- Usar `initialize()` para refrescar datos

### 🔒 **Validaciones**
- Las validaciones son automáticas
- Usar `validateEmail()` para validación previa

### ⚡ **Performance**
- Los emails se cargan una sola vez
- El estado se mantiene en memoria

### 🐛 **Debugging**
- Todos los errores se loguean automáticamente
- Usar `backupEmails.error` para mostrar errores en UI
