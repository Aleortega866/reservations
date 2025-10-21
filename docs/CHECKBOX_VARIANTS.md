# 🎨 Variantes del Componente Checkbox

## Descripción

El componente `Checkbox` ha sido mejorado para incluir múltiples variantes de colores que se adaptan a la paleta de colores institucional del proyecto. Cada variante utiliza los colores definidos en el sistema de diseño.

## Variantes Disponibles

### 1. **Default** (Institutional)
- **Color**: Verde institucional (#7FA821)
- **Uso**: Variante por defecto, ideal para elementos principales
- **Ejemplo**: `variant="default"`

### 2. **Secondary** 
- **Color**: Azul secundario (#2B8CE6)
- **Uso**: Elementos secundarios, enlaces, acciones complementarias
- **Ejemplo**: `variant="secondary"`

### 3. **Institutional**
- **Color**: Verde institucional (#7FA821)
- **Uso**: Elementos de marca, headers, elementos importantes
- **Ejemplo**: `variant="institutional"`

### 4. **Primary**
- **Color**: Morado primario (#714067)
- **Uso**: Elementos principales, botones CTA, acciones críticas
- **Ejemplo**: `variant="primary"`

### 5. **Accent**
- **Color**: Azul oscuro (#0054A8)
- **Uso**: Elementos de apoyo, badges, información adicional
- **Ejemplo**: `variant="accent"`

### 6. **Warning**
- **Color**: Amarillo (#FFD440)
- **Uso**: Alertas, warnings, elementos que requieren atención
- **Ejemplo**: `variant="warning"`

## Uso Básico

```vue
<template>
  <!-- Variante por defecto (institutional) -->
  <Checkbox />
  
  <!-- Variante secondary -->
  <Checkbox variant="secondary" />
  
  <!-- Variante primary -->
  <Checkbox variant="primary" />
  
  <!-- Variante accent -->
  <Checkbox variant="accent" />
  
  <!-- Variante warning -->
  <Checkbox variant="warning" />
</template>

<script setup>
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
</script>
```

## Estados del Componente

### Estado Normal
```vue
<Checkbox variant="primary" />
```

### Estado Marcado
```vue
<Checkbox variant="primary" :default-value="true" />
```

### Estado Deshabilitado
```vue
<Checkbox variant="primary" disabled />
```

### Estado Indeterminado
```vue
<Checkbox variant="primary" :default-value="'indeterminate'" />
```

## Ejemplos de Uso en Formularios

### Formulario de Preferencias
```vue
<template>
  <div class="space-y-4">
    <h3>Configuración de Notificaciones</h3>
    
    <div class="flex items-center space-x-3">
      <Checkbox variant="primary" id="email" />
      <label for="email">Notificaciones por email</label>
    </div>
    
    <div class="flex items-center space-x-3">
      <Checkbox variant="secondary" id="push" />
      <label for="push">Notificaciones push</label>
    </div>
    
    <div class="flex items-center space-x-3">
      <Checkbox variant="institutional" id="newsletter" />
      <label for="newsletter">Newsletter semanal</label>
    </div>
    
    <div class="flex items-center space-x-3">
      <Checkbox variant="warning" id="marketing" />
      <label for="marketing">Ofertas promocionales</label>
    </div>
  </div>
</template>
```

### Formulario de Términos y Condiciones
```vue
<template>
  <div class="space-y-4">
    <div class="flex items-start space-x-3">
      <Checkbox variant="primary" id="terms" class="mt-1" />
      <div>
        <label for="terms" class="text-sm">
          Acepto los <a href="#" class="text-primary underline">términos y condiciones</a>
        </label>
        <p class="text-xs text-muted-foreground mt-1">
          Al marcar esta casilla, confirmas que has leído y aceptas nuestros términos de servicio.
        </p>
      </div>
    </div>
    
    <div class="flex items-start space-x-3">
      <Checkbox variant="secondary" id="privacy" class="mt-1" />
      <div>
        <label for="privacy" class="text-sm">
          Acepto la <a href="#" class="text-secondary underline">política de privacidad</a>
        </label>
        <p class="text-xs text-muted-foreground mt-1">
          Autorizo el procesamiento de mis datos personales según la política de privacidad.
        </p>
      </div>
    </div>
  </div>
</template>
```

## Uso con v-model

```vue
<template>
  <div class="space-y-4">
    <div class="flex items-center space-x-3">
      <Checkbox 
        variant="primary" 
        v-model="acceptTerms" 
        id="terms" 
      />
      <label for="terms">Acepto los términos</label>
    </div>
    
    <div class="flex items-center space-x-3">
      <Checkbox 
        variant="secondary" 
        v-model="newsletter" 
        id="newsletter" 
      />
      <label for="newsletter">Suscribirse al newsletter</label>
    </div>
    
    <p class="text-sm text-muted-foreground">
      Términos aceptados: {{ acceptTerms }} | Newsletter: {{ newsletter }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'

const acceptTerms = ref(false)
const newsletter = ref(false)
</script>
```

## Uso en Listas y Tablas

### Lista de Selección Múltiple
```vue
<template>
  <div class="space-y-2">
    <h3>Selecciona tus intereses</h3>
    
    <div class="space-y-2">
      <div 
        v-for="interest in interests" 
        :key="interest.id"
        class="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded"
      >
        <Checkbox 
          :variant="interest.variant" 
          v-model="interest.selected" 
          :id="interest.id" 
        />
        <label :for="interest.id" class="text-sm">{{ interest.name }}</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'

const interests = ref([
  { id: 'tech', name: 'Tecnología', variant: 'primary', selected: false },
  { id: 'design', name: 'Diseño', variant: 'secondary', selected: false },
  { id: 'business', name: 'Negocios', variant: 'institutional', selected: false },
  { id: 'marketing', name: 'Marketing', variant: 'accent', selected: false },
  { id: 'events', name: 'Eventos', variant: 'warning', selected: false },
])
</script>
```

## Personalización de Estilos

### Clases CSS Personalizadas
```vue
<template>
  <Checkbox 
    variant="primary" 
    class="scale-125" 
  />
  
  <Checkbox 
    variant="secondary" 
    class="border-2 border-dashed" 
  />
</template>
```

### Combinación con Otros Componentes
```vue
<template>
  <div class="card p-4 space-y-4">
    <h3 class="text-lg font-semibold">Configuración Avanzada</h3>
    
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Checkbox variant="primary" id="feature1" />
          <label for="feature1">Función avanzada 1</label>
        </div>
        <Badge variant="secondary">Beta</Badge>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Checkbox variant="warning" id="feature2" />
          <label for="feature2">Función experimental</label>
        </div>
        <Badge variant="warning">Experimental</Badge>
      </div>
    </div>
  </div>
</template>
```

## Accesibilidad

El componente mantiene todas las características de accesibilidad:

- **Labels asociados**: Usa `for` en labels para asociarlos con el checkbox
- **Estados ARIA**: Incluye `aria-checked`, `aria-disabled`, etc.
- **Navegación por teclado**: Soporte completo para navegación con Tab y Space
- **Contraste**: Los colores cumplen con los estándares de contraste WCAG

```vue
<template>
  <!-- Ejemplo accesible -->
  <div class="flex items-center space-x-3">
    <Checkbox 
      variant="primary" 
      id="accessible-checkbox" 
      aria-describedby="checkbox-help" 
    />
    <label for="accessible-checkbox">Opción accesible</label>
  </div>
  <p id="checkbox-help" class="text-sm text-muted-foreground">
    Descripción adicional para lectores de pantalla
  </p>
</template>
```

## Compatibilidad

- ✅ **Vue 3**: Compatible con Composition API
- ✅ **TypeScript**: Tipado completo
- ✅ **Tailwind CSS**: Utiliza las clases de la paleta de colores
- ✅ **Modo Oscuro**: Adaptación automática de colores
- ✅ **Responsive**: Funciona en todos los tamaños de pantalla

## Paleta de Colores Referencia

| Variante | Color | Hexadecimal | Uso Recomendado |
|----------|-------|-------------|-----------------|
| Default | Verde institucional | #7FA821 | Elementos principales |
| Secondary | Azul secundario | #2B8CE6 | Elementos secundarios |
| Institutional | Verde institucional | #7FA821 | Marca, headers |
| Primary | Morado primario | #714067 | CTA, acciones críticas |
| Accent | Azul oscuro | #0054A8 | Apoyo, badges |
| Warning | Amarillo | #FFD440 | Alertas, warnings |

## Notas de Implementación

- Las variantes utilizan las clases CSS definidas en `assets/css/tailwind.css`
- Los colores se adaptan automáticamente al modo oscuro
- El componente mantiene la funcionalidad completa de `reka-ui`
- Todas las props originales del checkbox siguen funcionando
- La prop `variant` es opcional y por defecto usa `institutional`
