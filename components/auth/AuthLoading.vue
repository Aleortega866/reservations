<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
      ></div>
      <p class="text-gray-600">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Auto-importado por Nuxt
const props = defineProps({
  message: {
    type: String,
    default: "Verificando acceso...",
  },
});
</script>
