<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ message }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="block space-y-2  gap-3 mt-6">
        <Button 
          :variant="confirmVariant" 
          @click="handleConfirm"
          :disabled="loading"
          class="w-full"
        >
          <Icon v-if="loading" icon="lucide:loader-circle" width="16" height="16" class="mr-2 animate-spin" />
          {{ confirmText }}
        </Button>
        <Button 
          variant="outline" 
          @click="handleCancel"
          :disabled="loading"
          class="w-full"
        >
          {{ cancelText }}
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
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  loading?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmar acción',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmVariant: 'default',
  loading: false
})

const emit = defineEmits<Emits>()

const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm')
  }
}

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel')
  }
}

const handleClose = (open: boolean) => {
  if (!open && !props.loading) {
    emit('close')
  }
}
</script>
