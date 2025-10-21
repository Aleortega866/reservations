<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { computed } from 'vue'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue ?? '',
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
  <input
    v-model="modelValue"
    data-slot="input"
    :style="inputStyle"
    :class="cn(
      'file:text-foreground placeholder:text-card-foreground/60 selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-full border px-3 py-1 text-base shadow-xs transition-[color,box-shadow,background-color,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:border-[var(--focus-border-color)] focus-visible:ring-[var(--focus-ring-color)]/30 focus-visible:ring-[1px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      props.class,
    )"
  >
</template>
