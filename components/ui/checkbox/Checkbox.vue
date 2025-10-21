<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
  CheckboxRootProps & {
    class?: HTMLAttributes["class"];
    variant?:
      | "default"
      | "secondary"
      | "institutional"
      | "primary"
      | "accent"
      | "warning";
  }
>();

const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, "class", "variant");

const forwarded = useForwardPropsEmits(delegatedProps, emits);

// Función para obtener las clases CSS según la variante
const getVariantClasses = () => {
  const baseClasses =
    "peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-[10px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

  const variantClasses = {
    default:
      "data-[state=checked]:bg-institutional data-[state=checked]:text-institutional-foreground data-[state=checked]:border-institutional",
    secondary:
      "border-secondary bg-white data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:border-secondary",
    institutional:
      "data-[state=checked]:bg-institutional data-[state=checked]:text-institutional-foreground data-[state=checked]:border-institutional",
    primary:
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
    accent:
      "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[state=checked]:border-accent",
    warning:
      "data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground data-[state=checked]:border-warning",
  };

  const variant = props.variant || "default";
  return cn(baseClasses, variantClasses[variant]);
};
</script>

<template>
  <CheckboxRoot
    data-slot="checkbox"
    v-bind="forwarded"
    :class="cn(getVariantClasses(), props.class)"
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="flex items-center justify-center text-current transition-none"
    >
      <slot>
        <Icon icon="material-symbols:check" width="21" height="21" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
