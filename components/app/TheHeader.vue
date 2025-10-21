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

      <div class="flex justify-end">
        <!-- Navegación -->
        <div class="flex space-x-4 items-center">
          <NuxtLink to="/usuarios" class="nav-link">Usuarios</NuxtLink>
          <NuxtLink to="/reservaciones" class="nav-link">Reservaciones</NuxtLink>
          <NuxtLink to="/cursosytalleres" class="nav-link">Cursos y Talleres</NuxtLink>
          <NuxtLink to="/admingeneral" class="nav-link">Admin General</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Título centrado -->
    <h1 class="text-xl font-semibold text-start ps-2 pb-2">Sistema de Gestión</h1>
  </div>
</template>

<script setup lang="ts">
// Lógica del componente aquí
</script>

<style scoped></style>
