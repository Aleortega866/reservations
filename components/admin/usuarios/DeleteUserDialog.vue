<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="text-start font-medium">Confirmar Eliminación</DialogTitle>
        <DialogDescription class="text-center pt-4">
          ¿Estás seguro de que deseas eliminar al usuario <br><span class="font-semibold">{{ userName }}</span>?
        </DialogDescription> 
      </DialogHeader>

      <div class="pb-0">
        <p class="text-xs text-center text-muted-foreground italic mb-0 ob-0">
          Esta acción no se puede deshacer. El usuario perderá acceso al sistema permanentemente.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          Cancelar
        </Button>
        <Button type="button" variant="destructive" @click="handleConfirm" :disabled="isDeleting">
          <Icon v-if="isDeleting" icon="lucide:loader-circle" width="16" height="16" class="mr-2 animate-spin" />
          Eliminar Usuario
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'

interface Props {
  open: boolean
  userName: string
  userId: string | number
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', userId: string | number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDeleting = ref(false)

// Exponer el estado para que el componente padre pueda acceder
defineExpose({
  isDeleting
})

const handleConfirm = async () => {
  if (isDeleting.value) return // Prevenir doble clic
  
  isDeleting.value = true
  try {
    await emit('confirm', props.userId)
  } finally {
    // No resetear isDeleting aquí - el componente padre se encarga
  }
}
</script>
