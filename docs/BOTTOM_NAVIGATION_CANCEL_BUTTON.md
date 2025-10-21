# BottomNavigation con Botón de Cancelar

## Descripción

El componente `BottomNavigation` ha sido actualizado para incluir un botón de cancelación expandible que se muestra cuando se proporciona un `reservationId`. Este botón permite a los usuarios cancelar sus reservaciones de manera intuitiva.

## Características

### Botón de Cancelación
- **Expandible**: Se expande para mostrar el texto "No podré asistir a mi reservación"
- **Animación suave**: Transiciones CSS fluidas
- **Diálogo de opciones**: Muestra diferentes motivos de cancelación
- **Integración completa**: Funciona con el sistema de reservaciones existente
- **Condiciones específicas**: Solo aparece en ediciones con pasos completos

### Comportamiento Condicional
- **Con `reservationId` + `areAllStepsComplete`**: Muestra botón de cancelar + botón de chat en columna
- **Sin `reservationId` o pasos incompletos**: Muestra solo el botón de chat
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Props

```typescript
interface Props {
  showReservationButton: boolean;  // Mostrar botón de nueva reservación
  showFooter?: boolean;            // Mostrar footer (default: true)
  reservationId?: number | null;   // ID de reservación para mostrar botón de cancelar
  areAllStepsComplete?: boolean;   // Indica si todos los pasos están completos (default: false)
}
```

## Eventos

```typescript
interface Emits {
  openChat: [];                    // Chat abierto
  showReservationButton: [];       // Botón de reservación clickeado
  cancelReservation: [];           // Cancelación iniciada
  cancelOptionSelected: [option: string]; // Opción de cancelación seleccionada
}
```

## Uso

### Ejemplo Básico (Solo Chat)
```vue
<template>
  <BottomNavigation 
    :show-reservation-button="true"
    @open-chat="handleOpenChat"
  />
</template>
```

### Ejemplo con Cancelación
```vue
<template>
  <BottomNavigation 
    :show-reservation-button="true"
    :reservation-id="123"
    :are-all-steps-complete="true"
    @open-chat="handleOpenChat"
    @cancel-reservation="handleCancelReservation"
    @cancel-option-selected="handleCancelOption"
  />
</template>

<script setup>
const handleOpenChat = () => {
  console.log('Chat abierto');
};

const handleCancelReservation = () => {
  console.log('Cancelación iniciada');
};

const handleCancelOption = (option: string) => {
  console.log('Opción seleccionada:', option);
  // Opciones disponibles:
  // - 'conflictos-agenda'
  // - 'organizacion-grupo'
  // - 'transporte-presupuesto'
  // - 'institucion-cancelo'
  // - 'ninguna'
};
</script>
```

## Opciones de Cancelación

El diálogo de cancelación ofrece las siguientes opciones:

1. **Conflictos con la agenda**
2. **Organización del grupo**
3. **Transporte y presupuesto**
4. **La institución en la reservación canceló la visita**
5. **Ninguna de las anteriores**

## Estilos y Animaciones

### Animación de Expansión
- Duración: 0.4s (entrada) / 0.3s (salida)
- Easing: ease-out / ease-in
- Efecto: Expansión de ancho con fade del contenido

### Colores
- **Botón de cancelar**: `bg-destructive` (rojo)
- **Botón de chat**: `bg-[#003DA6]` (azul MIDE)
- **Hover effects**: Transiciones suaves

## Integración con Reservaciones

El componente se integra perfectamente con:
- `CancelReservationDialog`: Diálogo de opciones de cancelación
- Sistema de eventos de Vue
- Router de Nuxt para navegación
- Sistema de notificaciones

## Responsive Design

- **Mobile**: Botones en columna cuando hay `reservationId`
- **Desktop**: Botones alineados a la derecha
- **Adaptativo**: Se ajusta según el tamaño de pantalla

## Dependencias

- `@/components/ui/button`
- `@/components/ui/sidebar`
- `@/components/reservations/dialogs/CancelReservationDialog`
- `@iconify/vue`
- `vue-router`

## Notas de Implementación

1. El botón de cancelar solo se muestra cuando se proporciona `reservationId` Y `areAllStepsComplete` es `true`
2. Las animaciones están optimizadas para rendimiento
3. El componente mantiene compatibilidad con versiones anteriores
4. Los eventos se emiten correctamente para integración con componentes padre
5. **Condiciones específicas**: El botón de cancelar solo aparece en ediciones (no en nuevas reservaciones) y cuando los 3 pasos están completos
