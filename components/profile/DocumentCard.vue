<template>
  <div class="flex flex-col items-center space-y-2">
    <div class="w-full h-24 bg-muted-foreground/10 rounded-md flex items-center justify-center">
      <Icon icon="fa6-solid:file-pdf" class="text-muted-foreground w-10 h-10" />
    </div>
    <div class="flex justify-between w-full items-center space-x-1 pl-1">

      <Label :for="document.id" class="text-xs italic text-muted-foreground">{{ document.name }}</Label>
      <Icon 
      icon="ic:baseline-delete" class="text-muted-foreground w-4 h-4"
      :id="document.id" 
      :checked="document.checked"
      @update:checked="$emit('update:checked', $event)"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Document } from '@/types/reservations'
import { Icon } from '@iconify/vue'

defineProps<{
  document: Document
}>()

defineEmits<{
  'update:checked': [value: boolean]
}>()
</script> 