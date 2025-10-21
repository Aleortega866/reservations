<template>
  <div class="relative border-b-0 shadow-lg">
    <div class="grid grid-cols-3 gap-4 pt-8 pb-4 px-2">
      <!-- Botón de retroceso (posición absoluta izquierda) -->
      <div class="flex justify-start">
        <!-- Espacio para botón de retroceso si es necesario -->
      </div>

      <!-- Logo centrado -->
      <div class="flex justify-center mb-3">
        <img src="/assets/logo-header.svg" alt="logo" class="w-20 h-auto" />
      </div>

      <div class="flex justify-end items-center gap-4">
        <!-- Navegación principal -->
        <div class="flex space-x-4">
          <NuxtLink to="/usuarios" class="nav-link">Usuarios</NuxtLink>
          <NuxtLink to="/reservaciones" class="nav-link">Reservaciones</NuxtLink>
          <NuxtLink to="/cursosytalleres" class="nav-link">Cursos y Talleres</NuxtLink>
          <NuxtLink to="/admingeneral" class="nav-link">Admin General</NuxtLink>
        </div>

        <!-- Acciones del usuario -->
        <div class="flex items-center gap-2">
          <!-- Enlace a notificaciones -->
          <NuxtLink
            v-if="visitorId"
            to="/notifications-new"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Icon icon="lucide:bell" class="h-4 w-4" />
          </NuxtLink>

          <!-- Menú de usuario -->
          <Button
            variant="ghost"
            size="icon"
            class="w-6 h-6 p-2 bg-primary text-white rounded-full z-10"
          >
            <Icon icon="lucide:user" class="h-4 w-4" style="color: #fff !important" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Título centrado -->
    <h1 class="text-xl font-semibold text-start ps-2 pb-2">Sistema de Gestión</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";

// Obtener el ID del visitante (esto debería venir del store de autenticación)
const visitorId = ref<number | null>(null);

// Lifecycle
onMounted(() => {
  // TODO: Obtener el visitorId del store de autenticación
  // Por ahora usamos un valor de ejemplo
  visitorId.value = 1;
});
</script>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors;
}
</style>
