# Funciones de Preferencias de Usuario - Composable useUsers

## Descripción
Se han agregado nuevas funciones al composable `useUsers` para manejar las preferencias de usuario de manera centralizada y reutilizable, específicamente para las preferencias de newsletter y uso de datos personales.

## Nuevas Funciones Agregadas

### 1. updateUserNewsletterPreference
Actualiza la preferencia de newsletter del usuario.

#### Parámetros
- `userEmail` (string, requerido): Email del usuario
- `enableMarketing` (boolean, requerido): Estado de la preferencia de newsletter

#### Retorno
- `Promise<boolean>`: `true` si la actualización fue exitosa, `false` en caso contrario

#### Uso
```typescript
import { useUsers } from '@/composables/useUsers'

const { updateUserNewsletterPreference } = useUsers()

const handleNewsletterChange = async (value: boolean) => {
  const userEmail = authStore.user?.email
  if (!userEmail) return
  
  const result = await updateUserNewsletterPreference(userEmail, value)
  if (result) {
    // Actualización exitosa
    console.log('Preferencia de newsletter actualizada')
  }
}
```

### 2. updateUserDataUsagePreference
Actualiza la preferencia de uso de datos personales del usuario.

#### Parámetros
- `userEmail` (string, requerido): Email del usuario
- `enableUsePersonalData` (boolean, requerido): Estado de la preferencia de uso de datos

#### Retorno
- `Promise<boolean>`: `true` si la actualización fue exitosa, `false` en caso contrario

#### Uso
```typescript
import { useUsers } from '@/composables/useUsers'

const { updateUserDataUsagePreference } = useUsers()

const handleDataUsageChange = async (value: boolean) => {
  const userEmail = authStore.user?.email
  if (!userEmail) return
  
  const result = await updateUserDataUsagePreference(userEmail, value)
  if (result) {
    // Actualización exitosa
    console.log('Preferencia de uso de datos actualizada')
  }
}
```

## Beneficios de la Refactorización

### 1. Reutilización de Código
- Las funciones pueden ser utilizadas en cualquier componente que necesite actualizar estas preferencias
- Elimina la duplicación de lógica entre componentes

### 2. Manejo Centralizado de Errores
- Todas las funciones incluyen manejo de errores consistente
- Mensajes de error y éxito estandarizados usando el sistema de toasts

### 3. Lógica Simplificada en Componentes
- Los componentes ahora solo necesitan llamar a una función simple
- No necesitan manejar la lógica compleja de obtención y actualización de datos

### 4. Mantenibilidad
- Cambios en la lógica de actualización solo requieren modificar el composable
- Testing más fácil al tener la lógica centralizada

## Implementación en PersonalDataScreen

### Antes (Código Duplicado)
```typescript
const handleNewsletterChange = async (value: boolean | string) => {
  // 30+ líneas de código duplicado
  // Lógica compleja de obtención de datos
  // Manejo manual de errores
  // Actualización manual del estado
}
```

### Después (Código Simplificado)
```typescript
const handleNewsletterChange = async (value: boolean | string) => {
  const userEmail = authStore.user?.email
  if (!userEmail) return
  
  const { updateUserNewsletterPreference } = useUsers()
  const result = await updateUserNewsletterPreference(userEmail, Boolean(value))
  
  if (result) {
    // Actualizar estado local si es necesario
    localPersonalData.value.receiveNewsletters = Boolean(value)
  }
}
```

## Estructura de Respuesta Manejada

Las funciones manejan automáticamente diferentes estructuras de respuesta de la API:

### Estructura 1: Con isValid
```json
{
  "isValid": true,
  "response": {
    "id": "123",
    "email": "usuario@ejemplo.com",
    "enableMarketing": true,
    "enableUsePersonalData": true
  }
}
```

### Estructura 2: Con data
```json
{
  "data": {
    "id": "123",
    "email": "usuario@ejemplo.com",
    "enableMarketing": true,
    "enableUsePersonalData": true
  }
}
```

## Logging y Debugging

Todas las funciones incluyen logging detallado para facilitar el debugging:

- Logs de entrada con parámetros
- Logs de respuesta de la API
- Logs de datos de actualización
- Logs de éxito/error

## Consideraciones de Seguridad

- Validación de email antes de realizar operaciones
- Manejo de errores para evitar exposición de información sensible
- Uso del sistema de autenticación existente

## Próximos Pasos

1. **Testing**: Agregar tests unitarios para las nuevas funciones
2. **Documentación**: Actualizar la documentación de la API
3. **Optimización**: Considerar cache de datos del usuario para reducir llamadas a la API
4. **Extensibilidad**: Agregar más funciones de preferencias según sea necesario
