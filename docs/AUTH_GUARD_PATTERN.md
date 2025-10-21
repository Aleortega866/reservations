# Patrón de Auth Guard para Páginas Protegidas

## Problema
Cuando un usuario no autenticado accede a una página protegida, el contenido se renderiza por unos segundos antes de que el middleware redirija al login, causando un "flash" de contenido no deseado.

## Solución
Implementar un guard de autenticación en el componente que evite mostrar contenido antes de la verificación.

## Componentes Creados

### 1. Composable `useAuthGuard`
**Archivo**: `composables/auth/useAuthGuard.ts`

```typescript
export function useAuthGuard() {
  const authStore = useAuthStore()
  
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const hasValidToken = computed(() => {
    const token = authStore.token
    return token && token.trim() !== ''
  })
  
  const shouldShowLoading = computed(() => !isAuthenticated.value || !hasValidToken.value)
  const shouldShowContent = computed(() => isAuthenticated.value && hasValidToken.value)
  
  return {
    isAuthenticated,
    hasValidToken,
    shouldShowLoading,
    shouldShowContent
  }
}
```

### 2. Componente `AuthLoading`
**Archivo**: `components/auth/AuthLoading.vue`

Componente reutilizable para mostrar loading durante la verificación de autenticación.

## Uso en Páginas Protegidas

### Template
```vue
<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación -->
    <AuthLoading v-if="shouldShowLoading" />
    
    <!-- Contenido solo si está autenticado -->
    <div v-else-if="shouldShowContent" class="flex-1">
      <!-- Tu contenido aquí -->
    </div>
  </div>
</template>
```

### Script
```typescript
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();
```

## Páginas que Deben Usar Este Patrón

- `/profile/` ✅ (Ya implementado)
- `/reservations/` 
- `/admin/`
- `/material/`
- `/notification/`
- Cualquier página que requiera autenticación

## Beneficios

1. **No más flash de contenido**: El usuario no ve contenido antes del redirect
2. **Mejor UX**: Loading state claro durante verificación
3. **Reutilizable**: Patrón consistente en todas las páginas
4. **Mantenible**: Lógica centralizada en composable

## Implementación en Otras Páginas

Para aplicar este patrón a otras páginas:

1. Importar el composable y componente
2. Usar `shouldShowLoading` y `shouldShowContent` en el template
3. Envolver el contenido en la condición `v-else-if="shouldShowContent"`
