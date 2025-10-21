# Reset Password Sign In Service

## Descripción

El servicio `ResetPasswordSignInAsync` permite a los usuarios cambiar su contraseña durante el proceso de inicio de sesión. Este endpoint es útil cuando se requiere que el usuario actualice su contraseña por motivos de seguridad o políticas de la organización.

## Endpoint

```
POST /api/Auth/ResetPasswordSignInAsync
```

## Configuración

### Headers Requeridos
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_SECRET_TOKEN`

### Parámetros del Body

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `email` | `string \| null` | Email del usuario | Sí |
| `password` | `string \| null` | Contraseña actual | Sí |
| `newPassword` | `string \| null` | Nueva contraseña | Sí |

### Ejemplo de Request

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

### Respuesta

#### 200 OK
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

## Implementación en el Frontend

### Tipos TypeScript

```typescript
export interface ResetPasswordSignInRequest {
  email: string | null
  password: string | null
  newPassword: string | null
}

export interface ResetPasswordSignInResponse {
  message: string
}
```

### Servicio

```typescript
class AuthService {
  async resetPasswordSignIn(data: ResetPasswordSignInRequest): Promise<ResetPasswordSignInResponse> {
    const { execute } = useApiPost<ResetPasswordSignInResponse>(API_ENDPOINTS.auth.resetPasswordSignIn)
    return execute({ body: data })
  }
}
```

### Composable

```typescript
export function useApiAuth() {
  const resetPasswordSignInComposable = useApiPost<ResetPasswordSignInResponse>(
    API_ENDPOINTS.auth.resetPasswordSignIn, 
    { immediate: false }
  )

  const resetPasswordSignIn = async (data: ResetPasswordSignInRequest) => {
    try {
      await resetPasswordSignInComposable.execute({ body: data })
      return resetPasswordSignInComposable.data.value
    } catch (err) {
      throw err
    }
  }

  return {
    // ... otros métodos
    resetPasswordSignIn
  }
}
```

### Uso en Componentes

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.email" type="email" placeholder="Email" />
    <input v-model="formData.password" type="password" placeholder="Contraseña actual" />
    <input v-model="formData.newPassword" type="password" placeholder="Nueva contraseña" />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Procesando...' : 'Cambiar Contraseña' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { useApiAuth } from '@/lib/api/composables/auth'

const { resetPasswordSignIn, loading, error } = useApiAuth()

const formData = ref({
  email: '',
  password: '',
  newPassword: ''
})

const handleSubmit = async () => {
  try {
    const response = await resetPasswordSignIn({
      email: formData.value.email || null,
      password: formData.value.password || null,
      newPassword: formData.value.newPassword || null
    })
    
    console.log('Contraseña actualizada:', response)
  } catch (err) {
    console.error('Error:', err)
  }
}
</script>
```

## Configuración del Endpoint

El endpoint está configurado en `lib/api/core/config.ts`:

```typescript
export const API_ENDPOINTS = {
  auth: {
    // ... otros endpoints
    resetPasswordSignIn: '/api/Auth/ResetPasswordSignInAsync'
  }
}
```

## Casos de Uso

1. **Cambio de contraseña obligatorio**: Cuando el sistema requiere que el usuario cambie su contraseña por motivos de seguridad.

2. **Políticas de contraseña**: Cuando se implementan nuevas políticas de contraseñas que requieren actualización.

3. **Recuperación de cuenta**: Como parte del proceso de recuperación de cuenta.

4. **Primer inicio de sesión**: Para usuarios nuevos que deben establecer su contraseña inicial.

## Consideraciones de Seguridad

- El endpoint requiere autenticación mediante Bearer Token
- Todos los campos de contraseña deben ser manejados de forma segura
- Se recomienda implementar validaciones de fortaleza de contraseña en el frontend
- Los errores no deben revelar información sensible sobre la cuenta

## Ejemplo Completo

Ver el archivo `examples/ResetPasswordSignInExample.vue` para un ejemplo completo de implementación con interfaz de usuario.

## Página de Ejemplo

Accede al ejemplo en: `/examples/reset-password-sign-in`

## Archivos Relacionados

- `lib/api/services/auth/auth.service.ts` - Implementación del servicio
- `lib/api/composables/auth.ts` - Composable para uso en componentes
- `lib/api/types/auth/index.ts` - Definición de tipos
- `lib/api/core/config.ts` - Configuración del endpoint
- `examples/ResetPasswordSignInExample.vue` - Ejemplo de uso
- `pages/examples/reset-password-sign-in.vue` - Página del ejemplo
