<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
    <div class="flex justify-between items-center max-w-md mx-auto">
      <Button 
        class="bg-muted-foreground rounded-full hover:bg-muted-foreground/90"
        @click="navigateToReservations"
      >
        <Icon icon="lucide:plus" width="16" height="16" class="mr-1" />
        Nueva reservación
      </Button>
      <button 
        variant="ghost" 
        class="flex items-center space-x-2"
        @click="openChat"
      >
        <span class="inline font-medium text-muted-foreground">Chat!</span>
        <Icon icon="lucide:message-circle-plus" width="22" height="22" />
        
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Emitir eventos para comunicación con el componente padre
const emit = defineEmits<{
  openChat: []
}>()

const navigateToReservations = () => {
  // Navegar directamente al formulario de reservación
  router.push('/reservations/formulario-reservacion')
}

const openChat = () => {
  emit('openChat')
}
</script> 