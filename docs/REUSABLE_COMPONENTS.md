# Componentes y Composable Reutilizables

Este documento explica cómo usar los componentes y composables reutilizables que hemos creado para evitar repetir código en los formularios de autenticación.

## 📁 Estructura de Archivos

```
lib/
├── validations/
│   └── auth.ts              # Esquemas de validación con Zod
├── index.ts                 # Exportaciones centralizadas
composables/
├── useErrorHandler.ts       # Manejo de errores
└── usePasswordStrength.ts   # Fortaleza de contraseña
components/ui/
├── AlertMessage.vue         # Mensajes de alerta
└── PasswordStrengthIndicator.vue # Indicador de fortaleza
```

## 🔧 Esquemas de Validación

### Uso de Esquemas Predefinidos

```typescript
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '@/lib/validations/auth'

// En tu componente
const form = useForm({
  validationSchema: loginSchema, // o cualquier otro schema
})
```

### Esquemas Disponibles

- **`loginSchema`**: Validación para login (email, password)
- **`registerSchema`**: Validación para registro (username, firstName, lastName, birthDate, gender, phone)
- **`forgotPasswordSchema`**: Validación para recuperación (email)
- **`resetPasswordSchema`**: Validación para cambio de contraseña (password, confirmPassword)

## 🚨 Manejo de Errores

### Composable `useErrorHandler`

```typescript
import { useErrorHandler } from '@/composables/useErrorHandler'

const { getErrorMessage, getAuthErrorMessage, getPasswordResetErrorMessage } = useErrorHandler()

// Uso en template
<AlertMessage 
  v-if="error" 
  type="error" 
  :message="getAuthErrorMessage(error)" 
/>
```

### Métodos Disponibles

- **`getErrorMessage(error)`**: Manejo genérico de errores
- **`getAuthErrorMessage(error)`**: Errores específicos de autenticación
- **`getPasswordResetErrorMessage(error)`**: Errores específicos de reset de contraseña

## 🔒 Fortaleza de Contraseña

### Composable `usePasswordStrength`

```typescript
import { usePasswordStrength } from '@/composables/usePasswordStrength'

const { passwordStrength, passwordStrengthText, passwordScore } = usePasswordStrength(password)

// Uso en template
<PasswordStrengthIndicator :password="password" />
```

### Componente `PasswordStrengthIndicator`

```vue
<template>
  <PasswordStrengthIndicator :password="formData.password" />
</template>
```

## 📢 Mensajes de Alerta

### Componente `AlertMessage`

```vue
<template>
  <!-- Error -->
  <AlertMessage 
    v-if="error" 
    type="error" 
    :message="getAuthErrorMessage(error)" 
  />
  
  <!-- Éxito -->
  <AlertMessage 
    v-if="success" 
    type="success" 
    :message="success" 
    dismissible
    @dismiss="success = ''"
  />
  
  <!-- Advertencia -->
  <AlertMessage 
    type="warning" 
    message="Este es un mensaje de advertencia" 
  />
  
  <!-- Información -->
  <AlertMessage 
    type="info" 
    message="Este es un mensaje informativo" 
  />
</template>
```

### Props Disponibles

- **`type`**: `'success' | 'error' | 'warning' | 'info'`
- **`message`**: Mensaje a mostrar
- **`dismissible`**: Si se puede cerrar el mensaje

## 📝 Ejemplo Completo de Formulario

```vue
<template>
  <div class="max-w-md mx-auto p-6">
    <!-- Mensajes de alerta -->
    <AlertMessage 
      v-if="error" 
      type="error" 
      :message="getAuthErrorMessage(error)" 
    />
    
    <AlertMessage 
      v-if="success" 
      type="success" 
      :message="success" 
      dismissible
      @dismiss="success = ''"
    />

    <form @submit="onSubmit" class="space-y-4">
      <!-- Campo de email -->
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Correo electrónico</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="ejemplo@correo.com"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Campo de contraseña con indicador de fortaleza -->
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>Contraseña</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Ingresa tu contraseña"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
          <PasswordStrengthIndicator :password="values.password" />
        </FormItem>
      </FormField>

      <Button 
        type="submit" 
        class="w-full"
        :disabled="loading || !isValid"
      >
        <div v-if="loading" class="flex items-center justify-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Procesando...
        </div>
        <span v-else>Enviar</span>
      </Button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { 
  loginSchema, 
  AlertMessage,
  PasswordStrengthIndicator,
  useErrorHandler
} from '@/lib'

// Props del componente
const props = defineProps({
  loading: { type: Boolean, default: false },
  error: { type: [Error, Object, null], default: null }
})

const emit = defineEmits(['submit'])
const success = ref('')
const { getAuthErrorMessage } = useErrorHandler()

// Formulario con vee-validate usando el schema reutilizable
const form = useForm({
  validationSchema: loginSchema,
})

const { handleSubmit, isValid, values } = form

// Limpiar errores cuando se resuelve el error del servidor
watch(() => props.error, (newError) => {
  if (!newError) {
    form.resetForm()
  }
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})
</script>
```

## 🎯 Beneficios

1. **No repetir código**: Los esquemas de validación y manejo de errores están centralizados
2. **Consistencia**: Todos los formularios usan las mismas validaciones y mensajes
3. **Mantenibilidad**: Cambios en validaciones se aplican automáticamente a todos los formularios
4. **Reutilización**: Los componentes se pueden usar en cualquier parte de la aplicación
5. **Tipado**: TypeScript proporciona autocompletado y validación de tipos

## 🔄 Migración de Formularios Existentes

Para migrar un formulario existente:

1. **Reemplazar esquemas locales** por los importados de `@/lib/validations/auth`
2. **Reemplazar manejo de errores** por `useErrorHandler`
3. **Reemplazar mensajes de alerta** por el componente `AlertMessage`
4. **Agregar indicador de fortaleza** con `PasswordStrengthIndicator` donde sea necesario
5. **Importar desde `@/lib`** en lugar de archivos individuales

Esto reduce significativamente la cantidad de código repetido y mejora la mantenibilidad del proyecto. 