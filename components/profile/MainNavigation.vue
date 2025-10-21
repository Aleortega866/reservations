<template>
  <nav class="bg-background border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-foreground">Mi Aplicación</h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <button 
            class="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
            @click="$emit('navigate', 'profile')"
          >
            Perfil
          </button>
          <button 
            class="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
            @click="$emit('navigate', 'reservations')"
          >
            Reservaciones
          </button>
          <button 
            class="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
            @click="$emit('navigate', 'workshops')"
          >
            Talleres
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineEmits(['navigate'])
</script> 