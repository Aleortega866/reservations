# Instalación y Configuración del Sistema AppLoading

## ✅ Estado de Implementación

El sistema AppLoading ha sido completamente implementado y está listo para usar.

## 📦 Archivos Creados

### Componentes
- ✅ `components/app/AppLoading.vue`
- ✅ `components/app/AppLoadingExample.md`
- ✅ `components/app/README.md` (actualizado)

### Composables
- ✅ `composables/ui/useAppLoading.ts`
- ✅ `composables/index.ts` (actualizado con export)

### Páginas de Prueba
- ✅ `pages/test-loading.vue`

### Middleware de Ejemplo
- ✅ `middleware/page-loading.example.ts`

### Documentación
- ✅ `docs/APP_LOADING_SYSTEM.md`
- ✅ `docs/APP_LOADING_INSTALACION.md` (este archivo)

### Integración Global
- ✅ `app.vue` (actualizado)

## 🚀 Cómo Usar

### 1. Reiniciar el Servidor de Desarrollo

**IMPORTANTE:** Después de la instalación, debes reiniciar el servidor de desarrollo para que Nuxt detecte el nuevo composable.

```bash
# Detener el servidor actual (Ctrl+C)

# Limpiar el cache de Nuxt (opcional pero recomendado)
rm -rf .nuxt

# Reiniciar el servidor
npm run dev
# o
pnpm dev
```

### 2. Uso Básico en Cualquier Componente

```vue
<script setup lang="ts">
// El composable se auto-importa, no necesitas importarlo
const { showLoading, hideLoading } = useAppLoading()

const cargarDatos = async () => {
  showLoading('Cargando...')
  await fetchData()
  hideLoading()
}
</script>
```

### 3. Probar el Componente

Una vez reiniciado el servidor, visita:

```
http://localhost:3000/test-loading
```

Esta página incluye 6 ejemplos interactivos del componente.

## 🔧 Verificación de la Instalación

### Paso 1: Verificar que los archivos existen

```bash
# Componente principal
ls components/app/AppLoading.vue

# Composable
ls composables/ui/useAppLoading.ts

# Página de prueba
ls pages/test-loading.vue
```

### Paso 2: Verificar la integración en app.vue

Abre `app.vue` y verifica que contenga:

```vue
<script setup lang="ts">
import { useAppLoading } from "@/composables/ui/useAppLoading";

const { isLoading, loadingText, showText, showSpinner } = useAppLoading();
</script>

<template>
  <SidebarProvider>
    <!-- ... contenido ... -->
    
    <!-- Loading Global -->
    <AppLoading
      :is-visible="isLoading"
      :loading-text="loadingText"
      :show-text="showText"
      :show-spinner="showSpinner"
    />
  </SidebarProvider>
</template>
```

### Paso 3: Verificar el logo

Asegúrate de que el logo existe:

```bash
ls public/assets/mide-logo.svg
```

Si el logo no existe o quieres usar otro, edita `components/app/AppLoading.vue` línea ~37:

```vue
<img
  src="/assets/mide-logo.svg"
  alt="MIDE Logo"
/>
```

## 📖 Documentación

### Documentación Completa
- `docs/APP_LOADING_SYSTEM.md` - Documentación completa con ejemplos

### Documentación Rápida
- `components/app/README.md` - Guía rápida del componente
- `components/app/AppLoadingExample.md` - Ejemplos detallados

## 🎯 Ejemplos de Uso Comunes

### Ejemplo 1: En una Página

```vue
<!-- pages/mi-pagina.vue -->
<script setup lang="ts">
const { withLoading } = useAppLoading()

const datos = ref([])

onBeforeMount(async () => {
  await withLoading(
    async () => {
      datos.value = await $fetch('/api/datos')
    },
    'Cargando datos...'
  )
})
</script>
```

### Ejemplo 2: En un Formulario

```vue
<script setup lang="ts">
const { showLoading, hideLoading } = useAppLoading()

const guardar = async () => {
  showLoading('Guardando cambios...')
  
  try {
    await $fetch('/api/guardar', { method: 'POST', body: datos })
    toast.success('Guardado exitosamente')
  } catch (error) {
    toast.error('Error al guardar')
  } finally {
    hideLoading()
  }
}
</script>
```

### Ejemplo 3: Proceso de Múltiples Pasos

```vue
<script setup lang="ts">
const { showLoading, hideLoading } = useAppLoading()

const procesarReservacion = async () => {
  try {
    showLoading('Validando datos...')
    await validar()
    
    showLoading('Procesando pago...')
    await procesar()
    
    showLoading('Confirmando...')
    await confirmar()
    
    hideLoading()
    toast.success('¡Completado!')
  } catch (error) {
    hideLoading()
    toast.error('Error en el proceso')
  }
}
</script>
```

## 🐛 Solución de Problemas

### Problema: "useAppLoading is not defined"

**Solución:**
1. Asegúrate de haber reiniciado el servidor de desarrollo
2. Limpia el cache de Nuxt: `rm -rf .nuxt`
3. Verifica que el archivo `composables/ui/useAppLoading.ts` existe
4. Si el problema persiste, importa manualmente:
   ```ts
   import { useAppLoading } from '@/composables/ui/useAppLoading'
   ```

### Problema: El logo no se muestra

**Solución:**
1. Verifica que el archivo existe: `public/assets/mide-logo.svg`
2. Si usas otro logo, actualiza la ruta en `components/app/AppLoading.vue`
3. Asegúrate de que la ruta comience con `/assets/...`

### Problema: El loading no se oculta

**Solución:**
1. Asegúrate de llamar a `hideLoading()` en un bloque `finally`
2. Verifica que no haya errores en la consola
3. Usa el helper `withLoading` para manejo automático

### Problema: El componente no aparece

**Solución:**
1. Verifica que `app.vue` incluye el componente `<AppLoading />`
2. Revisa la consola del navegador por errores
3. Asegúrate de que el componente tiene el z-index correcto (9999)

### Problema: Errores de TypeScript

**Solución:**
1. Reinicia el servidor TypeScript en tu editor
2. Verifica que todos los tipos estén correctamente definidos
3. Si usas VS Code, recarga la ventana (Ctrl+Shift+P > Reload Window)

## 🔄 Actualización del Auto-Import

Si el composable no se auto-importa, puedes agregarlo manualmente al archivo de configuración de Nuxt:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**'
    ]
  }
})
```

Después de este cambio, reinicia el servidor.

## ✨ Próximos Pasos

1. **Reiniciar el servidor** (si aún no lo has hecho)
2. **Probar el componente** en `/test-loading`
3. **Integrar en tus páginas** según necesites
4. **Personalizar** colores, logo, animaciones según tu diseño

## 📞 Soporte

Si tienes problemas con la implementación:

1. Revisa la documentación completa en `docs/APP_LOADING_SYSTEM.md`
2. Visita la página de prueba en `/test-loading` para ver ejemplos
3. Revisa los ejemplos en `components/app/AppLoadingExample.md`

---

**Última actualización:** 2025-10-09  
**Versión:** 1.0.0

