# Solución al Error de Actualización de Roles

## Problema

El error `roles.vue:170 Error al actualizar el estado del rol` ocurría porque el servidor devuelve una respuesta diferente a la esperada cuando se actualiza un rol.

### Respuesta del Servidor
```json
{
    "code": 200,
    "isValid": true,
    "comments": "Role updated successfully",
    "response": 0,
    "token": ""
}
```

El problema era que el servidor devuelve `"response": 0` (un número) en lugar del objeto `Role` completo que el código esperaba.

## Solución Implementada

### 1. Modificación del Composable `useRoles`

Se modificó la función `updateRole` en `composables/useRoles.ts` para manejar ambos tipos de respuesta:

```typescript
const updateRole = async (request: UpdateRoleRequest): Promise<Role | null> => {
  loading.value = true
  error.value = null
  try {
    const result = await roleService.updateRole(request)
    
    // El servidor puede devolver un número (ID) en lugar del objeto completo
    // Si es un número, actualizamos el rol local con los datos del request
    if (typeof result === 'number' || typeof result === 'string') {
      const index = roles.value.findIndex(role => role.id === request.id)
      if (index !== -1) {
        // Actualizar solo las propiedades que se enviaron en el request
        roles.value[index] = {
          ...roles.value[index],
          ...request,
          id: request.id // Asegurar que el ID se mantenga
        }
      }
      return roles.value[index] || null
    } else {
      // Si el servidor devuelve el objeto completo, actualizamos normalmente
      const index = roles.value.findIndex(role => role.id === request.id)
      if (index !== -1) {
        roles.value[index] = result
      }
      return result
    }
  } catch (err) {
    error.value = err as Error
    throw err
  } finally {
    loading.value = false
  }
}
```

### 2. Actualización del Servicio de Roles

Se modificó el tipo de retorno en `lib/api/services/role/role.service.ts`:

```typescript
async updateRole(request: UpdateRoleRequest): Promise<Role | number> {
  const { execute } = useApiPut<{ response: Role | number }>(
    API_ENDPOINTS.role.update,
    { immediate: false }
  )
  const result = await execute({ body: request })
  return result.response
}
```

### 3. Mejoras en el Manejo de Errores

Se actualizaron los componentes para manejar correctamente el caso donde `updateRole` puede devolver `null`:

- `pages/admin/roles.vue`
- `components/admin/roles/EditRoleDialog.vue`
- `examples/RolesExample.vue`

## Beneficios de la Solución

1. **Compatibilidad**: El código ahora funciona tanto si el servidor devuelve el objeto completo como si devuelve solo el ID
2. **Actualización Local**: Cuando el servidor devuelve solo el ID, se actualiza el estado local con los datos del request
3. **Manejo de Errores Mejorado**: Se verifica que la actualización sea exitosa antes de mostrar mensajes de éxito
4. **Consistencia**: Se mantiene la consistencia del estado local sin necesidad de recargar todos los roles

## Archivos Modificados

- `composables/useRoles.ts`
- `lib/api/services/role/role.service.ts`
- `pages/admin/roles.vue`
- `components/admin/roles/EditRoleDialog.vue`
- `examples/RolesExample.vue`

## Notas Importantes

- La solución es retrocompatible y no afecta el funcionamiento cuando el servidor devuelve el objeto completo
- Se eliminó la llamada innecesaria a `loadRoles()` después de actualizar, ya que el composable actualiza automáticamente la lista local
- Se mantiene la funcionalidad de toasts y notificaciones existente
