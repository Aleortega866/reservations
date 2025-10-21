<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  ToggleGroupRoot,
  type ToggleGroupRootEmits,
  type ToggleGroupRootProps,
  ToggleGroupItem,
  type ToggleGroupItemProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<ToggleGroupRootProps & { class?: HTMLAttributes['class'] }>()

const emits = defineEmits<ToggleGroupRootEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ToggleGroupRoot
    data-slot="toggle-group"
    v-bind="forwarded"
    :class="cn(
      'inline-flex items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500',
      props.class,
    )"
  >
    <slot />
  </ToggleGroupRoot>
</template>
