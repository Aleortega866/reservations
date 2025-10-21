<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle class="text-lg text-left font-bold">
          Editar sobre cupo permitido
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent.stop="onSubmit" class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="overSlot">Sobre cupo permitido</Label>
          <Input 
            id="overSlot" 
            v-model.number="localOverSlot" 
            type="number"
            min="0"
            step="1"
            placeholder="Ej. 600" 
            :disabled="loading"
          />
          <p v-if="errors.overSlot" class="text-sm text-destructive">{{ errors.overSlot }}</p>
          <p class="text-xs text-muted-foreground">
            Valor actual: {{ currentOverSlot }}
          </p>
        </div>

        <div v-if="error" class="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p class="text-destructive text-sm">{{ error }}</p>
        </div>

        <DialogFooter class="mt-3">
          <Button type="button" variant="outline" @click="isOpen = false" :disabled="loading">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            :disabled="loading || isSubmitting"
          >
            <Icon v-if="loading" icon="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@iconify/vue'

interface Props {
  open: boolean
  currentOverSlot: number
  dayId: number
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('open', { default: false })
const loading = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const localOverSlot = ref<number>(props.currentOverSlot)

const errors = reactive<{ overSlot?: string }>({})

const validate = () => {
  errors.overSlot = ''
  
  if (localOverSlot.value === null || localOverSlot.value === undefined) {
    errors.overSlot = 'El valor es requerido'
    return false
  }
  
  if (localOverSlot.value < 0) {
    errors.overSlot = 'El valor debe ser mayor o igual a 0'
    return false
  }
  
  if (!Number.isInteger(localOverSlot.value)) {
    errors.overSlot = 'El valor debe ser un número entero'
    return false
  }
  
  return true
}

const emit = defineEmits<{
  (e: 'save', payload: { dayId: number; overSlot: number }): Promise<void>
}>()

const onSubmit = async () => {
  // Prevenir múltiples ejecuciones
  if (loading.value || isSubmitting.value) return
  
  if (!validate()) return
  
  loading.value = true
  isSubmitting.value = true
  error.value = null
  
  try {
    await emit('save', { dayId: props.dayId, overSlot: localOverSlot.value })
    isOpen.value = false
  } catch (err: any) {
    error.value = err?.message || 'Error al guardar'
  } finally {
    loading.value = false
    isSubmitting.value = false
  }
}

// Resetear estado cuando se cierre el diálogo
watch(isOpen, (newValue) => {
  if (!newValue) {
    loading.value = false
    isSubmitting.value = false
    error.value = null
    localOverSlot.value = props.currentOverSlot
  }
})

// Actualizar el valor local cuando cambie la prop
watch(() => props.currentOverSlot, (newValue) => {
  localOverSlot.value = newValue
})
</script>
