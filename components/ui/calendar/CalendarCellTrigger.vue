<script lang="ts" setup>
import type { CalendarCellTriggerProps } from "reka-ui"
import { computed, type HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CalendarCellTrigger, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'

const props = withDefaults(defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes["class"], weekDayColor?: string | undefined }>(), {
  as: "button",
})

// Recibe el color de disponibilidad
const weekDayColorComputed = computed(() => props.weekDayColor )

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarCellTrigger
    data-slot="calendar-cell-trigger"
    type="button"
    :style="`background-color: ${weekDayColorComputed}`"
    :class="cn(
      buttonVariants({ variant: 'ghost' }),
      // [&[data-today]:not([data-selected])]
      'size-8 p-0 font-normal aria-selected:opacity-100 cursor-pointer border border-[#1D1D1D]',
      'data-[today]:border-0 data-[today]:shadow-[0_0_0_3px_#003DA6] hover:bg-[#003DA6]!',
      // Selected
      'data-[selected]:bg-white! data-[selected]:opacity-100 data-[selected]:hover:bg-[#003DA6]! data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary! data-[selected]:focus:text-primary-foreground',
      // Disabled
      'data-[disabled]:bg-[#EBF4FC]! data-[disabled]:opacity-35 data-[disabled]:cursor-default data-[disabled]:pointer-events-none',
      // Unavailable
      `data-[unavailable]:bg-[#B3B3B3]! data-[unavailable]:cursor-default data-[unavailable]:pointer-events-none`,
      // Outside months
      'data-[outside-view]:invisible',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarCellTrigger>
</template>
