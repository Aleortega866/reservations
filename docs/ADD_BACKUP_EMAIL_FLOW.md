# Flujo para Agregar Correos de Respaldo

## Descripción
Este documento explica cómo funciona el flujo completo para agregar correos electrónicos de respaldo al perfil del usuario.

## Componentes Involucrados

### 1. AddBackupEmailDialog.vue
- **Propósito**: Modal para capturar el correo de respaldo del usuario
- **Funcionalidad**:
  - Valida formato de email
  - Verifica que no esté duplicado
  - Controla límite de 3 correos máximo
  - Emite evento `add-backup-email` con el correo

### 2. ContactSecurityScreen.vue
- **Propósito**: Componente padre que maneja la lógica de negocio
- **Funcionalidad**:
  - Escucha el evento del modal
  - Re-emite el evento al componente padre
  - Actualiza la UI local

## Flujo Completo

### Paso 1: Usuario Abre el Modal
```vue
<AddBackupEmailDialog 
  :current-backup-emails="contactData.backupEmails || []" 
  @add-backup-email="addBackupEmailFromModal"
>
  <template #trigger>
    <Button>Agregar correo de respaldo</Button>
  </template>
</AddBackupEmailDialog>
```

### Paso 2: Usuario Ingresa y Valida el Correo
El modal valida:
- Formato de email válido
- Que no esté duplicado
- Que no exceda el límite de 3 correos

### Paso 3: Modal Emite el Evento
```javascript
// En AddBackupEmailDialog.vue
function onSubmit(values: any) {
  emit('add-backup-email', values.email)
  open.value = false
  resetForm()
}
```

### Paso 4: Componente Padre Recibe el Evento
```javascript
// En ContactSecurityScreen.vue
const addBackupEmailFromModal = (email: string) => {
  emit('add-backup-email', email)
}
```

### Paso 5: Implementación del Guardado (Ejemplo)

```javascript
// En el componente padre que usa ContactSecurityScreen
import { userService } from '@/lib/api/services/users/user.service'
import { useToast } from '@/composables/useToast'

const { showSuccess, showError } = useToast()

const handleAddBackupEmail = async (email: string) => {
  try {
    // Obtener el ID del usuario actual
    const userId = authStore.user?.id
    
    if (!userId) {
      showError('Error', 'No se encontró el usuario')
      return
    }

    // Llamar al servicio para guardar el correo
    const response = await userService.addAlternativeEmail({
      userId: userId,
      email: email
    })

    // Actualizar la UI local
    contactData.value.backupEmails = [
      ...(contactData.value.backupEmails || []),
      email
    ]

    // Mostrar mensaje de éxito
    showSuccess('Correo agregado', 'Se agregó el correo de respaldo correctamente')

  } catch (error) {
    console.error('Error al agregar correo de respaldo:', error)
    showError('Error', 'No se pudo agregar el correo de respaldo')
  }
}
```

## Uso del Componente

```vue
<template>
  <ContactSecurityScreen 
    :contact-data="userData"
    @add-backup-email="handleAddBackupEmail"
  />
</template>

<script setup>
const handleAddBackupEmail = async (email: string) => {
  // Implementar la lógica de guardado aquí
  // Ver ejemplo anterior
}
</script>
```

## Validaciones Implementadas

1. **Formato de Email**: Usa regex para validar formato válido
2. **Duplicados**: Verifica que el correo no esté ya registrado
3. **Límite**: Máximo 3 correos de respaldo por usuario
4. **Campos Requeridos**: El email es obligatorio

## Servicio API

El servicio `addAlternativeEmail` en `user.service.ts`:

```typescript
/**
 * Agrega un email alternativo a un usuario
 * @param data - Objeto con userId y email del email alternativo a agregar
 * @returns Promise con la información del email alternativo creado
 */
async addAlternativeEmail(data: AddAlternativeEmailRequest) {
  return apiClient.post<AlternativeEmail>(API_ENDPOINTS.user.addAlternativeEmail, data)
}
```

## Endpoint API

```
POST /api/User/AddUsersAlternativeEmailAsync
```

**Body:**
```json
{
  "userId": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string", 
  "email": "string",
  "isVerified": boolean
}
```

## Notas Importantes

1. El modal se cierra automáticamente después de emitir el evento
2. El formulario se resetea después de enviar
3. Las validaciones se ejecutan en tiempo real
4. El componente padre es responsable de la persistencia de datos
5. Se recomienda mostrar feedback al usuario (toast de éxito/error)