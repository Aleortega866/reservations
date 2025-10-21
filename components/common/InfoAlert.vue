<template>
  <div class="flex items-start space-x-2">
    <Icon :icon="icon" :width="iconSize" :height="iconSize" :class="[iconColor]" />
    <div class="flex-1">
      <p :class="[messageSize, messageFontStyle, messageClass]">
        <span>
          <slot>{{ message }}</slot>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

export interface InfoAlertProps {
  /** Mensaje a mostrar en la alerta */
  message?: string;
  /** Tipo de fuente para la alerta */
  messageFontStyle?: string;
  /** Tamaño de fuente para la alerta */
  messageSize?: string;
  /** Estilos de clases para la alerta */
  messageClass?: string;
  /** Icono a mostrar (Iconify icon name) */
  icon?: string;
  /** Tamaño del icono */
  iconSize?: string | number;
  /** Color del icono */
  iconColor?: string;
}

withDefaults(defineProps<InfoAlertProps>(), {
  icon: "ri:information-2-fill",
  iconSize: 20,
  iconColor: "text-[#003DA6]",
  messageFontStyle: "italic",
  messageSize: "text-xs",
  messageClass: "text-card-foreground",
});
</script>
