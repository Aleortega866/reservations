# Sistema de Toasts - MIDER

Sistema de notificaciones toast moderno y configurable para la aplicación MIDER.

## 📋 Características

- **Tipos de Toast**: Success, Error, Info, Warning
- **Configuración Centralizada**: JSON de configuración para todos los tipos
- **Personalización**: Opciones flexibles por toast
- **Promesas**: Soporte para operaciones asíncronas
- **Accesibilidad**: Configuraciones de ARIA y navegación por teclado
- **Temas**: Soporte para modo claro y oscuro

## 🚀 Uso Básico

### Importación

```typescript
import { useToast } from '@/composables/useToast'

const { 
  showSuccess, 
  showError, 
  showInfo, 
  showWarning, 
  showPromise,
  showCustom,
  getConfig 
} = useToast()
```

### Ejemplos de Uso

```typescript
// Toast de éxito
showSuccess('¡Operación exitosa!', 'Los datos se han guardado correctamente')

// Toast de error
showError('Error en la operación', 'No se pudo completar la acción solicitada')

// Toast informativo
showInfo('Información importante', 'Este es un mensaje informativo')

// Toast de advertencia
showWarning('Advertencia', 'Ten cuidado con esta acción')

// Toast personalizado
showCustom('Mensaje personalizado', 'Descripción opcional', { duration: 6000 })

// Toast con promesa
showPromise(
  asyncOperation(),
  {
    loading: 'Procesando...',
    success: '¡Completado!',
    error: 'Error en el proceso'
  }
)
```

## ⚙️ Configuración

### Configuración por Tipo

```typescript
const TOAST_CONFIG = {
  types: {
    success: {
      duration: 3000,        // Duración en milisegundos
      className: 'toast-success', // Clase CSS personalizada
      position: 'top-right'  // Posición del toast
    },
    error: {
      duration: 5000,
      className: 'toast-error',
      position: 'top-right'
    },
    info: {
      duration: 4000,
      className: 'toast-info',
      position: 'top-right'
    },
    warning: {
      duration: 4000,
      className: 'toast-warning',
      position: 'top-right'
    }
  }
}
```

### Configuración Global

```typescript
global: {
  position: 'top-right',     // Posición por defecto
  richColors: true,          // Colores enriquecidos
  closeButton: true,         // Botón de cerrar (X)
  dismissible: true,         // Permite cerrar con click
  maxToasts: 5,              // Máximo número de toasts
  expand: true,              // Expandir automáticamente
  swipeToClose: true         // Cerrar con gesto
}
```

**Nota importante:** El botón de cerrar se muestra automáticamente en todos los toasts cuando `closeButton: true` está configurado. Los usuarios pueden cerrar los toasts de tres formas:
1. **Botón X**: Haciendo clic en el botón de cerrar
2. **Click en el toast**: Haciendo clic en cualquier parte del toast (si `dismissible: true`)
3. **Gesto de deslizar**: Deslizando hacia la derecha (si `swipeToClose: true`)

### Configuración de Animación

```typescript
animation: {
  enter: 'toast-enter',      // Clase CSS para entrada
  exit: 'toast-exit',        // Clase CSS para salida
  duration: 300              // Duración de la animación
}
```

### Configuración de Accesibilidad

```typescript
accessibility: {
  announce: true,            // Anunciar a lectores de pantalla
  role: 'alert',             // Rol ARIA
  ariaLive: 'polite'         // Nivel de prioridad ARIA
}
```

### Configuración de Tema

```typescript
theme: {
  light: {
    background: '#ffffff',
    text: '#000000',
    border: '#e5e7eb'
  },
  dark: {
    background: '#1f2937',
    text: '#ffffff',
    border: '#374151'
  }
}
```

## 🎨 Personalización

### Opciones por Toast

