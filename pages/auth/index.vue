<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <!-- Loading durante redirección -->
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
      ></div>
      <p class="text-gray-600">Redirigiendo al login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

// Meta para la página
definePageMeta({
  layout: false, // Sin layout para página completa
  title: "Autenticación - MIDE",
});

// Router
const router = useRouter();

// Redirigir al login al montar el componente
onMounted(() => {
  console.log("🔄 Redirigiendo desde /auth/ al login");
  router.push("/auth/login");
});

// Log de la página de auth
console.log("🚫 Página /auth/ accedida - redirigiendo al login");
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
