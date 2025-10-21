# App Components

Esta carpeta contiene componentes globales de la aplicación.

---

# AppLoading Component

## Descripción
Componente de loading global que ocupa el 100% de la pantalla con un logo animado con efecto de pulso. Perfecto para mostrar antes de entrar a cualquier página o durante procesos largos.

## Características
- ✅ Ocupa el 100% de la pantalla (fullscreen)
- ✅ Z-index máximo (9999) para estar sobre todo
- ✅ Logo con animación de pulso personalizada
- ✅ Transiciones suaves de entrada/salida
- ✅ Soporte para modo oscuro
- ✅ Control global mediante composable `useAppLoading()`

## Uso Rápido

```vue
<script setup>
const { showLoading, hideLoading } = useAppLoading()

// Mostrar loading
showLoading('Cargando datos...')

// Ocultar loading
hideLoading()
</script>
```

## Documentación Completa
Ver `AppLoadingExample.md` para ejemplos detallados y documentación completa de la API.

## Página de Prueba
Visita `/test-loading` para ver ejemplos interactivos del componente.

---

# DesktopNavigation Component

## Descripción
Componente de navegación desktop reutilizable que proporciona una barra de navegación horizontal para pantallas grandes (≥1024px).

## Características
- ✅ **Responsive**: Solo visible en pantallas grandes (`lg:`)
- ✅ **Configurable**: Props para mostrar/ocultar botones
- ✅ **Reutilizable**: Puede usarse en cualquier página
- ✅ **Personalizable**: Slot para botones personalizados
- ✅ **Consistente**: Mantiene el diseño del sistema

## Uso Básico

```vue
<template>
  <DesktopNavigation 
    title="Mi Página"
    :show-new-reservation-button="true"
    :show-material-button="false"
    @new-reservation="handleNewReservation"
  />
</template>

<script setup>
import DesktopNavigation from '@/components/app/DesktopNavigation.vue'

const handleNewReservation = () => {
  console.log('Nueva reservación')
}
</script>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | String | 'Mi Aplicación' | Título mostrado en la barra |
| `showNewReservationButton` | Boolean | true | Mostrar botón "Nueva Reservación" |
| `showMaterialButton` | Boolean | false | Mostrar botón "Material Didáctico" |

## Events

| Event | Descripción |
|-------|-------------|
| `new-reservation` | Emitido al hacer clic en "Nueva Reservación" |
| `material-click` | Emitido al hacer clic en "Material Didáctico" |
| `custom-action` | Emitido para acciones personalizadas |

## Slots

| Slot | Descripción |
|------|-------------|
| `custom-buttons` | Para agregar botones personalizados |

## Ejemplo con Botones Personalizados

```vue
<template>
  <DesktopNavigation 
    title="Perfil"
    :show-new-reservation-button="false"
    :show-material-button="false"
  >
    <template #custom-buttons>
      <Button @click="handleEdit">
        <Icon icon="mdi:pencil" />
        Editar
      </Button>
      <Button @click="handleSettings">
        <Icon icon="mdi:cog" />
        Configuración
      </Button>
    </template>
  </DesktopNavigation>
</template>
```

## Estructura del Componente

```
DesktopNavigation
├── Título/Logo (izquierda)
├── Botones de Acción (centro)
│   ├── Nueva Reservación (opcional)
│   ├── Material Didáctico (opcional)
│   └── Botones Personalizados (slot)
└── Botón del Menú (derecha)
```

## Responsive Behavior

- **Desktop (≥1024px)**: Muestra la barra de navegación
- **Móvil (<1024px)**: Oculta completamente (`hidden lg:block`)

## Integración con Sidebar

El componente incluye automáticamente el botón para abrir el sidebar usando `useSidebar()`.