```typescript
// Toast con duración personalizada
showSuccess('Éxito', 'Descripción', { duration: 10000 })

// Toast con posición personalizada
showError('Error', 'Descripción', { position: 'bottom-center' })

// Toast con clase CSS personalizada
showInfo('Info', 'Descripción', { className: 'my-custom-toast' })

// Múltiples opciones
showWarning('Advertencia', 'Descripción', {
  duration: 8000,
  position: 'top-left',
  className: 'custom-warning-toast'
})
```

### Toast con Promesa

```typescript
const asyncOperation = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      resolve('Datos procesados')
    } else {
      reject(new Error('Error en el procesamiento'))
    }
  }, 2000)
})

showPromise(asyncOperation(), {
  loading: 'Procesando datos...',
  success: (data) => `¡Datos procesados: ${data}!`,
  error: (error) => `Error: ${error.message}`
})
```

## 🔧 API de Métodos

### `showSuccess(title, description?, options?)`
Muestra un toast de éxito.

**Parámetros:**
- `title` (string): Título del toast
- `description` (string, opcional): Descripción del toast
- `options` (object, opcional): Opciones personalizadas

### `showError(title, description?, options?)`
Muestra un toast de error.

### `showInfo(title, description?, options?)`
Muestra un toast informativo.

### `showWarning(title, description?, options?)`
Muestra un toast de advertencia.

### `showCustom(title, description?, options?)`
Muestra un toast personalizado.

### `showPromise(promise, options)`
Muestra un toast que sigue el estado de una promesa.

**Parámetros:**
- `promise` (Promise): La promesa a monitorear
- `options` (object):
  - `loading` (string): Mensaje durante la carga
  - `success` (string | function): Mensaje de éxito
  - `error` (string | function): Mensaje de error

### `getConfig()`
Retorna la configuración completa del sistema de toasts.

## 🎯 Ejemplos Prácticos

### En Componentes Vue

```vue
<template>
  <div>
    <button @click="handleSave">Guardar</button>
    <button @click="handleDelete">Eliminar</button>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { showSuccess, showError, showPromise } = useToast()

const handleSave = async () => {
  try {
    await saveData()
    showSuccess('Datos guardados', 'La información se ha guardado correctamente')
  } catch (error) {
    showError('Error al guardar', 'No se pudieron guardar los datos')
  }
}

const handleDelete = () => {
  showPromise(
    deleteData(),
    {
      loading: 'Eliminando...',
      success: 'Elemento eliminado correctamente',
      error: 'Error al eliminar el elemento'
    }
  )
}
</script>
```

### En Composables

```typescript
// composables/useUserActions.ts
import { useToast } from '@/composables/useToast'

export const useUserActions = () => {
  const { showSuccess, showError, showPromise } = useToast()

  const updateProfile = async (userData: UserData) => {
    return showPromise(
      api.updateProfile(userData),
      {
        loading: 'Actualizando perfil...',
        success: 'Perfil actualizado correctamente',
        error: 'Error al actualizar el perfil'
      }
    )
  }

  const changePassword = async (passwordData: PasswordData) => {
    try {
      await api.changePassword(passwordData)
      showSuccess('Contraseña cambiada', 'Tu contraseña se ha actualizado')
    } catch (error) {
      showError('Error', 'No se pudo cambiar la contraseña')
    }
  }

  return {
    updateProfile,
    changePassword
  }
}
```

## 🎨 Estilos CSS

### Clases por Defecto

```css
/* Toast de éxito */
.toast-success {
  background-color: #10b981;
  color: white;
}

/* Toast de error */
.toast-error {
  background-color: #ef4444;
  color: white;
}

/* Toast informativo */
.toast-info {
  background-color: #3b82f6;
  color: white;
}

/* Toast de advertencia */
.toast-warning {
  background-color: #f59e0b;
  color: white;
}
```

### Personalización de Estilos

