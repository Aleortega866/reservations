<template>
  <div class="relative border-b-0 shadow-lg">
    <div class="grid grid-cols-3 gap-4 pt-8 pb-4 px-2">
      <!-- Botón de retroceso (posición absoluta izquierda) -->
      <div class="flex justify-start">
        <Button
          v-if="showBackButton"
          variant="ghost"
          size="icon"
          class="absolute left-2 top-4 text-primary z-10"
          @click="$emit('goBack')"
        >
          <Icon
            icon="ri:arrow-left-line"
            class="text-primary"
            style="height: 25px !important; width: 25px !important"
          />
        </Button>
      </div>

      <!-- Logo centrado -->
      <div class="flex justify-center mb-3">
        <img src="/assets/logo-header.svg" alt="logo" class="w-20 h-auto" />
      </div>

      <div class="flex justify-end">
        <!-- Botón de menú (posición absoluta derecha) -->
        <Button
          variant="ghost"
          size="icon"
          class="w-6 h-6 p-2 bg-primary text-white rounded-full z-10"
          @click="toggleSidebar"
        >
          <Icon
            icon="tabler:dots"
            style="
              color: #fff !important;
              height: 18px !important;
              width: 18px !important;
            "
          />
        </Button>
      </div>
    </div>

    <!-- Título centrado -->
    <h1 class="text-xl font-semibold text-start ps-2 pb-2">{{ title }}</h1>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { useSidebar } from "@/components/ui/sidebar";

const { toggleSidebar } = useSidebar();

defineProps({
  title: {
    type: String,
    required: true,
  },
  showBackButton: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["goBack"]);
</script>
