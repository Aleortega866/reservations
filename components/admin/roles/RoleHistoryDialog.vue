<template>
  <Dialog v-model:open="isOpen" :max-width="1000">
    <DialogContent class="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <History class="h-5 w-5" />
          Historial de Modificaciones - {{ roleName }}
        </DialogTitle>
        <DialogDescription>
          Registro completo de todas las modificaciones realizadas en este rol
        </DialogDescription>
      </DialogHeader>

      <ModificationHistory
        :role-id="roleId"
        :role-name="roleName"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { History } from 'lucide-vue-next'
import ModificationHistory from './ModificationHistory.vue'

// Props
interface Props {
  open: boolean
  roleId: string
  roleName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Computed
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})
</script>
