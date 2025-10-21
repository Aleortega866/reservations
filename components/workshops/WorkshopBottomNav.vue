<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
    <div class="flex justify-between items-center">
      <Button class="bg-muted-foreground hover:bg-muted-foreground/90 text-background" @click="navigateToReservations">
        <Icon icon="lucide:plus" width="16" height="16" class="mr-2" />
        Nueva reservación
      </Button>
      <Button variant="ghost" class="flex items-center space-x-2" @click="$emit('openChat')">
        <Icon icon="lucide:message-circle" width="16" height="16" />
        <span>Chat!</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

defineEmits<{
  (e: 'openChat'): void
}>()

const navigateToReservations = () => {
  // Navegar directamente al formulario de reservación
  router.push('/reservations/formulario-reservacion')
}
</script> 