<template>
  <div class="fixed top-0 left-0 right-0 border-b-0 shadow-md bg-white z-40">
    <div
      class="grid grid-cols-3 gap-4 pb-4 px-2 transition-all duration-500 ease-in-out"
      :class="showLogo ? 'pt-4' : 'pt-4'"
    >
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

      <!-- Logo centrado con animación -->
      <div
        class="flex justify-center overflow-hidden transition-all duration-500 ease-in-out"
        :style="{
          height: showLogo ? '60px' : '0px',
        }"
      >
        <img
          src="/assets/logo-header.svg"
          alt="logo"
          class="w-20 h-auto transition-opacity duration-500 ease-in-out"
          :class="showLogo ? 'opacity-100' : 'opacity-0'"
        />
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
import { ref, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Icon } from "@iconify/vue";

const { toggleSidebar } = useSidebar();

defineProps({
  currentScreen: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  showBackButton: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["goBack"]);

// Estado para mostrar/ocultar el logo
const showLogo = ref(true);

// Función para manejar el scroll
const handleScroll = () => {
  const currentScrollY = window.scrollY;

  // Mostrar el logo SOLO si está en la parte superior (primeros 10px)
  if (currentScrollY <= 10) {
    showLogo.value = true;
  } else {
    // Si ha pasado los 10px, ocultar el logo
    showLogo.value = false;
  }
};

// Agregar listener al montar el componente
onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

// Remover listener al desmontar
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
