<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  ToggleGroupItem as RekaToggleGroupItem,
  type ToggleGroupItemProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<ToggleGroupItemProps & { class?: HTMLAttributes['class'] }>()

const emits = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RekaToggleGroupItem
    data-slot="toggle-group-item"
    v-bind="forwarded"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      'data-[state=on]:bg-white data-[state=on]:text-blue-600 data-[state=on]:shadow-sm',
      'data-[state=off]:text-gray-500 hover:text-gray-700',
      props.class,
    )"
  >
    <slot />
  </RekaToggleGroupItem>
</template>