```css
/* Toast personalizado */
.my-custom-toast {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Animaciones personalizadas */
.toast-enter {
  animation: slideIn 0.3s ease-out;
}

.toast-exit {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

## 🔍 Depuración

### Obtener Configuración

```typescript
const { getConfig } = useToast()
const config = getConfig()
console.log('Configuración de toasts:', config)
```

### Manejo de Errores

Todos los métodos incluyen manejo de errores interno:

```typescript
try {
  showSuccess('Éxito', 'Descripción')
} catch (error) {
  console.error('Error en toast:', error)
  // Fallback: mostrar mensaje en consola
  console.log('Éxito: Descripción')
}
```

## 📱 Responsive

El sistema de toasts es completamente responsive y se adapta a diferentes tamaños de pantalla:

- **Desktop**: Posición top-right por defecto
- **Tablet**: Ajuste automático de tamaño
- **Mobile**: Posición optimizada para pantallas pequeñas

## ♿ Accesibilidad

- **Navegación por teclado**: Alt + T para enfocar área de toasts
- **Lectores de pantalla**: Anuncios automáticos con ARIA
- **Contraste**: Colores optimizados para accesibilidad
- **Tamaño de texto**: Escalable según preferencias del usuario

## 🔘 Botón de Cerrar

### Configuración

El botón de cerrar está habilitado por defecto en todos los toasts. Para configurarlo:

```typescript
// En la configuración global
global: {
  closeButton: true,    // Habilita el botón de cerrar
  dismissible: true,    // Permite cerrar con click en el toast
  swipeToClose: true    // Permite cerrar con gesto de deslizar
}
```

### Comportamiento

- **Botón X**: Aparece en la esquina superior derecha de cada toast
- **Click en toast**: Cierra el toast al hacer clic en cualquier parte
- **Gesto de deslizar**: En dispositivos móviles, deslizar hacia la derecha cierra el toast
- **Duración**: El toast se cierra automáticamente después del tiempo configurado

### Personalización

```typescript
// Toast con botón de cerrar personalizado
showSuccess('Éxito', 'Descripción', { 
  closeButton: true,
  dismissible: true,
  duration: 10000  // 10 segundos
})

// Toast sin botón de cerrar
showInfo('Info', 'Descripción', { 
  closeButton: false,
  dismissible: false
})
```

## 📍 Posiciones del Toast

### Posiciones Disponibles

```typescript
// Posiciones disponibles para el toast completo:
// 'top-left'      - Esquina superior izquierda
// 'top-center'    - Centro superior
// 'top-right'     - Esquina superior derecha (por defecto)
// 'bottom-left'   - Esquina inferior izquierda
// 'bottom-center' - Centro inferior
// 'bottom-right'  - Esquina inferior derecha
```

### Configuración Global

```typescript
// En la configuración global
global: {
  position: 'top-right',  // Cambia aquí la posición por defecto
  // ... otras configuraciones
}
```

### Configuración por Toast

```typescript
// Toast en posición específica
showSuccess('Éxito', 'Descripción', { 
  position: 'top-left'  // Posición personalizada
})

// Toast en centro superior
showInfo('Info', 'Descripción', { 
  position: 'top-center'
})

// Toast en esquina inferior izquierda
showWarning('Advertencia', 'Descripción', { 
  position: 'bottom-left'
})
```

### Configuración en el Componente Toaster

```vue
<template>
  <Toaster 
    position="top-right"  <!-- Cambia aquí la posición global -->
    :close-button="true"
    :dismissible="true"
  />
</template>
```

**Nota:** El botón de cerrar siempre aparece en la esquina superior derecha del toast, independientemente de la posición del toast en la pantalla.

## 🔄 Migración

Si estás migrando desde una versión anterior con iconos:

1. **Eliminar referencias a iconos** en el código existente
2. **Actualizar llamadas** a métodos que usaban iconos
3. **Revisar estilos CSS** que dependían de iconos
4. **Probar funcionalidad** en diferentes dispositivos

## 📚 Recursos Adicionales

- [Documentación de Vue Sonner](https://vue-sonner.vercel.app/)
- [Ejemplos de uso](./pages/examples/toast-example.vue)
- [Configuración de Tailwind CSS](./tailwind.config.js) 