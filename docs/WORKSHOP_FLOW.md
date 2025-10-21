# Flujo Completo de Talleres

## Descripción
Este documento describe el flujo completo para la selección y visualización de talleres en el sistema de reservaciones del MIDE.

## Componentes Principales

### 1. Store de Talleres (`stores/workshops.ts`)
- **Propósito**: Manejar el estado global de los talleres
- **Funcionalidades**:
  - Almacenar talleres disponibles
  - Gestionar talleres seleccionados
  - Manejar horarios seleccionados
  - Proporcionar funciones para toggle de selección

### 2. Vista de Reservación (`components/reservations/steps/ReservationStep3.vue`)
- **Propósito**: Mostrar talleres seleccionados y permitir navegación
- **Estados**:
  - **Sin talleres**: Muestra card para seleccionar talleres
  - **Con talleres**: Muestra grilla de talleres seleccionados
- **Funcionalidades**:
  - Navegar a vista de talleres
  - Visualizar contenido de talleres
  - Botón "Modificar talleres"

### 3. Vista de Talleres (`pages/workshops/index.vue`)
- **Propósito**: Permitir selección de talleres y horarios
- **Funcionalidades**:
  - Listar talleres disponibles
  - Seleccionar/deseleccionar talleres
  - Seleccionar horarios
  - Regresar a vista de reservación

### 4. Visor de Contenido (`components/workshops/WorkshopContentViewer.vue`)
- **Propósito**: Mostrar contenido multimedia de talleres
- **Tipos de contenido soportados**:
  - **Video**: Reproducción de archivos MP4
  - **PDF**: Visualización de documentos PDF
  - **Imagen**: Visualización de imágenes

## Flujo de Usuario

### 1. Estado Inicial
```
Usuario en ReservationStep3 → No hay talleres seleccionados
↓
Muestra card "Por favor selecciona talleres"
```

### 2. Selección de Talleres
```
Usuario hace clic en card → Navega a /workshops
↓
Vista de talleres muestra opciones disponibles
↓
Usuario selecciona talleres y horarios
↓
Usuario hace clic en "Terminar" → Regresa a ReservationStep3
```

### 3. Visualización de Contenido
```
Usuario en ReservationStep3 → Ve talleres seleccionados
↓
Usuario hace clic en taller → Abre modal con contenido
↓
Modal muestra video/PDF/imagen según tipo
```

### 4. Modificación de Talleres
```
Usuario hace clic en "Modificar talleres" → Navega a /workshops
↓
Vista de talleres muestra selecciones actuales
↓
Usuario modifica selecciones
↓
Usuario hace clic en "Terminar" → Regresa con nuevas selecciones
```

## Datos Dummy

### Talleres Disponibles
1. **Taller Uno** - Imagen (Introducción a la ciencia básica)
2. **Taller Dos** - PDF (Experimentos de química)
3. **Taller Tres** - Video (Robótica educativa)
4. **Taller Cuatro** - PDF (Programación para niños)
5. **Taller Cinco** - Imagen (Astronomía básica)
6. **Taller Seis** - Video (Energías renovables)

### Estructura de Datos
```typescript
interface Workshop {
  id: string
  title: string
  description: string
  duration: string
  location: string
  type: 'video' | 'pdf' | 'image'
  contentUrl?: string
  thumbnail?: string
  timeSlots: string[]
}
```

## Integración con API

### Preparación para API
- El store está estructurado para facilitar la integración
- Las funciones de toggle están preparadas para manejar respuestas de API
- Los datos dummy se pueden reemplazar fácilmente con datos reales

### Endpoints Sugeridos
- `GET /api/workshops` - Obtener talleres disponibles
- `POST /api/workshops/select` - Seleccionar talleres
- `GET /api/workshops/{id}/content` - Obtener contenido del taller

## Funcionalidades de Prueba

### Botón "+ Test"
- Agrega talleres aleatorios para probar la funcionalidad
- Útil para desarrollo y testing
- Se puede remover en producción

### Navegación Temporal
- Usa `window.location.href` para navegación
- Se reemplazará con router de Nuxt cuando esté disponible

## Próximos Pasos

1. **Implementar navegación real** con Nuxt Router
2. **Conectar con API** para datos reales
3. **Agregar validaciones** de selección
4. **Implementar persistencia** de datos
5. **Agregar animaciones** y transiciones
6. **Optimizar carga** de contenido multimedia 