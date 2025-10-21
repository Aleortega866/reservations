<template>
  <Button 
    :variant="variant" 
    :size="size" 
    :class="buttonClass"
    @click="$emit('click')"
  >
    <Icon icon="lucide:message-circle-plus" width="16" height="16" />
    <span v-if="showText" class="ml-2">{{ text }}</span>
  </Button>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  text?: string
  showText?: boolean
  iconClass?: string
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'lg',
  text: 'Chat!',
  showText: true,
  iconClass: 'w-4 h-4',
  buttonClass: 'flex items-center justify-center'
})

defineEmits<{
  click: []
}>()
</script> 