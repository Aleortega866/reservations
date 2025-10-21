<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { computed } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

// Computed property para determinar si el input tiene contenido
const hasContent = computed(() => {
  const value = modelValue.value
  return value !== undefined && value !== null && String(value).trim() !== ''
})

// Computed property para el estilo de fondo y border dinámico
const inputStyle = computed(() => {
  const color = hasContent.value 
    ? 'var(--color-input-filled)' 
    : 'var(--color-input-empty)'
  
  return {
    backgroundColor: color,
    borderColor: color
  }
})
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :style="inputStyle"
    :class="cn('border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-secondary/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', props.class)"
  />
</template>
