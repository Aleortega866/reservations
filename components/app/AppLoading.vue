<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900"
    >
      <!-- Background overlay con blur opcional -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
      />

      <!-- Contenedor del logo con animación -->
      <div class="relative z-10 flex flex-col items-center justify-center space-y-6">
        <!-- Logo con animación de pulso -->
        <div class="animate-pulse-smooth">
          <img
            src="/assets/mide-logo.svg"
            alt="MIDE Logo"
            class="h-8 w-auto md:h-40 lg:h-24 drop-shadow-2xl"
          />
        </div>

        <!-- Texto de carga opcional -->
        <div v-if="showText" class="text-center">
          <p
            class="text-base font-medium mb-0 pb-0 text-gray-700 dark:text-gray-300 animate-fade-in"
          >
            {{ loadingText }}
          </p>
        </div>

        <!-- Spinner opcional adicional -->
        <div v-if="showSpinner" class="flex space-x-2">
          <div
            v-for="i in 3"
            :key="i"
            class="h-2 w-2 rounded-full bg-secondary dark:bg-primary animate-bounce"
            :style="{ animationDelay: `${i * 0.1}s` }"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  /** Controla la visibilidad del loading */
  isVisible?: boolean;
  /** Muestra el texto de carga */
  showText?: boolean;
  /** Texto personalizado de carga */
  loadingText?: string;
  /** Muestra los puntos animados */
  showSpinner?: boolean;
}

withDefaults(defineProps<Props>(), {
  isVisible: true,
  showText: true,
  loadingText: "Cargando...",
  showSpinner: true,
});
</script>

<style scoped>
/* Animación de pulso suave y personalizada */
@keyframes pulse-smooth {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse-smooth {
  animation: pulse-smooth 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Animación de fade-in para el texto */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

/* Prevenir scroll cuando el loading está activo */
body:has(.fixed.inset-0.z-\[9999\]) {
  overflow: hidden;
}
</style>
