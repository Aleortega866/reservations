<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center px-4">
    <!-- Logo MIDE -->
    <div class="mb-8">
      <img
        src="/assets/logo-header.svg"
        alt="MIDE - Museo Interactivo de Economía"
        class="w-32 h-auto mx-auto"
      />
    </div>

    <!-- Contenido Principal -->
    <div class="text-center max-w-md mx-auto">
      <!-- Título -->
      <h1 class="text-4xl font-bold text-primary mb-4">404</h1>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Página no encontrada</h2>
      <p class="text-gray-600 mb-8">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>

      <!-- Botones según estado de autenticación -->
      <div class="space-y-4">
        <!-- Si NO está logueado -->
        <template v-if="!isAuthenticated || !hasValidToken">
          <Button
            @click="goToLogin"
            class="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            <Icon icon="material-symbols:login" class="w-5 h-5 mr-2" />
            Ir al Login
          </Button>

          <!-- <Button @click="goToHome" variant="outline" class="w-full" size="lg">
            <Icon icon="material-symbols:home" class="w-5 h-5 mr-2" />
            Página de Inicio
          </Button> -->
        </template>

        <!-- Si SÍ está logueado -->
        <template v-else>
          <!-- <Button
            @click="goToReservations"
            class="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            <Icon icon="material-symbols:calendar-today" class="w-5 h-5 mr-2" />
            Mis Reservaciones
          </Button> -->

          <Button @click="goToHome" variant="outline" class="w-full" size="lg">
            <Icon icon="material-symbols:home" class="w-5 h-5 mr-2" />
            Ir al Inicio
          </Button>
        </template>

        <!-- Botón de ayuda -->
        <Button @click="goToHelp" variant="ghost" class="w-full text-gray-500">
          <Icon icon="material-symbols:help" class="w-4 h-4 mr-2" />
          ¿Necesitas ayuda?
        </Button>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="mt-12 text-center text-sm text-gray-500">
      <p>Museo Interactivo de Economía (MIDE)</p>
      <p>Si el problema persiste, contacta a soporte técnico</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";

// Meta para la página
definePageMeta({
  layout: false, // Sin layout para página completa
  title: "Página no encontrada - MIDE",
  // Asegurar que esta página se ejecute para rutas 404
  middleware: [],
});

// Composables
const router = useRouter();
const authStore = useAuthStore();

// Verificación de autenticación
const isAuthenticated = computed(() => authStore.isAuthenticated);
const hasValidToken = computed(() => {
  const token = authStore.token;
  return token && token.trim() !== "";
});

// Funciones de navegación
const goToLogin = () => {
  console.log("🔐 Redirigiendo al login desde página 404");
  router.push("/auth/login?from=404&redirected=true");
};

const goToReservations = () => {
  console.log("📅 Redirigiendo a reservaciones desde página 404");
  router.push("/reservations");
};

const goToHome = () => {
  console.log("🏠 Redirigiendo al inicio desde página 404");
  router.push("/");
};

const goToHelp = () => {
  console.log("❓ Redirigiendo a ayuda desde página 404");
  // Aquí podrías redirigir a una página de ayuda o abrir un chat
  router.push("/legal-information");
};

// Log de la página 404
console.log("🚫 Página 404 accedida:", router.currentRoute.value.path);
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
