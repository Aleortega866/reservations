# Servicio de Activación de Códigos de Vinculación

Este documento describe la implementación del servicio para activar/desactivar códigos de vinculación en la aplicación MIDEReservacionesFront.

## Descripción General

El servicio permite cambiar el estado de activación de los códigos de vinculación (promociones) mediante un endpoint específico. Esto es útil para habilitar o deshabilitar códigos promocionales sin necesidad de eliminarlos.

## Endpoint de API

### Activar/Desactivar Código de Vinculación

```
PATCH /api/Promotion/ActivateLinkingCodeAsyn
```

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": 1,
  "enable": true,
  "userModifiedId": 1
}
```

**Parámetros:**
- `id` (integer): ID del código de vinculación
- `enable` (boolean): Estado de activación (true = activo, false = inactivo)
- `userModifiedId` (integer): ID del usuario que realiza la modificación

**Response (200 OK):**
```json
{
  "response": {
    "id": 1,
    "code": "DESCUENTO50",
    "name": "Descuento 50%",
    "ticketPrice": 50.00,
    "maxTickets": 100,
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "description": "Descuento del 50%",
    "messageUser": "¡Aprovecha este descuento!",
    "messageAdmin": "Código promocional válido",
    "status": "Activo",
    "enable": true,
    "userModifiedId": 1,
    "dateModified": "2024-01-15T10:30:00Z"
  }
}
```

## Implementación en el Frontend

### 1. Configuración del Endpoint

El endpoint se ha agregado a la configuración de API en `lib/api/core/config.ts`:

```typescript
promotion: {
  // ... otros endpoints
  activateLinkingCode: '/api/Promotion/ActivateLinkingCodeAsyn',
}
```

### 2. Tipos de Datos

Se ha agregado el tipo `ActivateLinkingCodeRequest` en `lib/api/types/promotion/index.ts`:

```typescript
export interface ActivateLinkingCodeRequest {
  id: number
  enable: boolean
  userModifiedId: number
}
```

### 3. Servicio de Promociones

Se ha agregado el método `activateLinkingCode` en `lib/api/services/promotion/promotion.service.ts`:

```typescript
/**
 * Activar o desactivar un código de vinculación
 */
async activateLinkingCode(request: ActivateLinkingCodeRequest): Promise<LinkingCode> {
  const { execute } = useApiPatch<{ response: LinkingCode }>(API_ENDPOINTS.promotion.activateLinkingCode)
  const result = await execute({ body: request })
  return result.response
}
```

### 4. Composable de Promociones

Se ha agregado la función `activateLinkingCode` en `composables/usePromotions.ts`:

```typescript
// Activar o desactivar código de vinculación
const activateLinkingCode = async (request: ActivateLinkingCodeRequest) => {
  try {
    isLoading.value = true
    error.value = null
    const updatedCode = await promotionService.activateLinkingCode(request)
    
    toast({
      title: 'Éxito',
      description: `Código ${request.enable ? 'activado' : 'desactivado'} exitosamente`,
      variant: 'default'
    })
    
    return updatedCode
  } catch (err) {
    console.error('Error al cambiar estado del código:', err)
    error.value = 'No se pudo cambiar el estado del código'
    toast({
      title: 'Error',
      description: 'No se pudo cambiar el estado del código de vinculación',
      variant: 'destructive'
    })
    throw err
  } finally {
    isLoading.value = false
  }
}
```

### 5. Integración en Componentes

#### PairingCodeList.vue

El componente `PairingCodeList.vue` ha sido actualizado para incluir la funcionalidad de activación:

```vue
<template>
  <!-- Switch conectado al servicio -->
  <Switch 
    :model-value="switchStates[option.value]" 
    @update:model-value="(value) => handleSwitchChange(option, value)"
    class="mr-2" 
  />
</template>

<script setup>
// Función para manejar el cambio del switch
const handleSwitchChange = async (option: Option, newValue: boolean) => {
  try {
    if (!option.id) {
      console.error('No se puede cambiar el estado: ID no disponible')
      return
    }

    await activateLinkingCode({
      id: option.id,
      enable: newValue,
      userModifiedId: 1 // TODO: Obtener del usuario autenticado
    })

    // Actualizar el estado local
    switchStates[option.value] = newValue
    
  } catch (error) {
    console.error('Error al cambiar el estado del código:', error)
    // Revertir el cambio en caso de error
    switchStates[option.value] = !newValue
  }
}
</script>
```

## Ejemplo de Uso

### Componente de Ejemplo

Se ha creado un ejemplo completo en `examples/ActivateLinkingCodeExample.vue` que demuestra:

1. Carga de códigos de vinculación
2. Interfaz con switches para activar/desactivar
3. Manejo de estados de carga
4. Notificaciones de éxito/error
5. Actualización en tiempo real del estado

### Página de Ejemplo

La página `/examples/activate-linking-code` muestra el ejemplo en funcionamiento.

## Flujo de Trabajo

1. **Carga Inicial**: Los códigos se cargan con su estado actual
2. **Interacción del Usuario**: El usuario hace clic en un switch
3. **Llamada al API**: Se envía la petición al endpoint de activación
4. **Actualización Local**: El estado se actualiza en la interfaz
5. **Notificación**: Se muestra un toast de confirmación
6. **Manejo de Errores**: En caso de error, se revierte el cambio

## Consideraciones de Seguridad

- **Validación de Usuario**: El `userModifiedId` debe obtenerse del usuario autenticado
- **Permisos**: Verificar que el usuario tenga permisos para modificar códigos
- **Auditoría**: El sistema registra quién realizó el cambio y cuándo

## Estados del Código

- **Activo (enable: true)**: El código está disponible para uso
- **Inactivo (enable: false)**: El código está deshabilitado pero no eliminado

## Integración con el Sistema Existente

El servicio se integra perfectamente con:

- **Sistema de Toast**: Notificaciones automáticas
- **Manejo de Errores**: Gestión centralizada de errores
- **Estados de Carga**: Indicadores visuales durante las operaciones
- **Tipos TypeScript**: Tipado completo para seguridad

## Próximos Pasos

- [ ] Obtener `userModifiedId` del usuario autenticado
- [ ] Agregar validaciones adicionales
- [ ] Implementar confirmación antes de desactivar códigos activos
- [ ] Agregar filtros por estado (activo/inactivo)
- [ ] Implementar búsqueda de códigos
