<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon icon="lucide:alert-triangle" class="text-yellow-500" width="20" height="20" />
          {{ title }}
        </DialogTitle>
        <DialogDescription class="text-left">
          {{ message }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-5 mt-6">
        <!-- Botón: Continuar creando mi reservación -->
        <Button 
          @click="handleContinue"
          :disabled="loading"
          class="w-full"
          variant="default"
        >
          <Icon icon="lucide:edit" width="16" height="16" class="mr-2" />
          {{ continueText }}
        </Button>

        <!-- Botón: Guardar y salir -->
        <Button 
          @click="handleSave"
          :disabled="loading"
          class="w-full"
          variant="outline"
        >
          <Icon icon="lucide:save" width="16" height="16" class="mr-2" />
          {{ saveText }}
        </Button>

        <!-- Botón: Perder mi progreso -->
        <Button 
          @click="handleDiscard"
          :disabled="loading"
          class="w-full"
          variant="destructive"
        >
          <Icon icon="lucide:trash-2" width="16" height="16" class="mr-2" />
          {{ discardText }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  continueText?: string
  saveText?: string
  discardText?: string
  loading?: boolean
}

interface Emits {
  (e: 'continue'): void
  (e: 'save'): void
  (e: 'discard'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Cambios sin guardar',
  message: '¡Espera! Estás a punto de salir sin guardar el progreso de tu reservación',
  continueText: 'Continuar creando mi reservación',
  saveText: 'Guardar y salir',
  discardText: 'Perder mi progreso',
  loading: false
})

const emit = defineEmits<Emits>()

const handleContinue = () => {
  if (!props.loading) {
    emit('continue')
  }
}

const handleSave = () => {
  if (!props.loading) {
    emit('save')
  }
}

const handleDiscard = () => {
  if (!props.loading) {
    emit('discard')
  }
}

const handleClose = (open: boolean) => {
  if (!open && !props.loading) {
    emit('close')
  }
}
</script> 
