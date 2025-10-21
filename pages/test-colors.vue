<template>
  <div class="min-h-screen p-8 space-y-8 bg-background text-foreground">
    <div class="space-y-4">
      <h1 class="text-3xl font-bold">Prueba de Colores</h1>
      <button 
        @click="toggleTheme" 
        class="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
      >
        {{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>
    </div>

    <!-- Pruebas básicas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Primary -->
      <div class="p-6 bg-primary text-primary-foreground rounded-lg">
        <h3 class="text-lg font-semibold">Primary</h3>
        <p>Este es el color primario</p>
      </div>

      <!-- Secondary -->
      <div class="p-6 bg-secondary text-secondary-foreground rounded-lg">
        <h3 class="text-lg font-semibold">Secondary</h3>
        <p>Este es el color secundario</p>
      </div>

      <!-- Muted -->
      <div class="p-6 bg-muted text-muted-foreground rounded-lg">
        <h3 class="text-lg font-semibold">Muted</h3>
        <p>Este es el color muted</p>
      </div>
    </div>

    <!-- Colores de estado -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Destructive -->
      <div class="p-4 bg-destructive text-destructive-foreground rounded-lg">
        <h4 class="font-semibold">Destructive</h4>
        <p class="text-sm">Peligro</p>
      </div>

      <!-- Warning -->
      <div class="p-4 bg-warning text-warning-foreground rounded-lg">
        <h4 class="font-semibold">Warning</h4>
        <p class="text-sm">Advertencia</p>
      </div>

      <!-- Success -->
      <div class="p-4 bg-success text-success-foreground rounded-lg">
        <h4 class="font-semibold">Success</h4>
        <p class="text-sm">Éxito</p>
      </div>

      <!-- Info -->
      <div class="p-4 bg-info text-info-foreground rounded-lg">
        <h4 class="font-semibold">Info</h4>
        <p class="text-sm">Información</p>
      </div>
    </div>

    <!-- Card example -->
    <div class="p-6 bg-card text-card-foreground border border-border rounded-lg">
      <h3 class="text-xl font-semibold mb-4">Card Example</h3>
      <p class="text-muted-foreground mb-4">
        Esta es una card con bordes y colores apropiados.
      </p>
      <div class="flex gap-2">
        <button class="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
          Primary Button
        </button>
        <button class="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm">
          Secondary Button
        </button>
      </div>
    </div>

    <!-- Input example -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold">Form Elements</h3>
      <input 
        type="text" 
        placeholder="Campo de entrada" 
        class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div class="p-4 bg-accent text-accent-foreground rounded-lg">
        <p>Elemento con color accent</p>
      </div>
    </div>

    <!-- Debug info -->
    <div class="p-4 bg-muted text-muted-foreground rounded-lg text-sm">
      <h4 class="font-semibold mb-2">Debug Info:</h4>
      <p>Tema actual: {{ isDark ? 'Oscuro' : 'Claro' }}</p>
      <p>Color mode: {{ colorMode.value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Auto-importados por Nuxt
const colorMode = useColorMode()
// @ts-ignore
const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// @ts-ignore
definePageMeta({
  title: 'Test de Colores'
})
</script>

<style scoped>
/* Forzar aplicación de clases de Tailwind */
.bg-primary { background-color: hsl(var(--primary)); }
.text-primary-foreground { color: hsl(var(--primary-foreground)); }
.bg-secondary { background-color: hsl(var(--secondary)); }
.text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
.bg-muted { background-color: hsl(var(--muted)); }
.text-muted-foreground { color: hsl(var(--muted-foreground)); }
.bg-destructive { background-color: hsl(var(--destructive)); }
.text-destructive-foreground { color: hsl(var(--destructive-foreground)); }
.bg-warning { background-color: hsl(var(--warning)); }
.text-warning-foreground { color: hsl(var(--warning-foreground)); }
.bg-success { background-color: hsl(var(--success)); }
.text-success-foreground { color: hsl(var(--success-foreground)); }
.bg-info { background-color: hsl(var(--info)); }
.text-info-foreground { color: hsl(var(--info-foreground)); }
.bg-background { background-color: hsl(var(--background)); }
.text-foreground { color: hsl(var(--foreground)); }
.bg-card { background-color: hsl(var(--card)); }
.text-card-foreground { color: hsl(var(--card-foreground)); }
.border-border { border-color: hsl(var(--border)); }
.border-input { border-color: hsl(var(--input)); }
.bg-accent { background-color: hsl(var(--accent)); }
.text-accent-foreground { color: hsl(var(--accent-foreground)); }
.focus\:ring-ring:focus { --tw-ring-color: hsl(var(--ring)); }
</style>
