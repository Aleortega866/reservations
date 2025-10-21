<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-background border-b">
      <div class="flex items-center justify-between p-4">
        <button @click="goBack" class="p-2">
          <Icon
            icon="ion:arrow-back"
            width="24"
            height="24"
            class="text-muted-foreground"
          />
        </button>
        <h1 class="text-lg font-semibold">Material Didáctico</h1>
        <div class="w-9"></div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="p-4 flex-1">
      <!-- Tabs de navegación -->
      <div class="mb-6">
        <div class="flex border-b">
          <Button
            variant="ghost"
            @click="materialTab = 'didactic'"
            :class="materialTab === 'didactic' ? 'border-b-2 border-primary' : ''"
            class="rounded-none"
          >
            Material Didáctico
          </Button>
          <Button
            variant="ghost"
            @click="materialTab = 'routes'"
            :class="materialTab === 'routes' ? 'border-b-2 border-primary' : ''"
            class="rounded-none"
          >
            Rutas Sugeridas
          </Button>
        </div>
      </div>

      <!-- Contenido del material didáctico -->
      <EducationalMaterialContent
        :tab="materialTab"
        @select-level="selectEducationalLevel"
        @select-floor="selectFloor"
      />
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation @open-chat="handleChatClick" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import EducationalMaterialContent from "@/components/reservations/EducationalMaterialContent.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";

// Estado reactivo
const materialTab = ref("didactic");

// Router
const router = useRouter();

// Funciones
const goBack = () => {
  router.back();
};

const handleChatClick = () => {
  console.log("Chat button clicked");
};

const selectEducationalLevel = (level) => {
  console.log("Nivel seleccionado:", level);
};

const selectFloor = (floor) => {
  console.log("Piso seleccionado:", floor);
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
