<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
    <div class="flex justify-around items-center py-2">
      <!-- Botón de Perfil -->
      <button 
        class="flex flex-col items-center p-2 rounded-lg transition-colors"
        :class="activeTab === 'profile' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'"
        @click="$emit('navigate', 'profile')"
      >
        <Icon icon="lucide:user" width="20" height="20" class="mb-1" />
        <span class="text-xs">Perfil</span>
      </button>

      <!-- Botón de Reservaciones -->
      <button 
        class="flex flex-col items-center p-2 rounded-lg transition-colors"
        :class="activeTab === 'reservations' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'"
        @click="$emit('navigate', 'reservations')"
      >
        <Icon icon="lucide:calendar" width="20" height="20" class="mb-1" />
        <span class="text-xs">Reservas</span>
      </button>

      <!-- Botón de Talleres -->
      <button 
        class="flex flex-col items-center p-2 rounded-lg transition-colors"
        :class="activeTab === 'workshops' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'"
        @click="$emit('navigate', 'workshops')"
      >
        <Icon icon="lucide:book-open" width="20" height="20" class="mb-1" />
        <span class="text-xs">Talleres</span>
      </button>

      <!-- Botón de Chat -->
      <button 
        class="flex flex-col items-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        @click="$emit('openChat')"
      >
        <Icon icon="lucide:message-circle" width="20" height="20" class="mb-1" />
        <span class="text-xs">Chat</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  activeTab: {
    type: String,
    default: 'profile'
  }
})

defineEmits(['navigate', 'openChat'])
</script> 